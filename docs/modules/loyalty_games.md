# Loyalty Games – STEP220 / LWG-6.1

## Stand

`loyalty_games` erhält mit STEP220 eine sichere Runtime-Settings-Route:

- `GET /api/loyalty/games/settings`
- `POST /api/loyalty/games/settings`

Damit können vorhandene Einstellungen aus `loyalty_games_settings` kontrolliert gelesen und gesetzt werden, ohne die SQLite-Datei zu ersetzen.

## Gamble

Gamble bleibt standardmäßig deaktiviert. Der STEP220-Test aktiviert Gamble nur temporär:

- `games.gamble.enabled=true`
- `!gamble` Command temporär enabled
- Testuser bekommt temporären Punktestand
- `!gamble` wird einmal kontrolliert ausgeführt
- Settings, Command-Status und Punktestand werden wiederhergestellt

## Sicherheit

Die Zufallsentscheidung bleibt serverseitig über `crypto.randomInt`. Der User kann das Ergebnis nicht über Datum/User-ID/Pattern beeinflussen.
