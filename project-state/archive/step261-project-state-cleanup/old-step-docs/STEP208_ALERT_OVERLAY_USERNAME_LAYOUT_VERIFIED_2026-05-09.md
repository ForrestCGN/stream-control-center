# STEP208 Alert Overlay Username Layout verified

## Ergebnis

Der Username im Alert-Overlay wurde für lange Twitch-Bits-Namen stabilisiert.

## Betroffene Datei

```text
htdocs/overlays/_overlay-alerts-v2.html
```

## Umgesetzt

- Username bricht nicht mehr hässlich um.
- Value-Zeile nutzt `cheert mit <amount> Bits`.
- Kein `...` mehr bei Usernamen.
- Runtime-Fit verkleinert lange Namen.
- Bei sehr langen Namen wird der linke Initial-Kreis ausgeblendet, damit der vollständige Name sichtbar bleibt.

## Validierung

Test mit:

```text
CrazyMeerschweinchenTV123
```

API bestätigte vollständigen Namen im Event:

```text
user_display = CrazyMeerschweinchenTV123
```

## Bewusst nicht geändert

- Backend
- TTS
- Sound-System
- Queue
- Alert-Regeln
- Datenbank

## Status

Abgeschlossen, sofern der finale 25-Zeichen-Overlay-Test visuell bestätigt ist.

