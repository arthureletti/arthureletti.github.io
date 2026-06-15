"""
╔══════════════════════════════════════════════════════════════════╗
║  MYCOCAPRIN : Module Cartographie                                ║
║  Visualisation géographique des cheptels et niveaux de positivité║
║  Intégration : ajouter l'onglet dans app.py (voir bas de fichier)║
╚══════════════════════════════════════════════════════════════════╝

DÉPENDANCES SUPPLÉMENTAIRES À INSTALLER :
    pip install pydeck geopy

INTÉGRATION DANS app.py :
    1. Importer ce module en haut de app.py :
           from cartographie import afficher_cartographie
    2. Ajouter un 4e onglet dans la déclaration st.tabs() :
           onglet_accueil, onglet_import, onglet_visu, onglet_carto = st.tabs([
               ":material/home: Accueil",
               ":material/upload_file: Importer",
               ":material/bar_chart: Visualisation & Analyses",
               ":material/map: Cartographie",           # ← NOUVEAU
           ])
    3. Ajouter le bloc with en fin d'app.py :
           with onglet_carto:
               df = charger_donnees()
               df_scores = charger_scores()
               afficher_cartographie(df, df_scores)
"""

import streamlit as st
import pandas as pd
import numpy as np
import plotly.express as px
import plotly.graph_objects as go
from typing import Tuple
import json
import os
from pathlib import Path
from datetime import date

# ── Cache disque du géocodage (les communes ne bougent pas) ──────────────────
# Persiste les coordonnées entre les sessions et les redémarrages : le géocodage
# (lent, via API) n'est fait qu'une seule fois dans toute la vie du projet.
_GEOCACHE_PATH = Path(__file__).parent.parent / "SQL" / "geocache.json"


def _charger_geocache() -> dict:
    try:
        if _GEOCACHE_PATH.exists():
            return json.loads(_GEOCACHE_PATH.read_text(encoding="utf-8"))
    except Exception:
        pass
    return {}


def _sauver_geocache(cache: dict) -> None:
    try:
        _GEOCACHE_PATH.parent.mkdir(parents=True, exist_ok=True)
        _GEOCACHE_PATH.write_text(json.dumps(cache, ensure_ascii=False), encoding="utf-8")
    except Exception:
        pass  # cache non critique : on continue même si l'écriture échoue


# ── Constantes charte Qualyse (répliquées pour autonomie du module) ──────────
COULEURS = {
    "bleu_marine": "#0D4F66",
    "turquoise":   "#2BA8B8",
    "vert_sauge":  "#9DBF8E",
    "orange":      "#F39200",
    "rouge":       "#C0504D",
    "gris_clair":  "#F0F4F5",
}

LIBELLES_CLASSES = {
    "A": "Toujours négatif",    "B": "Toujours positif",
    "C": "Nouveau positif",     "D": "Fort positif récurrent",
    "E": "Autre positif récurrent", "F": "Fort positif ponctuel",
    "G": "Autre positif ponctuel",  "H": "Ancien positif",
    "I": "Statut non défini",
}
COULEURS_CLASSES = {
    # Palette sûre daltoniens (axe bleu -> orange) : du bleu « sain » (A) au
    # brun-orangé « préoccupant » (B). Identique à celle de app.py.
    "A": "#1A6E8E", "H": "#4FA0BD", "C": "#8FC2D4", "F": "#EFD9A6",
    "G": "#F2B85C", "E": "#E8901F", "D": "#CC6A12", "B": "#8C3B06", "I": "#AEB6BB",
}

# ── Coordonnées de référence des départements couverts ───────────────────────
# Utilisées en fallback quand la géolocalisation échoue
COORDS_DEPT = {
    "79": (46.3240,  -0.4608),   # Deux-Sèvres (Niort)
    "86": (46.5802,   0.3404),   # Vienne (Poitiers)
    "16": (45.6490,   0.1560),   # Charente (Angoulême)
}
# Décalage aléatoire max autour du centre dept (degrés) pour éviter empilement
_JITTER = 0.25


# ════════════════════════════════════════════════════════════════
#  GÉOLOCALISATION
# ════════════════════════════════════════════════════════════════

