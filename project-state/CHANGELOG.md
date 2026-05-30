# CHANGELOG

## 2026-05-30 – STEP590 zentrale Statusdateien aktualisiert

### Geändert

- `project-state/CURRENT_STATUS.md` auf STEP588/STEP589-Stand nachgezogen.
- `project-state/FILES.md` auf aktive Konsolidierungsdateien, Archive und nächste Prüfbereiche aktualisiert.
- `project-state/NEXT_STEPS.md` auf STEP591 Routes/Module-Docs-Verifikation ausgerichtet.
- `project-state/TODO.md` aktualisiert und Doku-Cleanup als erledigt markiert.
- `docs/current/CURRENT_SYSTEM_STATUS.md` auf aktuellen Doku-/Cleanup-Stand ergänzt.
- `docs/modules/README.md` auf aktuelle Modul-/Konsolidierungsdoku erweitert.

### Hintergrund

Der Project-State-/Dokumentations-Cleanup STEP553–STEP588 wurde abgeschlossen und STEP589 hat den General Project Prompt aktualisiert.

### Nächster sinnvoller Schritt

```text
STEP591 – Routes and Module Docs Verification Scan
```

## 2026-05-30 – STEP589 General Project Prompt aktualisiert

### Geändert

- `project-state/GENERAL_PROJECT_PROMPT.md` auf neuen Arbeitsstand aktualisiert.
- Regeln ergänzt für:
  - GitHub/dev als Single Source of Truth
  - fehlende Dateien konkret anfordern
  - keine Patches / keine Teil-Datei-Workarounds
  - EventBus / Communication Bus
  - SQLite + spätere MariaDB-/MySQL-Portabilität
  - kurze PowerShell-/Routen-Ausgaben
  - `COPY_THIS_RESULT`-Muster

## 2026-05-30 – STEP553–STEP588 Project-State-/Doku-Cleanup abgeschlossen

### Ergebnis

- `project-state` Root bereinigt.
- Alte Arbeits-/Run-Dokumente archiviert, nicht gelöscht.
- Relevante Archivgruppen geprüft.
- Fachliche Inhalte in `docs/system-inspection/` konsolidiert.
- Abschluss in `docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md` dokumentiert.

### Aktive Konsolidierungen

```text
docs/system-inspection/MODULE_AND_META_RULES_CONSOLIDATION.md
docs/system-inspection/COMMUNICATION_BUS_CONTRACT_CONSOLIDATION.md
docs/system-inspection/SHOUTOUT_SYSTEM_CONSOLIDATION.md
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
docs/system-inspection/DASHBOARD_COMMANDS_CONSOLIDATION.md
docs/system-inspection/PROJECT_STATE_CLEANUP_RUN_HISTORY.md
```

## 2026-05-27 – Channelpoints STEP527 dokumentiert

### Geändert

- Channelpoints-Bedienkonzept vereinfacht.
- Editor nutzt kein normales lokales „Aktiv“-Häkchen mehr.
- Speichern legt lokal an/ändert lokal und erstellt/aktualisiert Twitch.
- Neue Twitch Rewards werden standardmäßig inaktiv erstellt.
- Übersichtsschalter steuert nur Twitch sichtbar/einlösbar.
- Doku zu Sound-System-Routing und Media-Dateinamen ergänzt.

### Behoben / dokumentiert

- `Cannot GET /api/channelpoints/status` wurde auf nicht geladenes `channelpoints.js` zurückgeführt.
- Serverstart-Fehler dokumentiert:

```text
[module] FAILED: channelpoints.js
deleteRewardFromTwitch is not defined
```

- STEP526/STEP527 als relevante Korrekturlinie dokumentiert.

### Zurückgezogen

```text
STEP524_MEDIA_ASSET_FILENAME_ENCODING_CLEANUP_v0.1.0
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

### Aktuell gültig

```text
STEP527_CHANNELPOINTS_CREATE_SAVE_TWITCH_INACTIVE_DEFAULT_v0.9.13
```

## 2026-05-27 – Planung STEP528 Overlay Health/Refresh

- Nach STEP527 keine Code-Änderung mehr umgesetzt.
- Geplant: neues Overlay-Health-/Refresh-Control-System.
- Ziel: unterscheiden, ob Overlay-JS, OBS-Browserquelle oder OBS-WebSocket/OBS selbst hängt.
- Start erst nach Prüfung der echten OBS-/Overlay-/WebSocket-Dateien.
