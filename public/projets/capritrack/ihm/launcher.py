"""
╔══════════════════════════════════════════════════════════════════╗
║  CAPRITRACK — Script de lancement automatique                    ║
║  Lance l'application Streamlit avec vérification des dépendances ║
╚══════════════════════════════════════════════════════════════════╝

UTILISATION : double-cliquer sur ce fichier, ou :
              python launcher.py
"""

import subprocess
import sys
import os
import importlib


# ── Dépendances requises ──────────────────────────────────────────
DEPENDANCES = [
    "streamlit",
    "pandas",
    "plotly",
    "openpyxl",
    "xlrd",
]

# ── Fichiers requis (relatifs à ce script) ────────────────────────
FICHIER_APP    = "app.py"
FICHIER_DB     = "mycoplasmes_test.db"
DOSSIER_ASSETS = "assets"


# ═════════════════════════════════════════════════════════════════
#  FONCTIONS
# ═════════════════════════════════════════════════════════════════

def log(msg: str, niveau: str = "INFO") -> None:
    symboles = {"INFO": "✔", "WARN": "⚠", "ERREUR": "✖", "INSTALL": "⬇"}
    print(f"  [{symboles.get(niveau, '·')}] {msg}")


def verifier_et_installer_dependances() -> bool:
    """Vérifie les imports et installe les paquets manquants via pip."""
    print("\n── Vérification des dépendances ──────────────────────────────")
    manquants = []
    for paquet in DEPENDANCES:
        try:
            importlib.import_module(paquet)
            log(f"{paquet} — déjà installé")
        except ImportError:
            log(f"{paquet} — MANQUANT", "WARN")
            manquants.append(paquet)

    if manquants:
        print(f"\n  Installation de : {', '.join(manquants)} …")
        resultat = subprocess.run(
            [sys.executable, "-m", "pip", "install", *manquants],
            capture_output=True, text=True
        )
        if resultat.returncode != 0:
            log("Échec de l'installation pip :", "ERREUR")
            print(resultat.stderr)
            return False
        for paquet in manquants:
            log(f"{paquet} — installé avec succès", "INSTALL")

    return True


def verifier_fichiers(base_dir: str) -> bool:
    """Vérifie la présence des fichiers nécessaires à l'application."""
    print("\n── Vérification des fichiers ─────────────────────────────────")
    ok = True

    app_path = os.path.join(base_dir, FICHIER_APP)
    if os.path.exists(app_path):
        log(f"{FICHIER_APP} — trouvé")
    else:
        log(f"{FICHIER_APP} — INTROUVABLE (doit être dans le même dossier)", "ERREUR")
        ok = False

    db_path = os.path.join(base_dir, FICHIER_DB)
    if os.path.exists(db_path):
        log(f"{FICHIER_DB} — trouvé")
    else:
        log(f"{FICHIER_DB} — INTROUVABLE", "WARN")
        log("  → L'app se lancera mais sans données.", "WARN")

    assets_path = os.path.join(base_dir, DOSSIER_ASSETS)
    if os.path.isdir(assets_path):
        log(f"Dossier {DOSSIER_ASSETS}/ — trouvé")
    else:
        log(f"Dossier {DOSSIER_ASSETS}/ — INTROUVABLE", "WARN")
        log("  → Le logo ne s'affichera pas.", "WARN")

    return ok


def lancer_streamlit(base_dir: str) -> None:
    """Lance l'application Streamlit."""
    app_path = os.path.join(base_dir, FICHIER_APP)
    print("\n── Lancement de l'application ────────────────────────────────")
    print("  → Ouverture sur http://localhost:8501")
    print("  → Appuyez sur Ctrl+C pour arrêter\n")

    subprocess.run(
        [sys.executable, "-m", "streamlit", "run", app_path,
         "--server.headless", "false",
         "--browser.gatherUsageStats", "false"],
        cwd=base_dir
    )


# ═════════════════════════════════════════════════════════════════
#  POINT D'ENTRÉE
# ═════════════════════════════════════════════════════════════════

def main() -> None:
    print("╔══════════════════════════════════════════════════════════╗")
    print("║          CAPRITRACK — Lancement de l'application         ║")
    print("╚══════════════════════════════════════════════════════════╝")

    # Dossier contenant ce script (et app.py)
    base_dir = os.path.dirname(os.path.abspath(__file__))

    if not verifier_et_installer_dependances():
        input("\n  ✖ Impossible d'installer les dépendances. Appuyez sur Entrée pour quitter.")
        sys.exit(1)

    if not verifier_fichiers(base_dir):
        input("\n  ✖ Fichier app.py introuvable. Appuyez sur Entrée pour quitter.")
        sys.exit(1)

    lancer_streamlit(base_dir)


if __name__ == "__main__":
    main()