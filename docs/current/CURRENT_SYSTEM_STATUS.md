# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Der Loyalty-Core wurde mit STEP203 technisch begonnen.

Aktueller Loyalty-Stand:

- `backend/modules/loyalty.js` existiert.
- `config/loyalty.json` existiert als Seed/Fallback/technische Boot-Konfig.
- Loyalty startet im Shadow Mode.
- StreamElements bleibt aktiv.
- User-Punkte-Import kommt später.
- Es gibt noch kein Loyalty-Dashboard-Modul.

Verbindliche Loyalty-Hauptregel:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

Verbindliche Loyalty-Datenregel:

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

Verbindliche Startstrategie:

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

## STEP203 Basis-Routen

```text
GET    /api/loyalty/status
GET    /api/loyalty/config
GET    /api/loyalty/settings
POST   /api/loyalty/settings
GET    /api/loyalty/users
GET    /api/loyalty/users/:login
GET    /api/loyalty/balance/:login
GET    /api/loyalty/transactions
POST   /api/loyalty/transactions/adjust
GET    /api/loyalty/test/watch
GET    /api/loyalty/ignored-users
POST   /api/loyalty/ignored-users
DELETE /api/loyalty/ignored-users/:login
GET    /api/loyalty/routes
```

## Bestätigte StreamElements-Loyalty-Werte

```text
Loyalty enabled: Ja
Currency name: Kekskrümel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x
Viewer: 2 Kekskrümel alle 10 Minuten
Subscriber: 6 Kekskrümel alle 10 Minuten
Follower bonus: 10 Kekskrümel
Tip bonus: 10 Kekskrümel pro 1,00 EUR
Subscriber bonus: 50 Kekskrümel
Cheer bonus: 10 Kekskrümel pro 100 Bits
Raid bonus: 50 Kekskrümel
Ignored users:
- STREAMELEMENTS
- FORRESTCGN
Punkteverfall: nach mehr als 1 Jahr Inaktivität auf dem Channel
```

Auslegung:

```text
Subscriber erhalten Watch amount 2 x Subscriber multiplier 3 = 6 Kekskrümel.
```

## SoundAlerts / Sound-System

SoundAlerts ist bis `STEP193.17.2` technisch umgesetzt, live getestet und dokumentiert.

## TTS

Der TTS-Block ist technisch umgesetzt, live getestet, im Dashboard eingebunden und nutzt das globale DB-basierte Textvarianten-System.

## Bewusst offen

- Loyalty-Dashboard-Modul bauen.
- Stream Store / Reward-Items erfassen.
- Giveaway-Settings erfassen.
- Aktive Chat-Games priorisieren.
- Commands/Aliase festlegen.
- StreamElements-Import später als Dry-Run.
- MariaDB-Adapter später zentral in `backend/core/database.js` implementieren.
