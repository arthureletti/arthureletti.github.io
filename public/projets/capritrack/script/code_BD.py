from code_import import ImportDonnees
import sqlite3 as sql
import pandas as pd
from pathlib import Path
import re
from datetime import date
from erreurs import (
    ErreurDossierIntrouvable,
    ErreurConnexionBase,
    ErreurInsertionBase,
    ErreurColonneManquante,
)


def classer_6_valeurs(valeurs):
    """
    Applique le système de scoring A–I sur une liste de valeurs Ct ordonnées
    de la plus récente à la plus ancienne. Chaque valeur représente le Ct le
    plus faible d'une session (toutes cibles confondues).

    Retourne la lettre de classe (A–I), ou None si moins de 6 valeurs.

    Rappels seuils : Ct ≥ 40 = négatif ; Ct < 40 = positif ; Ct < 35 = fort positif.
    """
    serie = pd.Series(list(valeurs)[:6], dtype="float")
    if len(serie) < 6:
        return None
    # A : toujours négatif
    if (serie >= 40).sum() == 6:
        return "A"
    # B : toujours positif
    if (serie < 40).sum() == 6:
        return "B"
    # C : nouveau positif (dernier fort positif, les 5 antérieurs négatifs)
    if serie.iloc[0] < 35 and (serie.iloc[1:] >= 40).all():
        return "C"
    # D : fort positif récurrent
    if 3 <= (serie < 35).sum() <= 5:
        return "D"
    # E : autre positif récurrent
    if 3 <= (serie < 40).sum() <= 5:
        return "E"
    # H : ancien positif (4 derniers négatifs)
    if (serie.iloc[0:4] >= 40).all():
        return "H"
    # F : fort positif ponctuel
    if 1 <= (serie < 35).sum() <= 2:
        return "F"
    # G : autre positif ponctuel
    if 1 <= (serie < 40).sum() <= 2:
        return "G"
    # I : statut non défini
    return "I"