# Table de correspondance statique commune → (lat, lon) pour les communes
# les plus fréquentes des depts 79/86. Évite les appels réseau répétés.
# Format : "commune_dept" (ex : "NIORT_79")
_COMMUNES_CONNUES: dict[str, Tuple[float, float]] = {
    # Deux-Sèvres (79)
    "NIORT_79":         (46.3240, -0.4608),
    "PARTHENAY_79":     (46.6490, -0.2476),
    "BRESSUIRE_79":     (46.8393, -0.4895),
    "MELLE_79":         (46.2237, -0.1450),
    "SAINT MAIXENT_79": (46.4134, -0.2045),
    "MAUZÉ_79":         (46.2000, -0.6800),
    "SECONDIGNY_79":    (46.6100, -0.4200),
    "CERIZAY_79":       (46.8200, -0.6700),
    "CHAMPDENIERS_79":  (46.4800, -0.4000),
    "COULONGES_79":     (46.2900, -0.5900),
    # Vienne (86)
    "POITIERS_86":      (46.5802,  0.3404),
    "CHATELLERAULT_86": (46.8185,  0.5448),
    "LOUDUN_86":        (47.0066,  0.0782),
    "MONTMORILLON_86":  (46.4272,  0.8694),
    "CIVRAY_86":        (46.1461,  0.2929),
    "LUSIGNAN_86":      (46.4300,  0.1200),
    "VIVONNE_86":       (46.4200,  0.2600),
    # Charente (16)
    "ANGOULEME_16":     (45.6490,  0.1560),
    "COGNAC_16":        (45.6946, -0.3264),
    "CONFOLENS_16":     (46.0149,  0.6655),
}


def _geocoder_un(commune: str, departement: str, cache: dict, api_ok: list):
    """
    Géocode UNE commune à partir de son CODE INSEE (département + numéro de
    commune). Dans la base, `departement` = 2 chiffres et `commune` = 3 chiffres
    (extraits du n° EDE) : le code INSEE complet est donc departement+commune
    (ex. 79 + 134 = 79134). On interroge l'API officielle geo.api.gouv.fr qui
    renvoie le centre exact de la commune : bien plus précis qu'une recherche
    textuelle.

    Ordre : cache disque → API par code INSEE → fallback (centre département).
    Le drapeau partagé `api_ok` évite d'enchaîner les timeouts si l'API ne
    répond pas. Tout résultat est mis en cache disque (jamais re-géocodé).
    """
    code_insee = f"{str(departement).strip().zfill(2)}{str(commune).strip().zfill(3)}"
    key = code_insee

    # 1) Cache disque : instantané
    if key in cache:
        lat, lon = cache[key]
        return float(lat), float(lon)

    # 2) API officielle geo.api.gouv.fr : recherche par code INSEE (exacte)
    if api_ok[0]:
        try:
            import requests
            resp = requests.get(
                f"https://geo.api.gouv.fr/communes/{code_insee}",
                params={"fields": "centre", "format": "json"},
                timeout=2,
            )
            if resp.status_code == 200:
                data = resp.json()
                centre = data.get("centre", {})
                coords = centre.get("coordinates")  # [lon, lat]
                if coords:
                    lon, lat = float(coords[0]), float(coords[1])
                    cache[key] = [lat, lon]
                    return lat, lon
        except Exception:
            # L'API ne répond pas : on arrête de l'interroger pour les suivantes
            api_ok[0] = False

    # 3) Fallback : centre du département + léger bruit déterministe
    dept_lat, dept_lon = COORDS_DEPT.get(str(departement).zfill(2), (46.5, 0.0))
    rng = np.random.default_rng(abs(hash(key)) % (2**31))
    lat = dept_lat + rng.uniform(-_JITTER, _JITTER)
    lon = dept_lon + rng.uniform(-_JITTER, _JITTER)
    # Mise en cache du fallback aussi → prochain lancement instantané.
    cache[key] = [float(lat), float(lon)]
    return float(lat), float(lon)


