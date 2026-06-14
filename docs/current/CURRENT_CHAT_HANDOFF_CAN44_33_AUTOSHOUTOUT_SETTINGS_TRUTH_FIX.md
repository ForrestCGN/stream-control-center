# CURRENT CHAT HANDOFF – CAN44.33 AutoShoutout Settings Truth Fix

## Kontext
Nach CAN44.32 war AutoShoutout im Live-System auf `moduleVersion 0.2.46` aktiv. Der StreamDay-Fix griff: Bei offline/known central stream status blieb `autoShoutout.state.streamDay` leer. `storeSkippedEvents` wurde erfolgreich auf `True` gesetzt.

In der Settings-Response zeigte `settings.autoShoutout` aber weiterhin alte JSON-/Fallback-Werte (`enabled=false`, `storeSkippedEvents=false`), während `autoSettings`/Status effektiv DB-Werte zeigten (`enabled=true`, `storeSkippedEvents=true`).

## Ziel
Die API darf nicht mehr zwei widersprüchliche AutoShoutout-Wahrheiten anzeigen. `settings.autoShoutout` soll die effektive AutoShoutout-Konfiguration enthalten. Die alte JSON-Schicht darf nur noch als Legacy-/Debug-Ausgabe sichtbar sein.

## Geänderte Datei
- `backend/modules/clip_shoutout.js`

## Änderung
- Version auf `0.2.47` erhöht.
- Neuer Helper `effectiveShoutoutSettingsPayload(currentCfg)`.
- `GET /api/clip-shoutout/settings` und `POST /api/clip-shoutout/settings` geben jetzt saubere Felder aus:
  - `settings.autoShoutout` = effektive DB-/Runtime-Config
  - `effectiveAutoShoutout` = Alias/klare Wahrheit
  - `legacyAutoShoutoutConfig` = alte JSON-/Fallback-Schicht für Diagnose
  - `autoShoutoutTruth` = Quellen-/Wahrheitsblock

## Nicht geändert
- Keine produktive Shoutout-Funktionalität entfernt.
- Keine DB ersetzt oder gelöscht.
- Keine Dashboard-Datei geändert.

## Nächster Schritt
Nach StepDone/Live-Deploy testen, ob `/api/clip-shoutout/settings` nicht mehr `settings.autoShoutout.enabled=false` als aktive Wahrheit ausgibt.
Danach kann CAN44.34 den Live-Status-Monitor/EventSub-Unknown-Fix angehen.
