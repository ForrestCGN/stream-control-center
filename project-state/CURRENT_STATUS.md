# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Der Loyalty-Core ist mit STEP203 technisch gestartet.

Vorhandene Referenzen:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`
- `project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md`
- `project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md`
- `project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md`
- `project-state/STEP203_LOYALTY_CORE_DB_API_SHADOW_MODE_2026-05-09.md`

Aktueller Stand:

- `backend/modules/loyalty.js` existiert als Loyalty-Core-Modul.
- `config/loyalty.json` existiert als Seed/Fallback/technische Boot-Konfig.
- StreamElements bleibt aktiv.
- User-Punkte-Import ist weiterhin später vorgesehen.
- Loyalty läuft initial im Shadow Mode.
- Dashboard-Modul ist noch nicht gebaut.

Verbindliche Loyalty-Regeln:

```text
Alles, was Kekskrümel gibt, nimmt, prüft, reserviert, erstattet oder verändert, läuft ausschließlich über das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

```text
Shadow Mode zuerst, StreamElements bleibt aktiv, Import später.
```

Neue STEP203-Routen:

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

Neue DB-Strukturen:

```text
loyalty_users
loyalty_transactions
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_settings
module_text_variants mit module_name = loyalty
```

Bestätigte StreamElements-Werte:

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

## Aktueller TTS-Stand nach STEP200

Der TTS-Block ist technisch umgesetzt, live getestet, im Dashboard eingebunden und nutzt das globale DB-basierte Textvarianten-System.

## Aktueller SoundAlerts-Stand nach STEP193.17.2

SoundAlerts ist bis `STEP193.17.2` technisch umgesetzt, live getestet und dokumentiert. Der aktuelle Backend-Stand ist `soundalerts_bridge` Version `0.1.14`.

## Bewusst offen

- Loyalty-Dashboard-Modul bauen.
- Stream Store / Reward-Items erfassen.
- Giveaway-Settings und Historie prüfen.
- Aktive Chat-Games priorisieren.
- Gewünschte Commands/Aliase festlegen.
- Später StreamElements-Import Dry-Run.
- MariaDB-Adapter später zentral implementieren.
