import re
import sqlite3
import pandas as pd
import unicodedata as uni
import os
from pathlib import Path
from erreurs import (
    ErreurFichierIntrouvable,
    ErreurColonneManquante,
    ErreurDateIntrouvable,
    ErreurDatesInvalides,
    ErreurInitialisationBase,
)


# Chemin vers le fichier SQL de création des tables
# (remonte d'un niveau depuis script/ pour atteindre SQL/)
SQL_PATH = Path(__file__).parent.parent / "SQL" / "create_tables.sql"


def _to_ascii(s: str) -> str:
    """
    Normalisation forte : suppression des caractères spéciaux,
    mise en majuscules, suppression des espaces.

    Paramètres
    ----------
    s : str
        Chaîne à normaliser.

    Retourne
    --------
    str
        Chaîne normalisée sans accents, en majuscules et sans espaces.
    """
    return (
        uni.normalize("NFD", s)
        .encode("ascii", "ignore")
        .decode("ascii")
        .upper()
        .replace(" ", "")
    )


def _to_ascii2(s: str) -> str:
    """
    Normalisation moyenne : suppression des caractères spéciaux,
    mise en majuscules, conservation des espaces internes (strip uniquement).

    Paramètres
    ----------
    s : str
        Chaîne à normaliser.

    Retourne
    --------
    str
        Chaîne normalisée sans accents, en majuscules, espaces de bord retirés.
    """
    return (
        uni.normalize("NFD", s)
        .encode("ascii", "ignore")
        .decode("ascii")
        .strip()
        .upper()
    )




# ---------------------------------------------------------------
# VÉRIFICATION DES DATES
# ---------------------------------------------------------------

def detecter_colonne_date(df: pd.DataFrame) -> str | None:
    """
    Détecte automatiquement la colonne date dans un DataFrame normalisé.

    Stratégie en 3 passes (ordre de priorité) :
      1. Colonne déjà au format datetime64
      2. Colonne dont le nom normalisé contient 'DATE' ou 'PREL'
         ET dont les valeurs sont des entiers dans la plage serial Excel
         (1 → ~60 000, soit 1900-01-01 → 2064)
      3. Colonne texte dont plus de 80 % des valeurs sont parseable en date

    Retourne le nom de la colonne ou None si aucune n'est trouvée.
    """
    # 1. Déjà typée datetime
    for col in df.columns:
        if pd.api.types.is_datetime64_any_dtype(df[col]):
            return col

    # 2. Colonne numérique avec nom évocateur + plage serial Excel
    for col in df.columns:
        nom = _to_ascii(str(col))
        if "DATE" not in nom and "PREL" not in nom:
            continue
        if not pd.api.types.is_numeric_dtype(df[col]):
            continue
        vals = df[col].dropna()
        if vals.empty:
            continue
        if vals.between(1, 60_000).mean() > 0.9:
            return col

    # 2b. Colonne TEXTE dont le nom évoque une date : on l'accepte même si
    #     beaucoup de cellules sont vides (les dates manquantes sont tolérées),
    #     du moment qu'elle contient quelques vraies dates.
    for col in df.columns:
        nom = _to_ascii(str(col))
        if ("DATE" in nom or "PREL" in nom) and not pd.api.types.is_numeric_dtype(df[col]):
            taux = pd.to_datetime(df[col], dayfirst=True, errors="coerce").notna().mean()
            if taux > 0.3:
                return col

    # 3. Colonne texte parseable en date
    meilleure_col, meilleur_taux = None, 0.0
    for col in df.select_dtypes(include=["object"]).columns:
        taux = pd.to_datetime(df[col], dayfirst=True, errors="coerce").notna().mean()
        if taux > meilleur_taux:
            meilleur_taux, meilleure_col = taux, col
    return meilleure_col if meilleur_taux > 0.8 else None


