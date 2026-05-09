# CURRENT SYSTEM STATUS

Stand: 2026-05-09

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Aktueller Loyalty-Stand:

- `STEP194` dokumentiert die StreamElements-Loyalty-Migrationsarchitektur.
- `STEP202` dokumentiert die konkrete Erfassung vor Code-Start.
- `STEP202.1` legt den DB-First-Standard für Loyalty fest.
- `STEP202.2` legt Shadow Mode und konfigurierbare Bonus-Regeln fest.
- `STEP203` hat den Loyalty-Core mit DB, Settings und Basis-API eingeführt.
- `STEP203.1` ergänzt Watch-/Presence-Heartbeat mit Intervall-Schutz.
- StreamElements bleibt unverändert aktiv.
- User-Punkte-Import ist kein Blocker und kommt später.

Aktuelles Modul:

```text
backend/modules/loyalty.js
version 0.1.1
schema version 2
mode shadow
```

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

## Aktive Loyalty-Routen

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
GET    /api/loyalty/watch/heartbeat
POST   /api/loyalty/watch/heartbeat
GET    /api/loyalty/watch/states
GET    /api/loyalty/ignored-users
POST   /api/loyalty/ignored-users
DELETE /api/loyalty/ignored-users/:login
GET    /api/loyalty/routes
```

## Loyalty DB-Strukturen

Aktuell:

```text
loyalty_users
loyalty_transactions
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_settings
loyalty_watch_state
module_text_variants mit module_name = loyalty
```

## Bestätigte StreamElements-Loyalty-Werte

```text
Currency name: Kekskrümel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x
Follower bonus: 10
Tip bonus: 10 pro 1,00 EUR
Subscriber bonus: 50
Cheer bonus: 10 pro 100 Bits
Raid bonus: 50
Ignored users: STREAMELEMENTS, FORRESTCGN
Punkteverfall: nach mehr als 1 Jahr Inaktivität
```

## STEP203.1 Verhalten

Watch-Heartbeat vergibt nur Punkte, wenn das Intervall fällig ist.

```text
Viewer: +2 pro fälligem Intervall
Subscriber: +6 pro fälligem Intervall
zweiter Heartbeat im Intervall: keine neue Transaktion
```

## SoundAlerts / TTS

SoundAlerts bleibt auf `soundalerts_bridge` Version `0.1.14`.
TTS bleibt auf dem nach STEP200 dokumentierten Stand.

## Bewusst offen

- Stream Store / Reward-Items erfassen.
- Giveaway-Settings erfassen.
- Aktive Chat-Games priorisieren.
- Commands/Aliase festlegen.
- Danach STEP203.2: echten Presence-/Streamer.bot-Hook anbinden.
- MariaDB-Adapter später zentral in `backend/core/database.js` implementieren.