def _geocoder_batch(pairs):
    """
    Géocode une liste de couples (commune, departement) en dédupliquant et en
    ne lisant/écrivant le cache disque qu'une seule fois.

    Retourne un dict {(commune, departement): (lat, lon)}.
    """
    cache = _charger_geocache()
    nb_avant = len(cache)
    api_ok = [True]   # drapeau partagé : passe à False au 1er échec API
    resultats = {}
    for commune, departement in pairs:
        resultats[(commune, departement)] = _geocoder_un(
            commune, departement, cache, api_ok
        )
    # Une seule écriture disque, si de nouvelles communes ont été ajoutées
    if len(cache) > nb_avant:
        _sauver_geocache(cache)
    return resultats


@st.cache_data(ttl=3600, show_spinner=False)
def preparer_geodf(
    df: pd.DataFrame,
    df_scores: pd.DataFrame,
    mycoplasme_filtre: str,
) -> pd.DataFrame:
    """
    Construit le GeoDataFrame enrichi par cheptel :
    - Niveau de positivité = moyenne des 6 derniers Ct sur les 3 dernières
      années. Un cheptel ayant moins de 6 résultats valides sur cette période
      est classé « Données insuffisantes » (gris), car son niveau ne peut pas
      être évalué de façon fiable.
    - Couleur et catégorie de risque
    - Latitude / longitude
    - Classe sanitaire depuis df_scores
    - Nombre de prélèvements, nom, commune, département
    Retourne un DataFrame prêt pour la visualisation.
    """
    if df.empty:
        return pd.DataFrame()

    # ── Filtrage mycoplasme ──────────────────────────────────────────────────
    df_myco = df[df["mycoplasme"] == mycoplasme_filtre].copy()
    if df_myco.empty:
        return pd.DataFrame()

    # ── Tri chronologique pour extraire les 6 derniers prélèvements ─────────
    df_myco["date_prelevement"] = pd.to_datetime(
        df_myco["date_prelevement"], errors="coerce"
    )

    # ── Restriction aux 3 dernières années ──────────────────────────────────
    # On se base sur la date de prélèvement la plus récente du jeu de données
    # (plus robuste que la date du jour si les données ne sont pas de l'année).
    date_max = df_myco["date_prelevement"].max()
    if pd.notna(date_max):
        seuil_3ans = date_max - pd.DateOffset(years=3)
        df_myco = df_myco[df_myco["date_prelevement"] >= seuil_3ans]
    df_myco = df_myco.sort_values(["num_ede", "date_prelevement"])

    if df_myco.empty:
        return pd.DataFrame()

    # ── Seuil minimum de résultats pour évaluer un cheptel ───────────────────
    MIN_RESULTATS = 6

    # ── Calcul du score par cheptel ──────────────────────────────────────────
    def _score(groupe: pd.DataFrame) -> pd.Series:
        valides = groupe["valeur_ct"].dropna()
        nb_total = len(valides)
        derniers = valides.tail(6)
        # Niveau = moyenne des 6 derniers Ct, uniquement si au moins 6 résultats
        if nb_total >= MIN_RESULTATS:
            ct_score = float(derniers.mean())
        else:
            ct_score = np.nan   # données insuffisantes → gris
        nb_positifs = int((valides < 40).sum())
        return pd.Series({
            "ct_score":      ct_score,
            "ct_min":        float(valides.min()) if nb_total > 0 else np.nan,
            "nb_prelevements": nb_total,
            "nb_positifs":   nb_positifs,
        })

    scores_cheptel = (
        df_myco.groupby("num_ede")
        .apply(_score)
        .reset_index()
    )

    # ── Métadonnées cheptel (nom, commune, département) ──────────────────────
    meta = (
        df_myco[["num_ede", "nom", "commune", "departement"]]
        .drop_duplicates("num_ede")
    )
    gdf = scores_cheptel.merge(meta, on="num_ede", how="left")

    # ── Jointure avec la classe sanitaire (une par cheptel) ──────────────────
    if not df_scores.empty:
        classes = df_scores[["num_ede", "classe"]].drop_duplicates("num_ede")
        gdf = gdf.merge(classes, on="num_ede", how="left")
    else:
        gdf["classe"] = "I"
    gdf["classe"] = gdf["classe"].fillna("I")
    gdf["libelle_classe"] = gdf["classe"].map(LIBELLES_CLASSES).fillna("Statut non défini")

    # ── Catégorie de risque et couleur carte ─────────────────────────────────
    def _categorie(ct):
        if pd.isna(ct):    return "Données insuffisantes (< 6 prélèvements)", [149, 165, 166]  # gris
        if ct < 25:        return "Très positif (Ct < 25)",   [192,  57,  43]   # rouge
        if ct < 35:        return "Positif modéré (25–35)",   [230, 126,  34]   # orange
        if ct < 40:        return "Faiblement positif (35–40)", [243, 156,  18]  # ambre
        return             "Négatif (Ct ≥ 40)",               [ 39, 174,  96]   # vert

    gdf[["categorie", "couleur_rgb"]] = gdf["ct_score"].apply(
        lambda ct: pd.Series(_categorie(ct))
    )
    # Couleur hex pour Plotly
    def _rgb_to_hex(rgb):
        if isinstance(rgb, list) and len(rgb) == 3:
            return f"#{rgb[0]:02X}{rgb[1]:02X}{rgb[2]:02X}"
        return "#999999"
    gdf["couleur_hex"] = gdf["couleur_rgb"].apply(_rgb_to_hex)

    # ── Géolocalisation (batch, dédupliquée, entièrement mise en cache) ──────
    pairs_uniques = (
        gdf[["commune", "departement"]]
        .drop_duplicates()
        .itertuples(index=False, name=None)
    )
    coords_par_commune = _geocoder_batch(list(pairs_uniques))
    gdf["lat"] = gdf.apply(
        lambda r: coords_par_commune[(r["commune"], r["departement"])][0], axis=1
    )
    gdf["lon"] = gdf.apply(
        lambda r: coords_par_commune[(r["commune"], r["departement"])][1], axis=1
    )

    # ── Formatage pour affichage tooltip ─────────────────────────────────────
    gdf["ct_score_str"] = gdf["ct_score"].apply(
        lambda v: f"{v:.1f}" if not pd.isna(v) else "N/A"
    )
    gdf["taux_positif_str"] = gdf.apply(
        lambda r: (
            f"{100*r['nb_positifs']/r['nb_prelevements']:.0f}%"
            if r["nb_prelevements"] > 0 else "N/A"
        ),
        axis=1,
    )

    return gdf