class DataBase_gestion:
    """
    Gère les opérations de connexion et d'insertion de données
    dans une base de données SQLite.

    Attributs
    ---------
    ch_db : str
        Chemin vers le fichier de base de données SQLite.
    con : sqlite3.Connection | None
        Objet de connexion SQLite, None si non connecté.
    """

    def __init__(self, ch_db):
        """
        Initialise la classe avec le chemin de la base de données.

        Paramètres
        ----------
        ch_db : str
            Chemin vers le fichier .db SQLite.
        """
        self.con = None
        self.ch_db = ch_db

    def connexion_db(self):
        """
        Ouvre une connexion à la base de données SQLite si elle n'est pas déjà ouverte.

        Lève
        ----
        FileNotFoundError
            Si le dossier parent du fichier .db n'existe pas.
        sqlite3.Error
            En cas d'échec de connexion.
        """
        if self.con is None:
            dossier = Path(self.ch_db).parent
            if not dossier.exists():
                raise ErreurDossierIntrouvable(dossier)
            try:
                con = sql.connect(self.ch_db)
                con.row_factory = sql.Row
                self.con = con
            except sql.Error as pb:
                self.con = None
                raise ErreurConnexionBase(self.ch_db, pb) from pb

    def fermer(self):
        """
        Ferme la connexion à la base de données si elle est ouverte.
        """
        if self.con:
            self.con.close()
            self.con = None



    def insertion_donnees(self, ch_excel):
        """
        Orchestre toutes les opérations d'insertion dans la base de données.

        Ouvre la connexion, importe les données depuis le fichier Excel,
        puis appelle les méthodes d'insertion pour chaque table.

        Paramètres
        ----------
        ch_excel : str
            Chemin vers le fichier Excel à importer.

        Lève
        ----
        Exception
            Toute exception levée par les sous-méthodes,
            après avoir effectué un rollback.
        """
        # Connexion à la base
        self.connexion_db()

        try:
            # pour l'insertion, stockage de l'annee et de la serie
            self.annee = None
            self.serie = None


            # Importe les données via la classe ImportDonnees
            imp = ImportDonnees(ch_excel)
            df = imp.importer()
            df = imp.etendre_colonnes_generiques(df)
            if self._inp_session(df) :
                self._inp_classes()
                self._inp_exploitation(df)
                self._inp_matrice(df)
                self._inp_prelevement(df)
                self._inp_resultat(df)
                self._inp_clasifier()

                self.con.commit()
            else:
                pass  # (anciennement un print, retiré : plantait sans console)

        except Exception as e:
            self.con.rollback()
            raise

    def _inp_session(self, df, annee=None, serie=None):
        """
        Insère une nouvelle session dans la table `session`.

        Si ``annee`` et ``serie`` sont fournis (mode GUI), aucune saisie
        interactive n'est demandée. Sinon (mode CLI), l'utilisateur est invité
        à les saisir au clavier.

        Paramètres
        ----------
        df : pandas.DataFrame
            DataFrame contenant les données importées (non utilisé directement
            mais conservé pour cohérence avec les autres méthodes d'insertion).
        annee : int | None
            Année de la session (ex : 2026). Si None, saisie interactive.
        serie : int | None
            Numéro de série (1, 2 ou 3). Si None, saisie interactive.

        Retourne
        --------
        bool : True si la session a été insérée, False si elle existait déjà.

        Lève
        ----
        ErreurInsertionBase
            En cas d'erreur lors de l'insertion en base.
        """
        try:
            # Récupère toutes les sessions existantes
            lst_session = self.con.execute("SELECT annee, numero_serie FROM session").fetchall()
            # Convertit chaque sqlite3.Row en liste [annee, serie]
            lst_session = [[int(ligne["annee"]), int(ligne["numero_serie"])] for ligne in lst_session]

            if annee is not None and serie is not None:
                # ── Mode GUI : paramètres passés directement ─────────────
                self.annee = int(annee)
                self.serie = int(serie)
            else:
                # ── Mode CLI : saisie interactive ────────────────────────
                while True:
                    try:
                        annee = input("Quelle année ? ")
                        if re.search("^[0-9]{4}$", annee) and int(annee) > 2000 and int(annee) <= date.today().year:
                            self.annee = int(annee)
                            break
                    except:
                        pass

                while True:
                    try:
                        serie = int(input("Quelle série ? "))
                        if serie in [1, 2, 3]:
                            self.serie = serie
                            break
                    except:
                        pass

            # Assure l'existence de la session SANS bloquer si elle existe déjà :
            # une même session (année, série) peut contenir les données de
            # plusieurs départements (79 et 86), importées séparément.
            self.con.execute(
                "INSERT OR IGNORE INTO session (annee, numero_serie) VALUES (?, ?)",
                (str(self.annee), self.serie)
            )
            return True

        except Exception as pb:
            raise ErreurInsertionBase("session", pb) from pb

    def compter_resultats_session(self, annee, serie, departements=None):
        """
        Compte les résultats déjà présents pour une session, éventuellement
        restreints à certains départements (codes à 2 chiffres, ex. ['79','16']).
        Sert à décider s'il faut proposer un écrasement à l'import.
        """
        annee = str(annee)
        serie = int(serie)
        if departements:
            marq = ",".join("?" * len(departements))
            q = (f"SELECT COUNT(*) FROM resultat r "
                 f"JOIN prelevement p ON r.id_prelevement = p.id_prelevement "
                 f"JOIN exploitant e ON p.num_ede = e.num_ede "
                 f"WHERE p.annee=? AND p.numero_serie=? AND e.departement IN ({marq})")
            return self.con.execute(q, (annee, serie, *departements)).fetchone()[0]
        q = ("SELECT COUNT(*) FROM resultat r "
             "JOIN prelevement p ON r.id_prelevement = p.id_prelevement "
             "WHERE p.annee=? AND p.numero_serie=?")
        return self.con.execute(q, (annee, serie)).fetchone()[0]

    def supprimer_session(self, annee, serie, departements=None):
        """
        Supprime les résultats et prélèvements d'une session, éventuellement
        restreints à certains départements (codes à 2 chiffres, ex. ['79','16']).

        La ligne de session n'est supprimée que s'il ne reste plus AUCUN
        prélèvement rattaché (par ex. après suppression du 86, le 79 peut
        subsister : la session est alors conservée).

        Les exploitants, matrices et mycoplasmes ne sont PAS supprimés (partagés).

        Paramètres
        ----------
        annee : int | str       Année de la session.
        serie : int             Numéro de série.
        departements : list|None Codes département à écraser (None = toute la session).

        Retourne
        --------
        int : le nombre de résultats supprimés.
        """
        try:
            annee = str(annee)
            serie = int(serie)

            # Prélèvements concernés (filtrés par département si demandé)
            if departements:
                marq = ",".join("?" * len(departements))
                lignes = self.con.execute(
                    f"SELECT p.id_prelevement FROM prelevement p "
                    f"JOIN exploitant e ON p.num_ede = e.num_ede "
                    f"WHERE p.annee=? AND p.numero_serie=? AND e.departement IN ({marq})",
                    (annee, serie, *departements),
                ).fetchall()
            else:
                lignes = self.con.execute(
                    "SELECT id_prelevement FROM prelevement WHERE annee=? AND numero_serie=?",
                    (annee, serie),
                ).fetchall()
            ids = [ligne["id_prelevement"] for ligne in lignes]

            nb_resultats = 0
            if ids:
                marqueurs = ",".join("?" * len(ids))
                cur = self.con.execute(
                    f"DELETE FROM resultat WHERE id_prelevement IN ({marqueurs})", ids)
                nb_resultats = cur.rowcount
                self.con.execute(
                    f"DELETE FROM prelevement WHERE id_prelevement IN ({marqueurs})", ids)

            # Ne supprimer la session que s'il ne reste plus aucun prélèvement
            reste = self.con.execute(
                "SELECT COUNT(*) FROM prelevement WHERE annee=? AND numero_serie=?",
                (annee, serie),
            ).fetchone()[0]
            if reste == 0:
                self.con.execute(
                    "DELETE FROM session WHERE annee=? AND numero_serie=?", (annee, serie))
            return nb_resultats

        except Exception as pb:
            raise ErreurInsertionBase("session (suppression)", pb) from pb

    def _inp_exploitation(self, df):
        """
        Insère les nouveaux exploitants dans la table `exploitant`.
        Met a jour les nom d'exploitant si le nom n'est pas renségné

        Récupère les numéros EDE déjà présents en base, filtre le DataFrame
        pour ne garder que les nouvelles entrées, puis les insère.

        Paramètres
        ----------
        df : pandas.DataFrame
            DataFrame contenant les données importées depuis le fichier Excel.
            Doit contenir les colonnes "N EDE" et "NOM EXPLOITANT".

        Lève
        ----
        Exception
            En cas d'erreur lors de l'insertion en base.
        """
        try:
            df = df.copy()
            # Un nom d'exploitant vide ou absent est stocké NULL (et non "" ni
            # NaN) afin que la complétion automatique plus bas (WHERE nom IS
            # NULL) puisse le renseigner lors d'un import ultérieur qui, lui,
            # contiendra le nom. Un nom manquant ne bloque pas l'import.
            if "NOM EXPLOITANT" in df.columns:
                vide = (df["NOM EXPLOITANT"].isna()
                        | (df["NOM EXPLOITANT"].astype(str).str.strip() == ""))
                df.loc[vide, "NOM EXPLOITANT"] = None

            # INSERT DES NOUVEAUX EDE
            # Récupère tous les numéros EDE (clé primaire) déjà présents dans la base
            lst_num_ede = self.con.execute("SELECT num_ede FROM exploitant").fetchall()
            cles_existantes = {ligne["num_ede"] for ligne in lst_num_ede}

            # Ne garde que les lignes avec un nouveau EDE
            df_sans_doublon = df[~df["N EDE"].isin(cles_existantes)].copy()

            # Crée les champs département et numéro de commune dans le DataFrame
            df_sans_doublon["DEP"] = df_sans_doublon["N EDE"].apply(lambda x: str(x)[0:2])
            df_sans_doublon["NO COMMUNE"] = df_sans_doublon["N EDE"].apply(lambda x: str(x)[2:5])

            # Insère toutes les données en une seule requête (gain de performance)
            self.con.executemany(
                "INSERT INTO exploitant (num_ede, nom, departement, commune) VALUES (?, ?, ?, ?)",
                df_sans_doublon[["N EDE", "NOM EXPLOITANT", "DEP", "NO COMMUNE"]].itertuples(index=False)
            )

            # UPDATE DES NOMS MANQUANT
            # Récupère tous les numéros EDE (clé primaire) qui n'ont pas de nom d'exploitant
            lst_num_ede = self.con.execute("SELECT num_ede FROM exploitant WHERE nom IS NULL").fetchall()
            cles_ede_sans_nom = {ligne["num_ede"] for ligne in lst_num_ede}

            # Ne garde que les lignes dont l'EDE est sans nom en base
            df_a_update = df[df["N EDE"].isin(cles_ede_sans_nom)].copy()

            for _, ligne in df_a_update.iterrows():
                nom = ligne["NOM EXPLOITANT"]
                # On ne complète que si ce nouvel import apporte réellement un
                # nom : inutile d'écraser un NULL par un autre nom manquant.
                if nom is None or (isinstance(nom, float) and pd.isna(nom)):
                    continue
                self.con.execute("UPDATE exploitant SET nom=? WHERE num_ede=?",
                                 (nom, ligne["N EDE"]))

        except Exception as pb:
            raise ErreurInsertionBase("exploitant", pb) from pb

    def _inp_matrice(self, df, auto_accept=False):
        """
        Insère les nouvelles matrices dans la table `matrice`.

        Si ``auto_accept`` est True (mode GUI), toutes les nouvelles matrices
        sont insérées sans demander de confirmation. Sinon (mode CLI), une
        confirmation est demandée pour chaque nouvelle valeur.

        Paramètres
        ----------
        df : pandas.DataFrame
            DataFrame contenant les données importées depuis le fichier Excel.
            Doit contenir la colonne "MATRICE".
        auto_accept : bool
            Si True, insère sans confirmation interactive (mode GUI).

        Lève
        ----
        ErreurInsertionBase
            En cas d'erreur lors de l'insertion en base.
        """
        try:
            # Récupère tous les libellés de matrice déjà présents dans la base
            lst_matrice = self.con.execute("SELECT id_matrice, libelle FROM matrice").fetchall()
            cles_existantes = {ligne["libelle"] for ligne in lst_matrice}

            # Ne garde que les lignes avec un nouveau libellé de matrice, sans doublons internes
            df_sans_doublon = df.loc[~df["MATRICE"].isin(cles_existantes), "MATRICE"].copy()
            df_sans_doublon = df_sans_doublon.drop_duplicates(keep="first")

            for val in df_sans_doublon:
                if auto_accept:
                    # ── Mode GUI : insertion directe ─────────────────────
                    self.con.execute("INSERT INTO matrice (libelle) VALUES (?)", (val,))
                else:
                    # ── Mode CLI : confirmation interactive ───────────────
                    while True:
                        res = input(f"Ajouter '{val}' comme matrice ? [O/N] ")
                        if res == "O":
                            self.con.execute(
                                "INSERT INTO matrice (libelle) VALUES (?)", (val,)
                            )
                            break
                        elif res == "N":
                            break

        except Exception as pb:
            raise ErreurInsertionBase("matrice", pb) from pb

    def _inp_mycoplasme(self, df):
        """
        Insère dans la table `mycoplasme` les cibles PCR détectées dans le DataFrame.

        Utilise ``ImportDonnees.detecter_PCR()`` pour identifier les colonnes PCR
        (ex : M. MYCOIDES CAPRI) et n'insère que celles qui ne sont pas déjà
        présentes en base.

        Paramètres
        ----------
        df : pandas.DataFrame
            DataFrame normalisé contenant les colonnes PCR.

        Lève
        ----
        ErreurInsertionBase
            En cas d'erreur lors de l'insertion en base.
        """
        try:
            existantes = {r["libelle"] for r in
                          self.con.execute("SELECT libelle FROM mycoplasme").fetchall()}
            # ImportDonnees.__new__ évite l'appel au constructeur (pas de lecture fichier)
            _v = ImportDonnees.__new__(ImportDonnees)
            _v.df = df
            for libelle in _v.detecter_PCR()["colonnes"]:
                if libelle not in existantes:
                    self.con.execute(
                        "INSERT INTO mycoplasme (libelle) VALUES (?)", (libelle,)
                    )
        except Exception as pb:
            raise ErreurInsertionBase("mycoplasme", pb) from pb

    def _inp_prelevement(self, df):
        """
        A faire
        """
        try:
            lst_matrice = self.con.execute("SELECT libelle, id_matrice FROM matrice").fetchall()

            dict_matrice = {row["libelle"]: row["id_matrice"] for row in lst_matrice}

            # Date de prélèvement : une date absente est conservée à NULL (None)
            # plutôt que de fabriquer une fausse date — l'année et la série, elles,
            # sont toujours renseignées. On évite ainsi un NaN parasite en base.
            _dates = pd.to_datetime(df["DATE PRELVMT"], errors="coerce")
            _dates = _dates.dt.strftime("%Y-%m-%d").where(_dates.notna(), None)

            df_fusion = pd.DataFrame({
                "ID_PREV": None,
                "DT_PREV": _dates.values,
                "ANNEE": self.annee,
                "NUM_SERIE": self.serie,
                "ID_MATRICE": df["MATRICE"].map(dict_matrice),
                "N EDE": df["N EDE"].values
            })

            self.con.executemany(
                "INSERT INTO prelevement (date_prelevement, annee, numero_serie, id_matrice, num_ede)"
                " VALUES (?, ?, ?, ?, ?)",
                df_fusion[["DT_PREV", "ANNEE", "NUM_SERIE", "ID_MATRICE", "N EDE"]]
                .itertuples(index=False)
            )

        except Exception as pb:
            raise ErreurInsertionBase("prelevement", pb) from pb

    def _inp_resultat(self, df):
        """
        Insère les résultats PCR (valeur_ct) dans la table resultat,
        en faisant le lien avec id_mycoplasme et id_prelevement.
        """


        lst_myc = self.con.execute(
            "SELECT libelle, id_mycoplasme FROM mycoplasme"
        ).fetchall()
        dict_myc = {row["libelle"]: row["id_mycoplasme"] for row in lst_myc}


        lst_prelev = self.con.execute(
            "SELECT num_ede, id_prelevement FROM prelevement WHERE annee=? AND numero_serie=?",
            (self.annee, self.serie)
        ).fetchall()
        dict_prelev = {row["num_ede"]: row["id_prelevement"] for row in lst_prelev}


        colonnes_pcr = [col for col in dict_myc.keys() if col in df.columns]

        #vérification explicite
        if not colonnes_pcr:
            raise ErreurColonneManquante("colonnes PCR (aucun libellé mycoplasme trouvé dans le DataFrame)")

        linges_a_insert = []

        for col in colonnes_pcr:
            df_fusion = pd.DataFrame({
                "valeur_ct": df[col].values,
                "id_mycoplasme": dict_myc[col],
                "id_prelevement": df["N EDE"].map(dict_prelev)
            })

            # On ignore les lignes sans prélèvement trouvé
            df_fusion = df_fusion.dropna(subset=["id_prelevement"])

            linges_a_insert.extend(
                df_fusion[["valeur_ct", "id_mycoplasme", "id_prelevement"]].itertuples(index=False)
            )

        try:
            self.con.executemany(
                "INSERT INTO resultat (valeur_ct, id_mycoplasme, id_prelevement) VALUES (?, ?, ?)",
                linges_a_insert
            )
        except Exception as pb:
            raise ErreurInsertionBase("resultat", pb) from pb

    def _inp_clasifier(self):
        """
        Calcule UNE classe sanitaire par cheptel (toutes cibles confondues).

        Méthode (nouvelle règle métier) :
          - pour chaque session, on retient le Ct le plus faible (le plus
            positif) parmi les cibles testées → une valeur par session ;
          - on conserve les 6 sessions les plus récentes, dans la limite des
            3 dernières années ;
          - on applique le système de scoring A–I sur ces 6 valeurs
            (via la fonction classer_6_valeurs).

        Un cheptel comptant moins de 6 sessions exploitables sur la période
        n'est pas classé ; toute classe devenue obsolète est supprimée
        (utile après l'écrasement ou la suppression d'une session).

        Écrit dans la table classifier(num_ede, id_classe, nb_ct_valides,
        date_calcul). La PK étant (num_ede, id_classe), on supprime d'abord
        les lignes du cheptel avant d'insérer sa classe courante (sinon un
        changement de classe laisserait coexister l'ancienne et la nouvelle).
        """
        try:
            # S'assure que la table de référence des classes est peuplée
            # (la contrainte de clé étrangère classifier.id_classe l'exige).
            self._inp_classes()

            date_du_jour = date.today().strftime("%Y-%m-%d")

            lst_num_ede = self.con.execute("SELECT num_ede FROM exploitant").fetchall()
            cles_ede = {ligne["num_ede"] for ligne in lst_num_ede}

            for ede in cles_ede:
                # Une valeur par session = Ct minimum toutes cibles confondues,
                # de la session la plus récente à la plus ancienne.
                lignes = self.con.execute(
                    """
                    SELECT S.annee, S.numero_serie, MIN(R.valeur_ct) AS ct_min
                    FROM resultat R
                    INNER JOIN prelevement P ON R.id_prelevement = P.id_prelevement
                    INNER JOIN session S ON P.annee = S.annee AND P.numero_serie = S.numero_serie
                    WHERE P.num_ede = ?
                    GROUP BY S.annee, S.numero_serie
                    ORDER BY CAST(S.annee AS INTEGER) DESC, S.numero_serie DESC
                    """,
                    (ede,)
                ).fetchall()

                if not lignes:
                    self.con.execute("DELETE FROM classifier WHERE num_ede = ?", (ede,))
                    continue

                # Fenêtre des 3 ans ANCRÉE SUR LA SESSION LA PLUS RÉCENTE DU
                # CHEPTEL (et non sur l'horloge ni sur le max global). Un cheptel
                # dont les dernières analyses datent de 2019 reste classé sur sa
                # fenêtre 2017-2019. En production (données courantes), l'ancre
                # vaut l'année en cours : comportement identique.
                annee_recente = int(lignes[0]["annee"])
                annee_limite = annee_recente - 3
                fenetre = [l["ct_min"] for l in lignes if int(l["annee"]) >= annee_limite]
                valeurs = fenetre[:6]
                classe = classer_6_valeurs(valeurs)

                # Une seule classe par cheptel : on repart de zéro à chaque calcul
                self.con.execute("DELETE FROM classifier WHERE num_ede = ?", (ede,))
                if classe is not None:
                    self.con.execute(
                        "INSERT INTO classifier "
                        "(num_ede, id_classe, nb_ct_valides, date_calcul) "
                        "VALUES (?, ?, ?, ?)",
                        (ede, classe, len(fenetre), date_du_jour)
                    )
        except Exception as pb:
            raise ErreurInsertionBase("classifier", pb) from pb

    def _inp_classes(self):
        """
        Peuple la table de référence `classe` avec les 9 classes A–I et leurs
        libellés, si elles ne sont pas déjà présentes. Indispensable avant
        d'insérer dans `classifier` (contrainte de clé étrangère).
        """
        libelles = {
            "A": "Toujours négatif",
            "B": "Toujours positif",
            "C": "Nouveau positif",
            "D": "Fort positif récurrent",
            "E": "Autre positif récurrent",
            "F": "Fort positif ponctuel",
            "G": "Autre positif ponctuel",
            "H": "Ancien positif",
            "I": "Statut non défini",
        }
        for num, lib in libelles.items():
            self.con.execute(
                "INSERT OR IGNORE INTO classe (id_classe, libelle_classe) VALUES (?, ?)",
                (num, lib)
            )




if __name__ == "__main__":
    test = DataBase_gestion(r"../SQL/data_t.db")
    try:
        test.insertion_donnees(r"../Modèle résultats département 79.xls")
    finally:
        test.fermer()