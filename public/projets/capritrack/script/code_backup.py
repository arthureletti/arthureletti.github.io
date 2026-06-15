import sys
import os
import shutil
from pathlib import Path
from datetime import datetime

# ── Racine du projet (code_backup.py est dans script/, on remonte d'un niveau) ──
#   Arborescence attendue :
#     <racine>/
#     ├── script/          ← ce fichier est ici
#     │   ├── code_backup.py
#     │   ├── code_BD.py
#     │   └── code_import.py
#     ├── ihm/
#     │   ├── app.py
#     │   └── assets/
#     └── SQL/
#         ├── data.db
#         └── backups/
BASE = Path(__file__).parent.parent          # remonte de script/ → racine
sys.path.insert(0, str(BASE / "script"))     # script/ → imports code_BD, code_import…
sys.path.insert(0, str(BASE / "ihm"))        # ihm/    → imports éventuels

from code_import import init_base_donnees, SQL_PATH

# ════════════════════════════════════════════════════════════════
#  CHEMINS
# ════════════════════════════════════════════════════════════════
DB_PATH    = str(BASE / "SQL" / "data.db")
BACKUP_DIR = BASE / "SQL" / "backups"
ASSETS_PATH = BASE / "ihm" / "assets"

# ── Création du dossier SQL/ et initialisation des tables si besoin ──
(BASE / "SQL").mkdir(parents=True, exist_ok=True)
if not Path(DB_PATH).exists():
    init_base_donnees(DB_PATH, SQL_PATH)


# ════════════════════════════════════════════════════════════════
#  SUIVI DES CHANGEMENTS DE SESSION
# ════════════════════════════════════════════════════════════════
# Passe à True dès qu'une insertion est faite pendant la session.
# Reste à False si aucune modification n'a eu lieu.
# Permet de décider si une fenêtre "Voulez-vous sauvegarder ?" doit
# apparaître à la fermeture de l'application.
_a_change: bool = False


def changement() -> bool:
    """
    Retourne True si des modifications ont été faites depuis le
    dernier enregistrement, False sinon.
    """
    return _a_change


def marquer_changement() -> None:
    """
    Signale qu'une modification a été faite (insertion de données, etc.).
    À appeler après tout import réussi en base.
    """
    global _a_change
    _a_change = True


def reinitialiser_changement() -> None:
    """
    Remet le flag à False après un enregistrement explicite de l'utilisateur
    (backup manuel ou restauration).
    À appeler depuis l'IHM quand l'utilisateur clique sur "Sauvegarder".
    """
    global _a_change
    _a_change = False


# ════════════════════════════════════════════════════════════════
#  BACKUP
# ════════════════════════════════════════════════════════════════
def creer_backup():
    """
    Copie data.db → SQL/backups/data_YYYYMMDD_HHMMSS.db.
    Conserve uniquement les 10 sauvegardes les plus récentes.
    Retourne le chemin du backup créé, ou None si data.db est absent.
    """
    BACKUP_DIR.mkdir(parents=True, exist_ok=True)
    if not os.path.exists(DB_PATH):
        return None
    horodatage  = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = BACKUP_DIR / f"data_{horodatage}.db"
    shutil.copy2(DB_PATH, backup_path)
    # Supprime les sauvegardes au-delà des 10 plus récentes
    backups = sorted(BACKUP_DIR.glob("data_*.db"),
                     key=lambda p: p.stat().st_mtime, reverse=True)
    for ancien in backups[10:]:
        ancien.unlink()
    return str(backup_path)


def lister_backups():
    """
    Retourne la liste des backups triés du plus récent au plus ancien.
    Chaque élément est un dict {nom, chemin, date_str, taille_ko}.
    """
    if not BACKUP_DIR.exists():
        return []
    backups = sorted(BACKUP_DIR.glob("data_*.db"),
                     key=lambda p: p.stat().st_mtime, reverse=True)
    result = []
    for p in backups:
        mtime = datetime.fromtimestamp(p.stat().st_mtime)
        result.append({
            "nom":      p.name,
            "chemin":   str(p),
            "date_str": mtime.strftime("%d/%m/%Y %H:%M:%S"),
            "taille_ko": round(p.stat().st_size / 1024, 1),
        })
    return result


def restaurer_backup(chemin_backup):
    """
    Backup de data.db, puis restaure le backup choisi comme nouvelle data.db.
    Remet le flag changement à False : la base est dans un état sauvegardé.
    """
    creer_backup()
    shutil.copy2(chemin_backup, DB_PATH)
    reinitialiser_changement()