# ════════════════════════════════════════════════════════════════
#  FONCTION PRINCIPALE : ONGLET CARTOGRAPHIE
# ════════════════════════════════════════════════════════════════


@st.cache_data(ttl=3600, show_spinner=False)
def _preparer_positions(df: pd.DataFrame) -> pd.DataFrame:
    """
    Géolocalise chaque cheptel (une ligne par cheptel) et renvoie un DataFrame
    avec num_ede, nom, commune, departement, lat, lon. Le géocodage est mis en
    cache sur disque (les communes ne bougent pas) : rapide après le 1er appel.
    """
    meta = (df[["num_ede", "nom", "commune", "departement"]]
            .drop_duplicates("num_ede").copy())
    pairs = list(meta[["commune", "departement"]]
                 .drop_duplicates().itertuples(index=False, name=None))
    coords = _geocoder_batch(pairs)
    meta["lat"] = meta.apply(
        lambda r: coords[(r["commune"], r["departement"])][0], axis=1)
    meta["lon"] = meta.apply(
        lambda r: coords[(r["commune"], r["departement"])][1], axis=1)
    return meta


@st.cache_data(ttl=3600, show_spinner=False)
def classes_par_session(df: pd.DataFrame) -> pd.DataFrame:
    """
    Calcule la classe sanitaire (A-I) de CHAQUE cheptel A CHAQUE session.

    Règle identique à celle de la base de données (``_inp_clasifier``) :
    pour chaque session, on prend le Ct minimum toutes cibles confondues ;
    la fenêtre de classement retient les 6 sessions les plus récentes
    jusqu'à la session courante, RESTREINTES aux 3 dernières années
    (année du jour moins 3). La règle de scoring A-I est ensuite appliquée
    sur ces valeurs (la plus récente d'abord).

    Retourne un DataFrame [session_label, num_ede, classe]. Une classe n'est
    définie pour une session que si le cheptel possède au moins 6 sessions
    exploitables (sur les 3 dernières années) jusqu'à celle-ci.
    """
    from code_BD import classer_6_valeurs
    d = df.dropna(subset=["valeur_ct"])
    if d.empty:
        return pd.DataFrame(columns=["session_label", "num_ede", "classe"])
    # Ct minimum par (cheptel, session), toutes cibles confondues
    g = d.groupby(["num_ede", "session_label"])["valeur_ct"].min().reset_index()
    sessions_ordre = sorted(g["session_label"].unique())
    rows = []
    for ede, sub in g.groupby("num_ede"):
        serie = sub.set_index("session_label")["valeur_ct"]
        sess_ede = [s for s in sessions_ordre if s in serie.index]
        for i, s in enumerate(sess_ede):
            # Fenêtre GLISSANTE de 3 ans ANCRÉE SUR LA SESSION COURANTE s :
            # on retient les sessions jusqu'à s dont l'année est dans les 3 ans
            # précédant s, puis les 6 plus récentes. Ainsi une session ancienne
            # (ex. 2019) est classée dès qu'elle dispose de 6 sessions sur
            # 2017-2019, indépendamment de la date du jour.
            annee_s = int(str(s).split("_serie")[0])
            recentes = [x for x in sess_ede[:i + 1]
                        if int(str(x).split("_serie")[0]) >= annee_s - 3]
            fenetre = recentes[-6:]
            vals = [serie[x] for x in reversed(fenetre)]      # plus récente d'abord
            cl = classer_6_valeurs(vals)
            if cl is not None:
                rows.append({"session_label": s, "num_ede": ede, "classe": cl})
    return pd.DataFrame(rows)


