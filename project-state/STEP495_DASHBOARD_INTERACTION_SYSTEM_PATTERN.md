# STEP495_DASHBOARD_INTERACTION_SYSTEM_PATTERN

Stand: 2026-05-26

## Ziel

Kanalpunkte-Dashboard nicht als lange Einzel-Seite weiterführen, sondern als übersichtliches Bedienmuster aufbauen, das sich am Command-System orientiert.

## Umsetzung

- `htdocs/dashboard/modules/channelpoints.js` neu strukturiert.
- `htdocs/dashboard/modules/channelpoints.css` erweitert.
- Tabs ergänzt: Übersicht, Rewards, Kategorien, Aktionen, Medien, Einlösungen, Twitch Sync.
- Suche und Filter ergänzt:
  - Name/Key/Textsuche
  - Kategorie
  - lokaler Status
  - Aktionstyp
- Reward-Liste links, Detail-/Editorbereich rechts.
- Editor in Abschnitte geteilt: Basis, Aktion, Medien, Regeln.
- Medien bleiben über bestehendes MediaField/MediaPicker-System angebunden.

## Nicht geändert

- Keine Backend-Änderung.
- Keine Twitch-Schreibaktionen.
- Keine DB-Migration.
- Kein neues Upload-System.

## Nächster Schritt

- Kanalpunkte-Dashboard im Browser testen.
- Danach Command-Dashboard optisch/strukturell angleichen, sofern nötig.
