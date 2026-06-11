# Modul: loyalty

Stand: 2026-06-11  
Aktueller dokumentierter Stand: STEP211 / LWG-5.3  
Runtime-Basis: STEP210 / LWG-5.2

## Zweck

`loyalty` ist der zentrale Loyalty-/Kekskrümel-Core. Das Modul verwaltet User-Balances, Transaktionen, Shadow-/Live-Modus, Event-Boni, Watch-Earning und seit STEP209 die zentrale Sicherheitslogik für verfügbare Kekskrümel.

## Dateien

```text
backend/modules/loyalty.js
```

## Aktueller bestätigter Runtime-Stand

```text
loyalty.js
version: 0.1.13
step: STEP210
```

STEP209 brachte die zentrale Safety-Schicht. STEP210 bereinigte API-/Statusfelder für Tests und Dashboard.

## Datenbanktabellen

Relevante vorhandene Tabellen/Bereiche:

```text
loyalty_users
loyalty_transactions
loyalty_reservations
command_definitions
module_texts
module_text_variants
```

Regel:

```text
Produktive SQLite-Datenbank niemals ersetzen/überschreiben.
Schemaänderungen nur sanft per CREATE TABLE IF NOT EXISTS / sichere Migrationen.
MySQL/MariaDB-Portabilität bei neuen Queries mitdenken.
```

## Zentrale Sicherheitslogik

Seit STEP209 gilt:

```text
verfügbare Kekskrümel = aktiver Kontostand - offene Reservierungen
```

Zentrale Funktionen im Core:

```text
getReservedAmount()
getAvailableBalance()
canAfford()
spendPointsSafely()
awardPoints()
reservePoints()
releaseReservation()
commitReservation()
getAvailableRank()
```

Wichtig:

```text
recordTransaction() bleibt Low-Level.
Spiele/Commands dürfen direkte negative Buchungen nicht ohne Safety-Prüfung ausführen.
```

## Punkte-/Command-Vorbereitung

Vorbereitet, aber per Command-System deaktiviert:

```text
!punkte / !points
!givepoints
!setpoint
```

Berechtigungen:

```text
!punkte                everyone, zeigt nur eigene verfügbare Kekskrümel + Rang
!punkte @user          Mod/Streamer-Logik im Runtime-Command, zeigt fremde verfügbare Kekskrümel + Rang
!givepoints @user 100  permissionLevel mod
!setpoint @user 1000   permissionLevel streamer
```

`!setpoint` soll nicht hart überschreiben, sondern die Differenz als Transaktion buchen, damit die Historie/Audit-Spur erhalten bleibt.

## API-Routen aus STEP209/STEP210

```text
GET  /api/loyalty/available/:login
POST /api/loyalty/points/can-afford
POST /api/loyalty/points/spend
POST /api/loyalty/points/award
POST /api/loyalty/points/reserve
POST /api/loyalty/points/release-reservation
POST /api/loyalty/points/commit-reservation
GET  /api/loyalty/points/ranking
GET  /api/loyalty/points/commands
POST /api/loyalty/runtime/points-command
```

## Bestätigte Tests

Status:

```text
/api/loyalty/status
module: loyalty
version: 0.1.12 bei STEP209-Test, danach 0.1.13 in STEP210-Paket
mode: shadow
enabled: True
currencyName: Kekskrümel
streamElementsStillActive: True
```

Available Balance Test:

```text
user: forrestcgn
balance: 3400
reserved: 0
available: 3400
rank: 2
rankTotal-Feld vorhanden
```

Can-Afford Test:

```text
amount: 9999999
available: 3400
canAfford: False
missing: 9996599
reason: insufficient_available_balance
```

## Textsystem / Multitexte

Alle Chat-Ausgaben dieses Bereichs müssen über DB/Helper laufen:

```text
module_texts
module_text_variants
helper_texts
```

Stil:

```text
CGN / Altersheim / Heimleitung / Rentner / Keksdose
```

Keine finalen Chat-Texte hart im Code pflegen.

## EventBus / Heartbeats

Das Modul soll im Control-Center sichtbar bleiben. Grundregel:

```text
Modul online/aktiv != Chat-Command aktiv
```

Module bleiben aktiv und melden Status/Heartbeat, Commands werden separat aktiviert.

## Nicht geändert

```text
- Keine produktive DB ersetzt.
- Keine StreamElements-Live-Abschaltung.
- Keine Chat-Commands produktiv aktiviert.
- Keine bestehenden Giveaway-/Wheel-Flows entfernt.
```

## Nächster Schritt

```text
STEP212 / LWG-5.4 – Points Command Runtime kontrolliert testen/freigeben
```

Vor Aktivierung im Chat zuerst gezielt per API/Test-Execute prüfen.
