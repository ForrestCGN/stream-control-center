# Current Chat Handoff – STEP223 / LWG-6.4

## Kontext

ForrestCGNs `stream-control-center` hat jetzt ein bestätigtes Loyalty-/Kekskrümel-Basissystem inklusive Gamble.

## Bestätigter Stand

```text
Repository: ForrestCGN/stream-control-center
Branch:     dev
Live:       D:\Streaming\stramAssets
Backend:    http://127.0.0.1:8080
```

Aktive Komponenten:

```text
commands.js       0.2.2 / LWG_5_6_COMMAND_RESULT_CHAT_SEND_BRIDGE
loyalty.js        0.1.13
loyalty_games.js  0.2.4 / STEP_LWG_6_3_GAMBLE_TEXT_PERCENT_PARSER_CLEANUP
```

Aktive Commands:

```text
!punkte / !points
!givepoints
!setpoint
!gamble
```

## Live bestätigter Test

STEP222b wurde erfolgreich ausgeführt:

```text
!gamble 10% berechnet bei 100 verfügbaren Kekskrümeln einen Einsatz von 10
neuer Chattext wurde gesendet
Balance änderte sich im Test korrekt
Testuser wurde wieder auf 0 zurückgesetzt
Settings und Command-Zustand wurden wiederhergestellt
```

## Wichtige Arbeitsregeln

```text
Keine Patches liefern
Keine Funktionalität entfernen
Immer echte aktuelle Dateien als Basis nehmen
Keine DB-Dateien oder Secrets in ZIPs
Bei STEP-/Stable-ZIPs echte Zielpfade nutzen
```

## Aktueller Hinweis

StreamElements darf während der Übergangsphase noch parallel laufen. Alte SE-Antworten können dadurch weiterhin erscheinen.

Vor exklusivem Node-Gamble:

```text
SE !gamble deaktivieren
SE !roulette deaktivieren, falls vorhanden
```

## Nächste sinnvolle Schritte

```text
STEP224 / LWG-6.5 – Gamble strukturierte Result-Daten + Log-Cleanup
STEP225 / LWG-6.6 – StreamElements-Migration/Abschaltung final dokumentieren
STEP226 / LWG-7.0 – Loyalty-Dashboardplanung für Texte/Settings
```