def verifier_dates(df: pd.DataFrame, col_date: str | None = None) -> pd.DataFrame:
    """
    Vérifie et convertit la colonne date d'un DataFrame normalisé.

    Gère deux formats de valeur :
      - Entier serial Excel (ex : 46096 → 2026-03-15)
      - Chaîne de caractères  (ex : '15/03/2026')

    Paramètres
    ----------
    df       : DataFrame issu de ImportDonnees.importer()
    col_date : nom exact de la colonne date.
               Si None, détection automatique via detecter_colonne_date().

    Retourne le DataFrame avec la colonne convertie en datetime64.

    Lève
    ----
    ValueError
        Si aucune colonne date n'est détectable et col_date est None.
    ValueError
        Si col_date est fourni mais absent du DataFrame.
    """
    if col_date is None:
        col_date = detecter_colonne_date(df)
        if col_date is None:
            # Aucune colonne date détectable : ce n'est pas bloquant. On crée une
            # colonne DATE PRELVMT vide (toutes les dates seront NULL en base) ;
            # l'année et la série suffisent à situer les prélèvements dans le temps.
            df["DATE PRELVMT"] = pd.NaT
            return df

    if col_date not in df.columns:
        raise ErreurColonneManquante(col_date)

    col = df[col_date]

    if pd.api.types.is_numeric_dtype(col):
        # Conversion serial Excel → datetime (origine : 30 déc 1899)
        df[col_date] = pd.to_datetime(
            col, unit="D", origin="1899-12-30", errors="coerce"
        )
    else:
        # Conversion chaîne → datetime
        df[col_date] = pd.to_datetime(col, dayfirst=True, errors="coerce")

    # Les dates non reconnues (cellules vides ou mal formées) sont laissées à NaT :
    # une date manquante n'est PAS bloquante (elle sera stockée à NULL en base).
    # On ne lève donc plus d'erreur ; l'interface signale simplement l'information.
    return df


# ---------------------------------------------------------------
# INITIALISATION DE LA BASE DE DONNÉES
# ---------------------------------------------------------------

def init_base_donnees(db_path: str, sql_path: Path | str = SQL_PATH) -> None:
    """
    Initialise la base de données SQLite en exécutant create_tables.sql.

    Comportement :
      - Si la base n'existe pas : SQLite la crée automatiquement.
      - Si les tables existent déjà : aucune action (CREATE TABLE IF NOT EXISTS).
      - Si le fichier .sql est introuvable : lève FileNotFoundError.

    Paramètres
    ----------
    db_path  : chemin vers le fichier .db SQLite à initialiser.
    sql_path : chemin vers create_tables.sql
               (défaut : SQL/create_tables.sql à la racine du projet).

    Lève
    ----
    FileNotFoundError
        Si create_tables.sql est introuvable au chemin indiqué.
    sqlite3.Error
        En cas d'erreur d'exécution du script SQL.
    """
    sql_path = Path(sql_path)
    if not sql_path.exists():
        raise ErreurFichierIntrouvable("SQL", str(sql_path))

    sql = sql_path.read_text(encoding="utf-8")

    conn = sqlite3.connect(db_path)
    try:
        conn.executescript(sql)
        conn.commit()
    except sqlite3.Error as e:
        raise ErreurInitialisationBase(e) from e
    finally:
        conn.close()

def _normaliser_colonnes_pcr(df: pd.DataFrame) -> pd.DataFrame:
    val_corect = {
        r"MYCOIDES(?=CAPRI)": "M. MYCOIDES CAPRI",
        r"MYCOIDES(?!CAPRI)": "M. MYCOIDES GENERIQUE",
        r"CAPRICOLUM": "M. CAPRICOLUM",
        r"PUTREFACIENS": "M. PUTREFACIENS",
        r"AGALACTIAE": "M. AGALACTIAE",
    }
    for col in df.columns:
        col_norm= _to_ascii(col)
        if not re.search(r"MELANGE", col_norm):
            for pat,lib in val_corect.items():
                if re.search(pat,col_norm):
                    df.rename(columns={col: lib},inplace=True)
                    break
    return df