def _carte_par_classe(df: pd.DataFrame, positions: pd.DataFrame) -> None:
    """
    Carte des cheptels colorés selon leur classe sanitaire, AVEC un curseur de
    session : on visualise la classe de chaque cheptel session après session
    (la dernière frame = situation la plus récente).
    """
    cps = classes_par_session(df)
    if cps.empty:
        st.info("Pas assez de sessions pour classer les cheptels "
                "(6 sessions minimum par cheptel).")
        return

    g = cps.merge(positions[["num_ede", "lat", "lon", "nom", "commune"]],
                  on="num_ede", how="left")
    g["libelle_classe"] = g["classe"].map(LIBELLES_CLASSES).fillna("-")
    g = g.sort_values("session_label")

    couleurs = dict(COULEURS_CLASSES)
    ordre = list(LIBELLES_CLASSES.keys())
    sessions = sorted(g["session_label"].unique())

    # Forcer toutes les classes présentes dans la légende, sur chaque frame
    manquantes = [c for c in ordre if c not in set(g["classe"].unique())]
    if manquantes:
        fict = pd.DataFrame([
            {"session_label": s, "num_ede": "", "classe": c, "lat": np.nan,
             "lon": np.nan, "nom": "", "commune": "",
             "libelle_classe": LIBELLES_CLASSES.get(c, "")}
            for s in sessions for c in manquantes
        ])
        g = pd.concat([g, fict], ignore_index=True)

    fig = px.scatter_mapbox(
        g, lat="lat", lon="lon", color="classe",
        animation_frame="session_label",
        color_discrete_map=couleurs,
        category_orders={"classe": ordre, "session_label": sessions},
        hover_name="nom",
        hover_data={"num_ede": True, "commune": True, "libelle_classe": True,
                    "classe": False, "lat": False, "lon": False,
                    "session_label": False},
        labels={"num_ede": "N° EDE", "commune": "Commune",
                "libelle_classe": "Classe sanitaire", "classe": "Classe"},
        zoom=7,
        center={"lat": float(positions["lat"].mean()),
                "lon": float(positions["lon"].mean())},
        mapbox_style="carto-positron", height=600,
    )
    fig.update_traces(marker=dict(size=12))
    fig.update_layout(
        paper_bgcolor="#FFFFFF", font=dict(color="#262730"),
        margin=dict(t=10, b=10, l=0, r=0),
        legend=dict(title="Classe sanitaire", bgcolor="rgba(255,255,255,0.9)",
                    bordercolor="#CCCCCC", borderwidth=1,
                    yanchor="top", y=0.99, xanchor="left", x=0.01),
    )
    st.plotly_chart(fig, use_container_width=True, theme=None)
    st.caption("Déplacez le curseur (ou lancez la lecture) pour suivre la classe "
               "sanitaire des cheptels session après session. La dernière position "
               "du curseur correspond à la situation la plus récente.")


