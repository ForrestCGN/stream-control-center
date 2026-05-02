# Generated Project Navigation

Generated: 2026-05-02 19:33:30

## Generierte Dateien

```txt
docs/_generated/ROUTES.md
docs/_generated/FUNCTIONS.md
docs/_generated/DASHBOARD_MODULES.md
docs/_generated/CONFIGS_AND_DATA.md
docs/_generated/PROJECT_NAVIGATION.md
```

## Arbeitsregeln

```txt
- Echte Dateien als Single Source of Truth verwenden.
- Keine Funktionalität entfernen.
- Live-Pfad und Repo-Pfad sauber unterscheiden.
- Dashboard-Module liegen aktiv unter htdocs/dashboard/modules.
- Admin-/Systemwerte gehören nach Admin -> Configs, nicht in normale Modul-Seiten.
- SQLite app.sqlite niemals ersetzen, nur sanft erweitern.
- Nach abgeschlossenen Steps Doku/STABLE aktualisieren.
```

## Prüfbefehle

```powershell
cd D:\Git\stream-control-center
git pull --rebase origin dev
git status

Invoke-RestMethod "http://127.0.0.1:8080/api/_status" | ConvertTo-Json -Depth 10
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/status" | ConvertTo-Json -Depth 20
Invoke-RestMethod "http://127.0.0.1:8080/api/sound/settings" | ConvertTo-Json -Depth 20
```

## Aktuelle Sound-System-Sortierung

```txt
Sound-System Seite:
- Bedienung
- Ausgabe
- Queue
- normale Runtime-Settings
- Sounds

Admin -> Configs -> Sound-System Experten:
- Helper-Pfad
- Helper Timeout
- Playback Mode
- Overlay URL
- Sounds Base Dir
- Allowed Extensions
- Parallel-Kategorien
```

## Nächste Ziele

```txt
- Admin-Rechte/Audit-Logging für technische Configs
- Sound-Bibliothek / Upload / Dateiverwaltung
- Discord-Ausgabe über Sound-System
- STABLE-Hauptdoku bei Bedarf zusammenführen
```