# CHANGELOG – CAN-44 Shoutout-System

## CAN-44.31 – Shoutout Overlay Sets Compact UI

- Dashboard-Spezialeditor für `shoutout.overlay.sets` optisch bereinigt.
- Vorschau-Zeile pro Set entfernt.
- `Set löschen` in die Set-Kopfzeile neben `aktiv` verschoben.
- Set-Karten kompakter gemacht.
- Keine Backend-, Overlay-, Queue-, Bus-, Playback- oder Audio-Finish-Änderung.

## CAN-44.30 – Shoutout Overlay Sets Dropdown Visible Fix

- `shoutout.overlay.sets` wird direkt in `textRowsForCategory('shoutout.overlay')` injiziert.
- Zusätzlicher Guard in `renderTextKeyOptions()` sorgt dafür, dass der Spezial-Key im Dropdown sichtbar bleibt.
- Zielpfad: Community -> Shoutout -> Texte -> Kategorie `Shoutout Overlay` -> Textkey `shoutout.overlay.sets`.

## CAN-44.29 – Shoutout Overlay Sets Dropdown Editor

- Spezialeditor für `shoutout.overlay.sets` im bestehenden Texte-Tab vorbereitet.
- Ziel: Weiter über bestehendes Kategorie-/Textkey-Dropdown arbeiten, nicht über separate Seite.
- Set-Zeilen mit ID, aktiv, Gewichtung, Headline und Subline ergänzt.

## CAN-44.28 – Shoutout Overlay Sets Integrated Dashboard

- Erster Versuch, Overlay-Set-Verwaltung in `shoutout_v2.js/css` zu integrieren.
- Ergebnis war noch nicht korrekt sichtbar, weil der Spezial-Key im Dropdown fehlte.

## CAN-44.27 – Shoutout Overlay Sets Dashboard UI

- Erster eigenständiger UI-Entwurf für Overlay-Sets.
- Danach verworfen bzw. nicht als Zielstruktur weitergeführt, weil die Verwaltung in den bestehenden Texte-Tab soll.

## CAN-44.26 – Shoutout Overlay Paired Sets

- Backend-Config um `overlaySets` ergänzt.
- Headline/Subline werden als zusammengehörige Paare behandelt.
- Neue API:
  - `GET /api/clip-shoutout/overlay-sets`
  - `POST /api/clip-shoutout/overlay-sets`
- Alte Textkeys bleiben als Fallback erhalten:
  - `shoutout.overlay.headline`
  - `shoutout.overlay.subline`

## CAN-44.25 – Shoutout Overlay Texts Dashboard

- DB-/Dashboardfähige Textkeys für Overlay-Headline und Overlay-Subline vorbereitet.
- Kategorie `shoutout.overlay` ergänzt.
- Später durch das Paar-System aus CAN-44.26 bevorzugt ersetzt, bleibt aber Fallback.

## CAN-44.24f – Sound-System-Overlay H15 Avatar Position Fix

- H15-Layout im bestehenden `sound_system_overlay.html` als vorläufig akzeptierte Basis integriert.
- Avatar-Positionierung im runden Avatar-Bereich gefixt.
- Kein Wechsel auf `_overlay-clip_player.html`.

## CAN-44.21.41 – AutoShoutout Instant Trigger Messages

- AutoShoutout-Sofort-Auslöser ergänzt.
- Standard-Sofort-Auslöser: `!lurk`, `!lurke`, `lurk`.
- Sofort-Auslöser können Mindestnachrichten umgehen.
- Normale Nachrichtenzählung bleibt erhalten: erste Nachricht zählt als 1.
- `!so` und `!vso` bleiben normale Shoutout-Commands.

## CAN-44.21.40 – Shoutout Settings Save Fix

- Speichern liest Formularwerte jetzt vor dem Rendern.
- Bug behoben, bei dem Änderungen scheinbar verworfen/neu geladen wurden.

## CAN-44.21.39 – Shoutout Settings Help Tooltips

- Hilfe-Tooltips für relevante Settings ergänzt.
- Hover/Fokus-Hilfe über kleines `?`.
- Hover-Zustand für Settings-Zeilen ergänzt.

## CAN-44.21.38 – Shoutout Settings Layout Cleanup

- Settings-Layout kompakter gemacht.
- Command-Zuordnung reduziert/einklappbar.
- Gruppen klarer sortiert.
- Save/Reload besser erreichbar.

## CAN-44.21.37 – Shoutout Dashboard Settings Editable

- Settings-Tab editierbar gemacht.
- altes Shoutout-Dashboard aus `index.html` deaktiviert.
- Shoutout V2 wird produktiv als `Shoutout` angezeigt.
- Command-Konfiguration bleibt im Commands-Dashboard.

## CAN-44.21.34 – Command Definitions Source of Truth Fix

- `command_definitions` ist Source of Truth.
- alte Config `command: vso` überschreibt den Command nicht mehr.
- `!so` Hauptcommand, `!vso` Alias.
- keine DefaultTrigger-Logik mehr aktiv.

## CAN-44.21.30 – Direct Intake Trigger Fix

- Direct-Intake erkennt `!so` wieder korrekt.
- Silent-Drop bei `!so` behoben.

## CAN-44.21.29 – Manual SO Intake Official Retry Dedup

- OfficialQueue-Dedup-/Retry-Verhalten für manuelle Shoutouts verbessert.
- Manuelle Wiederholung darf konkreten Streamer erneut versuchen.
- Worker-Retrys sollen nicht chatten.
