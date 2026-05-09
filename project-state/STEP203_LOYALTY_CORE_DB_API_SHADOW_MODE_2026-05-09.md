# STEP203 - Loyalty Core DB + Basis-API Shadow Mode

Stand: 2026-05-09

## Ziel

Dieser STEP implementiert den ersten technischen Loyalty-Core im Shadow Mode.

StreamElements bleibt aktiv. Es werden keine bestehenden StreamElements-Punkte importiert und keine produktiven Rewards/Giveaways/Games umgestellt.

## Umgesetzt

Neue Dateien:

```text
backend/modules/loyalty.js
config/loyalty.json
project-state/STEP203_LOYALTY_CORE_DB_API_SHADOW_MODE_2026-05-09.md
```

Aktualisierte Dokus:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/CHANGELOG.md
project-state/FILES.md
```

## Genutzte bestehende Helper / Core-Strukturen

Der STEP nutzt vorhandene Projektstrukturen:

```text
backend/core/database.js
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_texts.js
```

Keine neue Parallelstruktur für DB, Settings, Config oder Texte.

## Neue Backend-Datei

```text
backend/modules/loyalty.js
```

Modul-Version:

```text
0.1.0
```

Das Modul wird über den vorhandenen Modul-Loader in `backend/server.js` automatisch geladen, weil es `init(ctx)` exportiert.

## Neue Config

```text
config/loyalty.json
```

Wichtig:

```text
Diese Datei ist nur Seed/Fallback/technische Boot-Konfig.
Produktive Daten liegen in der DB.
```

## Neue DB-Strukturen

Sanft per `CREATE TABLE IF NOT EXISTS` über `backend/core/database.js` / `database.ensureSchema`.

```text
loyalty_users
loyalty_transactions
loyalty_reservations
loyalty_imports
loyalty_ignored_users
loyalty_settings
module_text_variants mit module_name = loyalty
```

## Modus

Startmodus:

```text
loyalty.mode = shadow
```

Shadow Mode bedeutet:

```text
Das System rechnet und speichert intern mit,
aber StreamElements bleibt produktiv aktiv.
```

## Basis-Routen

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

## Test-Route

Für lokale Shadow-Tests:

```text
GET /api/loyalty/test/watch?login=testuser&displayName=TestUser
GET /api/loyalty/test/watch?login=testsub&displayName=TestSub&subscriber=1
```

Erwartung:

```text
normaler Viewer: +2
Subscriber: +6
```

## Transaktionspflicht

Jede Punkteänderung erzeugt einen Eintrag in:

```text
loyalty_transactions
```

Mit u. a.:

```text
transaction_uid
user_login
amount
balance_before
balance_after
balance_field
type
source_module
source_provider
mode
reason
reference_type
reference_id
created_at
metadata_json
```

## Ignored Users

Aus Seed/Fallback werden beim ersten Start in die DB übernommen:

```text
streamelements
forrestcgn
```

Ignored Users bekommen keine Punkte, solange sie aktiv ignoriert sind.

## Texte

Default-Texte werden über vorhandene Text-Helper als Modultexte vorbereitet:

```text
module_name = loyalty
```

Ziel bleibt: Später dashboardfähiger Textvarianten-Editor.

## Keine Umstellung

Nicht Bestandteil dieses STEPs:

- kein StreamElements-Import
- keine StreamElements-Abschaltung
- kein Dashboard-Modul
- keine Rewards
- keine Giveaways
- keine Games
- keine Overlays
