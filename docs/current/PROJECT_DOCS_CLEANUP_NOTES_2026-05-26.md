# PROJECT_DOCS_CLEANUP_NOTES_2026-05-26

## Zweck

Diese Datei dokumentiert die reine Aufraeum-/Doku-Bestandsaufnahme fuer STEP474. Es wurden keine Backend-, Dashboard-, Overlay-, Config- oder Datenbankdateien geaendert.

## Gepruefte Uploads

```text
stream-control-center.zip
backend.zip
```

## Ergebnis der Sichtung

### Doku-/Projektstand-ZIP

`stream-control-center.zip` enthaelt im geprueften Upload im Wesentlichen:

```text
docs/
project-state/
```

Auffaellig ist eine sehr hohe Zahl alter STEP-/APPEND-/Snapshot-Dateien. Diese Dateien wurden nicht geloescht. Fuer den Moment gilt:

- zentrale aktuelle Dateien weiter pflegen
- alte Dateien nicht blind entfernen
- spaeter optional Archiv-/Bereinigungs-STEP planen

### Backend-ZIP

`backend.zip` enthaelt echte Backend-Dateien unter:

```text
backend/
```

Erkannte Backend-Struktur:

- Module ohne Helper: 49
- Helper-Dateien: 18
- erkannte Routen/Route-Hinweise: 527

Auffaellig:

```text
backend/data/app.sqlite
backend/data/deathcounter.v2.json
backend/modules/twitch.js.bak_original_uploaded
```

Diese Dateien muessen vor Repo-/Commit-/Deploy-Arbeiten bewusst bewertet werden. Datenbanken, Runtime-Daten und Backup-Dateien duerfen nicht ins Repo.

## Aktueller Cleanup-Entscheid

Dieser STEP bleibt reine Doku-/Aufraeumarbeit:

- keine Codeaenderungen
- keine Dashboardaenderungen
- keine Shoutout-Umsetzung
- keine Datenbankmigration
- keine Dateien loeschen
- keine alten STEP-Dateien verschieben

## Naechster Fach-STEP nach Cleanup

Nach diesem Cleanup ist weiterhin sinnvoll:

```text
STEP475_SHOUTOUT_DASHBOARD_TABS
```

Ziel danach: Shoutout-Dashboard in Tabs/Unterbereiche aufteilen.