def _carte_animee_cible(df: pd.DataFrame, positions: pd.DataFrame) -> None:
    """
    Carte animée (curseur par session) de la cible la plus positive de chaque
    cheptel : pour chaque session, on retient pour chaque cheptel la cible dont
    le Ct est le plus faible (la plus positive), et on n'affiche que les
    cheptels effectivement positifs (Ct < 40) cette session-là.
    """
    d = df.dropna(subset=["valeur_ct"]).copy()
    if d.empty:
        st.info("Aucune donnée exploitable pour cette carte.")
        return

    # ── Règle métier : 2 cibles testées ou 4 ? ───────────────────────────────
    # Les 3 sous-populations de mycoïdes (capri, capricolum, putréfaciens) ont la
    # MÊME valeur partout  => seul « mycoïdes » a réellement été testé : on les
    # regroupe sous une cible unique « M. mycoïdes » et la légende n'affiche que
    # 2 cibles (mycoïdes, agalactiae).
    # Si elles DIFFÈRENT quelque part => les 4 cibles ont été testées séparément :
    # on les distingue toutes les quatre dans la légende et sur la carte.
    SOUS_MYC = ["M. MYCOIDES CAPRI", "M. CAPRICOLUM", "M. PUTREFACIENS"]
    piv = d.pivot_table(index=["session_label", "num_ede"], columns="mycoplasme",
                        values="valeur_ct", aggfunc="first")
    sous_dispo = [c for c in SOUS_MYC if c in piv.columns]
    if len(sous_dispo) >= 2:
        egales = piv[sous_dispo].apply(lambda r: r.dropna().nunique() <= 1, axis=1)
        mode_2cibles = bool(egales.all())
    else:
        mode_2cibles = True

    if mode_2cibles:
        d["cible"] = d["mycoplasme"].map(
            lambda m: "M. mycoïdes" if m in SOUS_MYC
            else ("M. agalactiae" if m == "M. AGALACTIAE" else str(m)))
        # Les 3 sous-pops fusionnées : une seule valeur par (session, cheptel, cible)
        d = (d.groupby(["session_label", "num_ede", "cible"], as_index=False)["valeur_ct"]
             .min())
        CIBLES_COULEURS = {"M. mycoïdes": "#D55E00", "M. agalactiae": "#0072B2"}
    else:
        JOLI = {"M. MYCOIDES CAPRI": "M. mycoïdes capri", "M. CAPRICOLUM": "M. capricolum",
                "M. PUTREFACIENS": "M. putréfaciens", "M. AGALACTIAE": "M. agalactiae"}
        d["cible"] = d["mycoplasme"].map(lambda m: JOLI.get(m, str(m)))
        CIBLES_COULEURS = {"M. mycoïdes capri": "#D55E00", "M. capricolum": "#E69F00",
                           "M. putréfaciens": "#CC79A7", "M. agalactiae": "#0072B2"}
    for c in d["cible"].unique():
        CIBLES_COULEURS.setdefault(str(c), "#9DBF8E")
    ordre_cibles = list(CIBLES_COULEURS.keys())

    # Cible la plus positive (Ct minimum) par (session, cheptel) parmi les cibles effectives
    idx = d.groupby(["session_label", "num_ede"])["valeur_ct"].idxmin()
    pp = d.loc[idx, ["session_label", "num_ede", "cible", "valeur_ct"]].copy()
    pp = pp[pp["valeur_ct"] < 40]   # uniquement les cheptels positifs
    if pp.empty:
        st.info("Aucun cheptel positif à afficher sur la période.")
        return

    pp = pp.merge(positions[["num_ede", "lat", "lon", "nom", "commune"]],
                  on="num_ede", how="left")
    pp = pp.sort_values("session_label")   # ordre chronologique des frames
    pp["valeur_ct"] = pp["valeur_ct"].round(1)

    # Pour que la LÉGENDE affiche toujours les 4 cibles (même celles qui ne sont
    # jamais « la plus positive »), on injecte une ligne fictive par cible
    # manquante, sans coordonnées (lat/lon = NaN) : aucun point ne s'affiche sur
    # la carte, mais px crée bien une trace (donc une entrée de légende) pour
    # chaque cible, et de façon cohérente sur toutes les frames de l'animation.
    premiere_session = sorted(pp["session_label"].unique())[0]
    manquantes = [c for c in ordre_cibles if c not in set(pp["cible"].unique())]
    if manquantes:
        sessions = sorted(pp["session_label"].unique())
        fictives = pd.DataFrame([
            {"session_label": s, "num_ede": "", "cible": c,
             "valeur_ct": np.nan, "lat": np.nan, "lon": np.nan,
             "nom": "", "commune": ""}
            for s in sessions for c in manquantes
        ])
        pp = pd.concat([pp, fictives], ignore_index=True)

    fig = px.scatter_mapbox(
        pp, lat="lat", lon="lon", color="cible",
        animation_frame="session_label",
        category_orders={"cible": ordre_cibles,
                         "session_label": sorted(pp["session_label"].unique())},
        color_discrete_map=CIBLES_COULEURS,
        hover_name="nom",
        hover_data={"num_ede": True, "commune": True, "valeur_ct": True,
                    "lat": False, "lon": False, "session_label": False},
        labels={"num_ede": "N° EDE", "commune": "Commune",
                "valeur_ct": "Ct (cible la plus positive)",
                "cible": "Cible la plus positive"},
        zoom=7,
        center={"lat": float(positions["lat"].mean()),
                "lon": float(positions["lon"].mean())},
        mapbox_style="carto-positron", height=600,
    )
    fig.update_traces(marker=dict(size=13))

    fig.update_layout(
        paper_bgcolor="#FFFFFF", font=dict(color="#262730"),
        margin=dict(t=10, b=10, l=0, r=0),
        legend=dict(title="Cible la plus positive", bgcolor="rgba(255,255,255,0.9)",
                    bordercolor="#CCCCCC", borderwidth=1,
                    yanchor="top", y=0.99, xanchor="left", x=0.01),
    )
    st.plotly_chart(fig, use_container_width=True, theme=None)
    st.caption(
        "Déplacez le curseur ou utilisez le bouton de lecture pour voir évoluer, "
        "session après session, la cible la plus positive de chaque cheptel. "
        "Seuls les cheptels positifs (Ct < 40) sont affichés."
    )


