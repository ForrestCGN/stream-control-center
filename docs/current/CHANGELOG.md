# CHANGELOG – CAN-44.21 Shoutout-System

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
