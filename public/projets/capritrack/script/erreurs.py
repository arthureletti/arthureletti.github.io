# =============================================================
# erreurs.py — Exceptions personnalisées du projet Qualyse
# =============================================================
# Chaque classe hérite d'une exception Python standard pour
# rester compatible avec les blocs except existants.
#
# Usage :
#   from erreurs import ErreurFichierIntrouvable, ErreurColonneManquante, ...
# =============================================================


# ---------------------------------------------------------------
# ERREURS FICHIERS
# ---------------------------------------------------------------

class ErreurFichierIntrouvable(FileNotFoundError):
    """
    Levée quand un fichier nécessaire au pipeline est absent.

    Concerne : fichiers Excel, fichier .sql, fichier .db.

    Exemple :
        raise ErreurFichierIntrouvable("excel", "../Modèle résultats 79.xls")
    """
    def __init__(self, type_fichier, chemin):
        self.chemin = chemin
        message = "Fichier " + type_fichier + " introuvable : " + str(chemin)
        super().__init__(message)


class ErreurDossierIntrouvable(FileNotFoundError):
    """
    Levée quand le dossier parent d'une base de données n'existe pas.

    Exemple :
        raise ErreurDossierIntrouvable("../SQL/")
    """
    def __init__(self, dossier):
        self.dossier = dossier
        message = "Dossier introuvable : " + str(dossier)
        super().__init__(message)


# ---------------------------------------------------------------
# ERREURS FORMAT EXCEL
# ---------------------------------------------------------------

class ErreurEnteteIntrouvable(ValueError):
    """
    Levée quand la ligne d'en-tête (Numéro d'ordre) est absente du fichier Excel.

    Exemple :
        raise ErreurEnteteIntrouvable("../Modèle résultats 79.xls")
    """
    def __init__(self, chemin):
        self.chemin = chemin
        message = "En-tête 'Numéro d'ordre' introuvable dans : " + str(chemin)
        super().__init__(message)


class ErreurStructureExcel(ValueError):
    """
    Levée quand la structure du fichier Excel ne correspond pas au format attendu.

    Concerne : colonne 'PCR MELANGES X4' absente dans les fichiers département 79,
               ligne de groupe manquante, etc.

    Exemple :
        raise ErreurStructureExcel("PCR MELANGES X4", "../Modèle résultats 79.xls")
    """
    def __init__(self, element_manquant, chemin):
        self.element_manquant = element_manquant
        self.chemin = chemin
        message = "Élément '" + str(element_manquant) + "' introuvable dans : " + str(chemin)
        super().__init__(message)


# ---------------------------------------------------------------
# ERREURS DONNÉES
# ---------------------------------------------------------------

class ErreurColonneManquante(ValueError):
    """
    Levée quand une colonne attendue est absente du DataFrame.

    Exemple :
        raise ErreurColonneManquante("DATE PRELEVEMENT")
    """
    def __init__(self, nom_colonne):
        self.nom_colonne = nom_colonne
        message = "Colonne manquante dans le DataFrame : " + str(nom_colonne)
        super().__init__(message)


class ErreurDateIntrouvable(ValueError):
    """
    Levée quand aucune colonne date ne peut être détectée dans le DataFrame.

    Exemple :
        raise ErreurDateIntrouvable()
    """
    def __init__(self):
        message = (
            "Aucune colonne date détectée. "
            "Vérifiez que le fichier contient une colonne de prélèvement."
        )
        super().__init__(message)


class ErreurDatesInvalides(ValueError):
    """
    Levée quand trop de dates sont invalides après conversion.

    Exemple :
        raise ErreurDatesInvalides("DATE PRELEVEMENT", 45, 261)
    """
    def __init__(self, nom_colonne, nb_invalides, nb_total):
        self.nom_colonne   = nom_colonne
        self.nb_invalides  = nb_invalides
        self.nb_total      = nb_total
        message = (
            str(nb_invalides) + "/" + str(nb_total)
            + " dates invalides dans la colonne '" + str(nom_colonne) + "'."
        )
        super().__init__(message)


# ---------------------------------------------------------------
# ERREURS BASE DE DONNÉES
# ---------------------------------------------------------------

class ErreurConnexionBase(Exception):
    """
    Levée quand la connexion à la base SQLite échoue.

    Exemple :
        raise ErreurConnexionBase("../SQL/data.db", cause)
    """
    def __init__(self, chemin_db, cause=None):
        self.chemin_db = chemin_db
        self.cause     = cause
        message = "Impossible de se connecter à la base : " + str(chemin_db)
        if cause:
            message = message + " (" + str(cause) + ")"
        super().__init__(message)


class ErreurInitialisationBase(Exception):
    """
    Levée quand l'exécution de create_tables.sql échoue.

    Exemple :
        raise ErreurInitialisationBase(cause)
    """
    def __init__(self, cause=None):
        self.cause = cause
        message = "Échec de l'initialisation de la base de données."
        if cause:
            message = message + " Cause : " + str(cause)
        super().__init__(message)


class ErreurInsertionBase(Exception):
    """
    Levée quand une insertion en base de données échoue.

    Exemple :
        raise ErreurInsertionBase("session", cause)
    """
    def __init__(self, table, cause=None):
        self.table = table
        self.cause = cause
        message = "Erreur lors de l'insertion dans la table '" + str(table) + "'."
        if cause:
            message = message + " Cause : " + str(cause)
        super().__init__(message)


# ---------------------------------------------------------------
# ERREURS SAISIE UTILISATEUR
# ---------------------------------------------------------------

class ErreurSessionInvalide(ValueError):
    """
    Levée quand l'année ou le numéro de série saisi est invalide.

    Exemple :
        raise ErreurSessionInvalide("annee", "abcd")
        raise ErreurSessionInvalide("serie", 5)
    """
    def __init__(self, champ, valeur):
        self.champ  = champ
        self.valeur = valeur
        if champ == "annee":
            message = (
                "Année invalide : '" + str(valeur) + "'. "
                "Format attendu : 4 chiffres entre 2000 et l'année en cours."
            )
        elif champ == "serie":
            message = (
                "Numéro de série invalide : '" + str(valeur) + "'. "
                "Valeurs acceptées : 1, 2 ou 3."
            )
        else:
            message = "Valeur invalide pour '" + str(champ) + "' : " + str(valeur)
        super().__init__(message)


class ErreurSessionExistante(ValueError):
    """
    Levée quand la session (année + série) est déjà présente en base.

    Exemple :
        raise ErreurSessionExistante(2026, 1)
    """
    def __init__(self, annee, serie):
        self.annee = annee
        self.serie = serie
        message = (
            "La session " + str(annee) + " série " + str(serie)
            + " existe déjà en base."
        )
        super().__init__(message)