def afficher_changement_classe(df: pd.DataFrame, positions: pd.DataFrame):
    """
    Affiche le tableau des cheptels ayant changé de classe entre deux sessions
    (choisies par l'utilisateur, par défaut les deux plus récentes).

    Parameters
    ----------
    df : pandas.DataFrame
        Résultats à plat (au moins ``num_ede``, ``session_label``, ``valeur_ct``).
    positions : pandas.DataFrame
        Informations par cheptel : ``num_ede``, ``nom``, ``commune``, ``departement``.

    Returns
    -------
    tuple
        ``(tableau, session_avant, session_apres)`` où ``tableau`` est un
        DataFrame prêt à exporter (ou ``None`` si rien à comparer/afficher).
    """
    cps = classes_par_session(df)
    if cps.empty:
        st.info("Pas assez de sessions pour comparer les classes "
                "(6 sessions minimum par cheptel).")
        return None, None, None
    sessions = sorted(cps["session_label"].unique())
    if len(sessions) < 2:
        st.info("Au moins deux sessions classées sont nécessaires pour comparer.")
        return None, None, None

    c1, c2 = st.columns(2)
    with c1:
        s_av = st.selectbox("Session de référence (avant)", sessions,
                            index=len(sessions) - 2, key="chg_avant")
    with c2:
        s_ap = st.selectbox("Session comparée (après)", sessions,
                            index=len(sessions) - 1, key="chg_apres")

    av = cps[cps["session_label"] == s_av].set_index("num_ede")["classe"]
    ap = cps[cps["session_label"] == s_ap].set_index("num_ede")["classe"]
    communs = av.index.intersection(ap.index)
    lignes = [{"num_ede": e, "cl_av": av[e], "cl_ap": ap[e]}
              for e in communs if av[e] != ap[e]]

    if not lignes:
        st.info(f"Aucun cheptel n'a changé de classe entre {s_av} et {s_ap}.")
        return None, s_av, s_ap

    res = pd.DataFrame(lignes).merge(
        positions[["num_ede", "nom", "commune", "departement"]],
        on="num_ede", how="left")
    col_av = f"Classe : {s_av}"
    col_ap = f"Classe : {s_ap}"
    res[col_av] = res["cl_av"].map(lambda c: f"{c} · {LIBELLES_CLASSES.get(c, c)}")
    res[col_ap] = res["cl_ap"].map(lambda c: f"{c} · {LIBELLES_CLASSES.get(c, c)}")
    res = res.rename(columns={"num_ede": "N° EDE", "nom": "Cheptel",
                              "commune": "Commune", "departement": "Dépt"})
    res = res[["N° EDE", "Cheptel", "Commune", "Dépt", col_av, col_ap]]

    st.caption(f"{len(res)} cheptel(s) ont changé de classe entre {s_av} et {s_ap}.")
    st.dataframe(res.reset_index(drop=True), use_container_width=True,
                 hide_index=True, height=min(420, 35 * (len(res) + 1) + 10))
    return res, s_av, s_ap


