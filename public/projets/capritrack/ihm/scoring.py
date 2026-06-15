"""
Module de classement des cheptels en 9 classes (A à I)
selon les règles métier du Laboratoire Qualyse.

Le classement se fait par cheptel ET par cible PCR, sur les
6 derniers résultats Ct valides (non-NA), du plus récent au plus ancien.

Rappel : Ct >= 40 => NEGATIF, Ct < 40 => POSITIF, Ct < 35 => positif FORT.
"""


def classer_cheptel(cts_recents):
    """
    Classe un cheptel pour une cible donnée.

    Paramètre
    ---------
    cts_recents : list[float]
        Les valeurs Ct VALIDES (non-NA), triées du PLUS RÉCENT au PLUS ANCIEN.
        cts_recents[0] = dernier résultat.

    Retour
    ------
    str : la classe ('A' à 'I'), ou None si non classable (< 6 résultats valides
          — sauf le cas H qui ne nécessite que 4 résultats).
    """

    # ── Cas H : ancien POS (ne nécessite que les 4 derniers) ──
    # Les 4 derniers sont tous négatifs, MAIS il y a eu du positif avant
    # (sinon ce serait un "toujours négatif" -> A).
    if len(cts_recents) >= 4:
        quatre_derniers = cts_recents[:4]
        tous_neg_4 = all(ct >= 40 for ct in quatre_derniers)
    else:
        tous_neg_4 = False

    # À partir d'ici, il faut au moins 6 résultats pour A à G et I
    if len(cts_recents) < 6:
        # On peut quand même classer en H si les 4 derniers sont négatifs
        # et qu'on a au moins 1 positif dans les résultats disponibles au-delà
        if tous_neg_4 and any(ct < 40 for ct in cts_recents[4:]):
            return "H"
        return None  # pas assez de données

    six = cts_recents[:6]
    nb_positifs = sum(1 for ct in six if ct < 40)
    positifs = [ct for ct in six if ct < 40]
    dernier = six[0]

    # ── A : toujours NEG (les 6 sont négatifs) ──
    if nb_positifs == 0:
        return "A"

    # ── B : toujours POS (les 6 sont positifs) ──
    if nb_positifs == 6:
        return "B"

    # ── H : ancien POS (4 derniers négatifs, mais positif avant) ──
    # Prioritaire avant les cas C-G car décrit une situation "résolue".
    if tous_neg_4 and any(ct < 40 for ct in six[4:]):
        return "H"

    # ── C : nouveau POS (dernier POS fort <35, les 5 antérieurs négatifs) ──
    if dernier < 35 and all(ct >= 40 for ct in six[1:]):
        return "C"

    # Tous les positifs sont-ils forts (Ct < 35) ?
    tous_forts = all(ct < 35 for ct in positifs)

    # ── D / E : POS récurrent (3 à 5 positifs) ──
    if 3 <= nb_positifs <= 5:
        if tous_forts:
            return "D"   # fort POS récurrent
        else:
            return "E"   # autre POS récurrent

    # ── F / G : POS ponctuel (1 à 2 positifs) ──
    if 1 <= nb_positifs <= 2:
        if tous_forts:
            return "F"   # fort POS ponctuel
        else:
            return "G"   # autre POS ponctuel

    # ── I : statut non défini (classable mais aucune règle ci-dessus) ──
    return "I"


# Libellés lisibles des classes
LIBELLES_CLASSES = {
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

# Couleur associée à chaque classe (du vert au rouge selon gravité)
COULEURS_CLASSES = {
    "A": "#27AE60",  # vert - sain
    "H": "#7DCEA0",  # vert clair - résolu
    "C": "#F39200",  # orange - nouveau cas à surveiller
    "F": "#E67E22",  # orange foncé
    "G": "#F5B041",  # jaune-orange
    "E": "#E74C3C",  # rouge
    "D": "#C0392B",  # rouge foncé - le plus grave
    "B": "#922B21",  # bordeaux - chronique
    "I": "#95A5A6",  # gris - indéterminé
}


if __name__ == "__main__":
    # Tests rapides des règles
    tests = [
        ([40, 40, 40, 40, 40, 40], "A"),   # toujours neg
        ([30, 32, 28, 33, 31, 29], "B"),   # toujours pos
        ([33, 40, 40, 40, 40, 40], "C"),   # nouveau pos fort
        ([30, 32, 34, 40, 40, 40], "D"),   # 3 pos forts
        ([30, 38, 34, 40, 40, 40], "E"),   # 3 pos dont un faible
        ([30, 40, 40, 40, 40, 40], "F"),   # 1 pos fort
        ([38, 40, 40, 40, 40, 40], "G"),   # 1 pos faible
        ([40, 40, 40, 40, 30, 40], "H"),   # 4 derniers neg, pos avant
    ]
    for cts, attendu in tests:
        res = classer_cheptel(cts)
        ok = "OK" if res == attendu else f"ERREUR (attendu {attendu})"
        print(f"{cts} -> {res} [{LIBELLES_CLASSES.get(res,'?')}] {ok}")