class ImportDonnees:
    """
    Classe d'import et de normalisation de fichiers Excel de résultats PCR.

    Le chemin du fichier est passé à l'instanciation. La méthode publique
    `importer()` orchestre l'ensemble du traitement et retourne le DataFrame
    final. L'attribut `df` conserve le résultat après import.

    Attributs
    ---------
    chemin : str
        Chemin vers le fichier Excel à importer.
    df : pd.DataFrame | None
        DataFrame résultant après appel de `importer()`. None avant.
    est79 : bool | None
        True si le fichier appartient au département 79. None avant import.
    """

    def __init__(self, chemin: str):
        self.chemin: str = chemin
        self.df: pd.DataFrame | None = None
        self.est79: bool | None = None

    def importer(self) -> pd.DataFrame:
        """
        Orchestre l'import complet du fichier Excel.

        Lit le fichier, détecte les en-têtes dynamiquement, applique
        les ajustements spécifiques au département 79 si nécessaire,
        puis normalise le contenu. Le résultat est stocké dans `self.df`
        et retourné.

        Retourne
        --------
        pd.DataFrame
            DataFrame normalisé et recadré.

        Lève
        ----
        FileNotFoundError
            Si le fichier est introuvable.
        ValueError
            Si la colonne "Numéro d'ordre" est introuvable dans le fichier.
        """
        if not os.path.isfile(self.chemin):
            raise FileNotFoundError("Fichier introuvable : " + self.chemin)

        self.df = pd.read_excel(self.chemin, header=None)

        self._test_79()  # CORRECTION 1 : appel manquant

        index_1ere_ligne, index_1ere_colonne = self._1ere_ligne()

        if self.est79:
            self._ajustement79(index_1ere_ligne)

        # Normalisation des noms de colonnes avant affectation
        self.df.iloc[index_1ere_ligne] = self.df.iloc[index_1ere_ligne].apply(
            lambda x: _to_ascii2(str(x))
        )
        self.df.columns = self.df.iloc[index_1ere_ligne].tolist()

        # Recadrage du DataFrame
        self.df = self.df.iloc[index_1ere_ligne + 1:, index_1ere_colonne:].reset_index(drop=True)

        self._normalisation()
        if self.est79:
            self._traiter_melanges()
        self._verifier_dates()
        self.df=_normaliser_colonnes_pcr(self.df)
        # Matrice (type d'échantillon) : certains fichiers de production ne
        # contiennent pas cette colonne (elle est implicite). On la crée alors
        # avec une valeur par défaut, modifiable au moment de l'import.
        # Matrice (type d'échantillon) : si la colonne est absente OU contient
        # des cellules vides, on applique « Lait de tank » par défaut.
        if "MATRICE" not in self.df.columns:
            self.df["MATRICE"] = "Lait de tank"
        else:
            vide = self.df["MATRICE"].isna() | (
                self.df["MATRICE"].astype(str).str.strip().isin(["", "nan", "None"]))
            self.df.loc[vide, "MATRICE"] = "Lait de tank"
        # On ne supprime QUE les lignes entièrement vides (bruit en fin de
        # fichier). Les lignes avec un n° EDE manquant ou invalide sont
        # conservées : l'interface les signalera pour que l'utilisateur les
        # corrige ou les supprime avant l'import.
        self.df = self.df.dropna(how="all").reset_index(drop=True)
        # Nettoyage du n° EDE : retire le « .0 » apparu quand une cellule vide
        # force pandas à lire la colonne en flottant (86036066.0 -> 86036066),
        # et normalise les valeurs manquantes en chaîne vide (repérables ensuite
        # par l'interface, qui bloquera l'import tant qu'elles ne sont pas
        # corrigées ou supprimées).
        ede = self.df["N EDE"]
        ede = ede.where(ede.notna(), "")            # NA -> ""
        ede = (ede.astype(str)
               .str.replace(r"\.0$", "", regex=True)
               .str.strip()
               .replace({"nan": "", "None": "", "<NA>": "", "NaT": ""}))
        self.df["N EDE"] = ede
        return self.df

    def _test_79(self) -> None:
        """
        Teste si le fichier appartient au département 79 en cherchant
        "79" dans le nom du fichier uniquement (hors chemin).

        Pourra être complété par un test via le n° EDE.
        Affecte le résultat à self.est79.
        """
        nom_fichier = os.path.basename(self.chemin)
        self.est79 = True if "79" in nom_fichier else False

    def test_79et86(self) -> None:
        """
        Teste si le fichier appartient au département 79 et 86 en cherchant
        le nombre de EDE quin commence par 79/16 ou 86.

        renvoi tuple (bool 1 pour 79 , bool 2 pour 86)
        """
        series_ede = self.df["N EDE"]
        series_ede = self.df["N EDE"].astype(str).str[0:2]

        if ((series_ede=="79") | (series_ede=="16")).sum() > 6 and (series_ede=="86").sum()>6:
            return (True, True)
        elif ((series_ede=="79") | (series_ede=="16")).sum() >6:
            return (True, False)
        elif (series_ede=="86").sum()>6:
            return (False, True)
        else:
            return (False, False)

    def _1ere_ligne(self) -> tuple[int, int]:
        """
        Localise la ligne d'en-tête en cherchant "Numéro d'ordre"
        après normalisation forte dans chaque colonne de `self.df`.

        Retourne
        --------
        tuple[int, int]
            (index_ligne, index_colonne) de la cellule "Numéro d'ordre".

        Lève
        ----
        ValueError
            Si "Numéro d'ordre" est introuvable dans l'ensemble du fichier.
        """
        df_copy = self.df.copy()
        for index_col in range(len(df_copy.columns)):
            valeurs = df_copy.iloc[:, index_col].apply(
                lambda x: _to_ascii(str(x))
            ).tolist()
            try:
                index_ligne = valeurs.index("NUMEROD'ORDRE")
                return index_ligne, index_col
            except ValueError:
                continue
        raise ValueError("'Numéro d'ordre' introuvable dans le fichier.")

    def _ajustement79(self, index_1ere_ligne: int) -> None:
        """
        Renomme les colonnes de mélange dans les fichiers du département 79
        pour éviter les doublons de noms de colonnes.

        Préfixe "MELANGE" aux deux colonnes situées sous l'en-tête
        "PCR MELANGES X4" de la ligne de groupe.

        Paramètres
        ----------
        index_1ere_ligne : int
            Index de la ligne d'en-têtes (ligne "Numéro d'ordre").

        Lève
        ----
        ValueError
            Si index_1ere_ligne vaut 0 ou si "PCRMELANGESX4" est absent.
        """
        # Certains fichiers 79 n'ont pas de ligne de groupe « PCR MELANGES X4 »
        # au-dessus de l'en-tête (en-tête en position 0, deux cibles directes).
        # Ce n'est pas une erreur : il n'y a simplement aucun mélange à ajuster.
        if index_1ere_ligne < 1:
            return

        ligne_groupe = self.df.iloc[index_1ere_ligne - 1].apply(
            lambda x: _to_ascii(str(x))
        ).tolist()

        # Pas de bloc « PCR MELANGES X4 » dans la ligne de groupe : fichier 79
        # sans mélanges, il n'y a rien à préfixer.
        if "PCRMELANGESX4" not in ligne_groupe:
            return

        index_pcr = ligne_groupe.index("PCRMELANGESX4")
        self.df.iloc[index_1ere_ligne, index_pcr] = (
            "MELANGE" + str(self.df.iloc[index_1ere_ligne, index_pcr])
        )
        self.df.iloc[index_1ere_ligne, index_pcr + 1] = (
            "MELANGE" + str(self.df.iloc[index_1ere_ligne, index_pcr + 1])
        )


    def _normalisation(self) -> None:
        """
        Normalise le contenu de `self.df` en place.
        - Normalisation des chaînes (accents, casse, espaces de bord)
        - Remplacement des valeurs vides / invalides par NaN
        - Colonnes PCR : NEG → 40, puis conversion forcée en float
        - Renommage de la colonne date
        Ct=40 est la convention pour un résultat négatif en PCR temps réel.
        """
        INVALIDES = {"", "NAN", "NONE", "N/A", "NA", "-"}
        # Motifs des colonnes PCR (sur nom normalisé sans espaces ni accents).
        # On ne force PAS « CAPRI » sur mycoïdes : un fichier « mycoïdes
        # générique » a une colonne PCR M. mycoïdes sans CAPRI, qui doit
        # quand même être typée numérique. Sinon elle reste en texte et la
        # détection de date l'attrape par erreur (valeurs 40, 38… vues comme
        # des dates) puis la renomme DATE PRELVMT, faisant disparaître la cible.
        COLONNES_PCR = [
            r"MYCOIDES",
            r"CAPRICOLUM",
            r"PUTREFACIENS",
            r"AGALACTIAE",
        ]

        for col in self.df.columns:

            # 1. Normalisation des chaînes (accents → ASCII, majuscules, strip)
            self.df[col] = self.df[col].apply(
                lambda x: _to_ascii2(x) if isinstance(x, str) else x
            )

            # 2. Valeurs invalides → None (NaN pandas)
            #    Fait APRÈS _to_ascii2 car "NaN" → "NAN", "None" → "NONE"
            self.df[col] = self.df[col].apply(
                lambda x: None if isinstance(x, str) and x in INVALIDES else x
            )

            # 3. Colonnes PCR : NEG → 40, puis typage numérique.
            #    Les colonnes mélange (« MELANGE … ») sont traitées séparément
            #    par _traiter_melanges() : on ne les type PAS ici, sinon leurs
            #    valeurs « MELANGE N / NEG » deviendraient NaN.
            nom_norm = _to_ascii(str(col))
            if "MELANGE" not in nom_norm:
                for pat in COLONNES_PCR:
                    if re.search(pat, nom_norm):
                        self.df[col] = self.df[col].apply(
                            lambda x: 40 if x == "NEG" else x
                        )
                        self.df[col] = pd.to_numeric(self.df[col], errors="coerce")
                        break

        # 4. Renommage de la colonne date (fait après la boucle pour éviter
        #    de renommer en cours d'itération sur les colonnes)
        self.df.rename(
            columns={
                col: "DATE PRELVMT"
                for col in self.df.columns
                if col == _to_ascii2("Date de prélèvement")
            },
            inplace=True,
        )

        # Renommage de la colonne date vers le nom attendu par detecter_tt_col()
        col_date = detecter_colonne_date(self.df)
        if col_date and col_date != "DATE PRELVMT":
            self.df.rename(columns={col_date: "DATE PRELVMT"}, inplace=True)

    def _traiter_melanges(self) -> None:
        """
        Traite les colonnes mélanges X4 du département 79.

        Pour chaque cible PCR mélangée (M. mycoïdes, M. agalactiae) :

        - Mélange NEG  → force la colonne individuelle à 40 pour cet animal
                         (en cas de NaN dans la reprise individuelle)
        - Mélange POS  → la colonne individuelle contient déjà le résultat
                         de la reprise individuelle, rien à modifier
        - NaN          → animal testé individuellement, déjà correct

        Supprime les colonnes mélanges après traitement (elles ne sont plus
        nécessaires pour l'insertion en base).

        Doit être appelée après _normalisation() car les valeurs "NEG" y sont
        déjà converties en 40 dans les colonnes individuelles.
        """
        # Mapping : col mélange → col individuelle/reprise correspondante
        MAP_MELANGE = {
            "MELANGEM. MYCOIDES":   "M. MYCOIDES CAPRI",
            "MELANGEM. AGALACTIAE": "M. AGALACTIAE",
        }

        cols_a_supprimer = []

        for col_mel, col_ind in MAP_MELANGE.items():
            if col_mel not in self.df.columns:
                continue
            if col_ind not in self.df.columns:
                continue

            for idx, val in self.df[col_mel].items():
                if pd.isna(val):
                    continue

                # Format : "MELANGE N / NEG" ou "MELANGE N / 36"
                partie = str(val).split("/")[-1].strip()

                if partie == "NEG":
                    # Mélange négatif : tous les animaux du pool sont négatifs
                    self.df.at[idx, col_ind] = 40
                # Mélange positif : reprise individuelle déjà présente, rien à faire

            cols_a_supprimer.append(col_mel)

        if cols_a_supprimer:
            self.df.drop(columns=cols_a_supprimer, inplace=True)

    def _completer_cibles_manquantes(self) -> None:
        """
        Règle métier : certains rapports ne contiennent en pratique que 2 cibles
        renseignées (M. mycoïdes capri et M. agalactiae) au lieu des 4 habituelles.
        Dans ce cas, la valeur Ct de M. mycoïdes capri est répercutée sur
        M. capricolum et M. putrefaciens (qui partagent le même résultat).

        Deux situations sont gérées :
          1. la colonne capricolum/putrefaciens est ABSENTE du fichier ;
          2. la colonne est PRÉSENTE mais VIDE (modèle à 4 colonnes dont le labo
             ne remplit que 2) — c'est le cas le plus fréquent.

        Concrètement, pour chaque cible à compléter, on recopie la valeur de
        mycoïdes dans toutes les cellules manquantes (NA). Les valeurs déjà
        renseignées (vrais rapports à 4 cibles) ne sont jamais écrasées.
        """
        MYCOIDES    = "M. MYCOIDES CAPRI"
        A_COMPLETER = ["M. CAPRICOLUM", "M. PUTREFACIENS"]

        if MYCOIDES not in self.df.columns:
            return  # pas de colonne mycoïdes : rien à répercuter

        # On force le numérique pour que les cellules vides/texte deviennent NA
        mycoides_num = pd.to_numeric(self.df[MYCOIDES], errors="coerce")

        for cible in A_COMPLETER:
            if cible not in self.df.columns:
                # Colonne absente : on la crée intégralement depuis mycoïdes
                self.df[cible] = self.df[MYCOIDES]
            else:
                # Colonne présente : on complète uniquement les cellules vides
                cible_num = pd.to_numeric(self.df[cible], errors="coerce")
                self.df[cible] = cible_num.fillna(mycoides_num)

    def _verifier_dates(self) -> None:
        """
        Convertit la colonne date de self.df en datetime64 via verifier_dates().

        Appelée automatiquement par importer() après _normalisation().
        La colonne est détectée automatiquement (serial Excel ou texte).

        Lève
        ----
        ValueError
            Si aucune colonne date n'est détectable dans le fichier.
        """
        self.df = verifier_dates(self.df)

    def _trouver_session(self):
        """
        Tente de déduire automatiquement l'année et le numéro de série
        à partir du nom du fichier, puis à défaut, à partir de la première
        date de prélèvement présente dans les données.

        Stratégie pour l'ANNÉE :
          1. Année sur 4 chiffres (20xx) trouvée dans le nom du fichier ;
          2. Sinon, année de la première date de prélèvement (colonne DATE PRELVMT).

        Stratégie pour la SÉRIE :
          1. Nom de mois trouvé dans le nom du fichier
             (mars/avril → série 1, juin/juillet → série 2, octobre/novembre → série 3) ;
          2. Sinon, déduite du mois de la première date de prélèvement
             (mois 1-5 → série 1, 6-9 → série 2, 10-12 → série 3).

        Retourne
        --------
        tuple (annee, serie)
            Chacune des deux valeurs vaut None si elle n'a pas pu être déterminée.
        """
        # Mois → série (campagnes Qualyse : ~mars, ~juin, ~octobre)
        MOIS_SERIE = {
            "MARS": 1, "AVRIL": 1,
            "JUIN": 2, "JUILLET": 2,
            "OCTOBRE": 3, "NOVEMBRE": 3,
        }

        nom_fichier = os.path.basename(str(self.chemin)).upper()

        # ── ANNÉE ────────────────────────────────────────────────────────────
        annee = None
        m = re.search(r"20\d{2}", nom_fichier)          # année 20xx dans le nom
        if m is not None:
            annee = int(m.group())
        else:
            # Repli : année de la première date de prélèvement
            try:
                annee = int(self.df["DATE PRELVMT"].dropna().iloc[0].year)
            except (AttributeError, KeyError, IndexError, ValueError, TypeError):
                annee = None

        # ── SÉRIE ────────────────────────────────────────────────────────────
        serie = None
        for mois, num in MOIS_SERIE.items():            # nom de mois dans le nom
            if mois in nom_fichier:
                serie = num
                break
        if serie is None:
            # Repli : série déduite du mois de la première date de prélèvement
            try:
                mois_num = int(self.df["DATE PRELVMT"].dropna().iloc[0].month)
                if mois_num <= 5:
                    serie = 1
                elif mois_num <= 9:
                    serie = 2
                else:
                    serie = 3
            except (AttributeError, KeyError, IndexError, ValueError, TypeError):
                serie = None

        return annee, serie



    def detecter_PCR(self) -> dict:
        """
        Détecte les colonnes PCR présentes dans le DataFrame normalisé.

        Utilise une recherche regex sur le nom normalisé de chaque colonne
        pour rester robuste aux légères variations d'orthographe.

        Retourne
        --------
        dict avec :
          - "colonnes" : list[str]  — noms exacts des colonnes PCR trouvées
          - "nb"       : int        — 0, 2 ou 4
          - "valide"   : bool       — True si nb == 2 ou nb == 4
        """
        CIBLES = [
            (r"MYCOIDES",     "M. MYCOIDES CAPRI"),
            (r"CAPRICOLUM",   "M. CAPRICOLUM"),
            (r"PUTREFACIENS", "M. PUTREFACIENS"),
            (r"AGALACTIAE",   "M. AGALACTIAE"),
        ]
        colonnes_trouvees = []
        for col in self.df.columns:
            col_norm = _to_ascii(str(col))
            for pattern, _ in CIBLES:
                if re.search(pattern, col_norm):
                    colonnes_trouvees.append(col)
                    break
        nb = len(colonnes_trouvees)
        return {
            "colonnes": colonnes_trouvees,
            "nb":       nb,
            "valide":   nb in (2, 4),
        }

    def detecter_tt_col(self) -> dict:
        """
        Vérifie que toutes les colonnes nécessaires à l'import sont présentes
        dans le DataFrame normalisé.

        Colonnes obligatoires : N EDE, NOM EXPLOITANT, DATE PRELVMT, MATRICE.
        Colonnes PCR : 2 ou 4 colonnes détectées via detecter_PCR().

        Retourne
        --------
        dict avec :
          - "valide"    : bool       — True si tout est correct
          - "manquantes": list[str]  — colonnes obligatoires absentes
          - "pcr"       : dict       — résultat de detecter_PCR()
        """
        COLONNES_OBLIGATOIRES = ["N EDE", "NOM EXPLOITANT", "DATE PRELVMT", "MATRICE"]
        manquantes = [c for c in COLONNES_OBLIGATOIRES if c not in self.df.columns]
        pcr = self.detecter_PCR()
        return {
            "valide":     len(manquantes) == 0 and pcr["valide"],
            "manquantes": manquantes,
            "pcr":        pcr,
        }

    def etendre_colonnes_generiques(self,df):
        """
        A faire
        """
        if "M. MYCOIDES GENERIQUE" in df.columns:
            df["M. MYCOIDES CAPRI"]=df["M. MYCOIDES GENERIQUE"]
            df["M. CAPRICOLUM"] = df["M. MYCOIDES GENERIQUE"]
            df["M. PUTREFACIENS"] = df["M. MYCOIDES GENERIQUE"]
            df.drop(columns=["M. MYCOIDES GENERIQUE"], inplace=True)
        return df


if __name__ == "__main__":
    imp79 = ImportDonnees(r"../Modèle résultats département 79.xls")
    excel79 = imp79.importer()
    print(excel79.head())
    excel79.to_csv("excel-res-79.csv", encoding="latin1", sep=";", index=False)

    imp86 = ImportDonnees(r"../Modèle résultats département 86.xls")
    excel86 = imp86.importer()
    print(excel86.head())
    excel86.to_csv("excel-res-86.csv", encoding="latin1", sep=";", index=False)