def afficher_cartographie(df: pd.DataFrame, df_scores: pd.DataFrame) -> None:
    """
    Onglet Cartographie de CapriTrack.

    - Carte des cheptels par classe sanitaire (une classe par cheptel).
    - Carte animée (curseur par session) de la cible la plus positive par cheptel.
    - Tableau des cheptels ayant changé de classe entre les deux dernières sessions.

    Paramètres
    ----------
    df         : DataFrame issu de charger_donnees() : résultats à plat
    df_scores  : DataFrame issu de charger_scores()  : classe par cheptel (A→I)
    """
    st.markdown('<div class="section-titre">Cartographie des cheptels</div>',
                unsafe_allow_html=True)

    if df.empty:
        st.warning("Aucune donnée disponible. Importez d'abord des résultats PCR.")
        return

    # Filtre territoire (s'applique à tout l'onglet)
    zones = {"79": "Deux-Sèvres (79)", "16": "Deux-Sèvres (79)", "86": "Vienne (86)"}
    df = df.copy()
    df["zone"] = df["departement"].map(lambda d: zones.get(d, f"Autre ({d})"))
    zones_dispo = sorted(df["zone"].unique())
    st.sidebar.markdown("---")
    st.sidebar.markdown("### Filtres : Cartographie")
    zones_sel = st.sidebar.multiselect("Territoire", zones_dispo,
                                       default=zones_dispo, key="carto_zones")
    if zones_sel:
        df = df[df["zone"].isin(zones_sel)]
    if df.empty:
        st.warning("Aucun cheptel pour ces filtres.")
        return

    with st.spinner("Géolocalisation des cheptels…"):
        positions = _preparer_positions(df)

    if positions.empty:
        st.warning("Aucun cheptel à localiser.")
        return

    # ── Carte 1 : par classe sanitaire, animée par session ──────────────────
    st.markdown("#### Cheptels par classe sanitaire (animation par session)")
    st.caption("Chaque point est un cheptel, coloré selon sa classe (calculée sur les "
               "6 dernières sessions ≤ 3 ans). Déplacez le curseur pour suivre "
               "l'évolution session après session.")
    _carte_par_classe(df, positions)

    # ── Carte 2 : cible la plus positive par cheptel, animée par session ─────
    st.markdown("---")
    st.markdown("#### Cible la plus positive par cheptel (animation par session)")
    _carte_animee_cible(df, positions)

    # ── Note de bas de page ──────────────────────────────────────────────────
    st.caption(
        "Chaque cheptel est placé au centre de sa commune (déterminée à partir du "
        "code INSEE contenu dans le n° EDE, via l'API officielle geo.api.gouv.fr). "
        "Un point représente donc la commune de l'élevage, pas sa position GPS exacte : "
        "deux élevages d'une même commune apparaissent au même endroit. Si l'API n'est "
        "pas joignable, le point est approché au centre du département."
    )
