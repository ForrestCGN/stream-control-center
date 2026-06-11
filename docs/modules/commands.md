# commands.js – STEP226 / LWG-6.7

Aktueller bestätigter Stand:

- Version: `0.2.3`
- Build: `LWG_6_5_GAMBLE_RESULT_LOG_CLEANUP`

Relevanz für Gamble:

- `!gamble` wird über das zentrale Command-System erkannt.
- Chat-Ausgabe erfolgt über `twitch_presence`, wenn `sendResultToChat=true` gesetzt ist.
- Das strukturierte Gamble-Ergebnis wird im Command-Ergebnis und im Command-Log weitergereicht.

Dashboard-Relevanz:

- `enabled`
- `cooldownUserMs`
- `cooldownGlobalMs`
- `targetUrl`
- `config.sendResultToChat`
- `config.moduleCommand`
- `config.activationState`

Diese Werte sollen später über ein Admin-Dashboard sichtbar bzw. teilweise steuerbar sein.
