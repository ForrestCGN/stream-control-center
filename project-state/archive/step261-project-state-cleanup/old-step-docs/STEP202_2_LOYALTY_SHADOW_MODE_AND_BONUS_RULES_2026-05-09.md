# STEP202.2 - Loyalty Shadow Mode & Configurable Bonus Rules

Stand: 2026-05-09

## Ziel

Dieser STEP dokumentiert die neue verbindliche Startstrategie fuer das Loyalty-/Kekskruemel-System:

```text
Das neue Loyalty-System wird zuerst parallel im Shadow Mode aufgebaut.
StreamElements bleibt waehrenddessen aktiv.
User-Punkte aus StreamElements werden erst spaeter importiert.
```

Damit kann das neue System mehrere Streams im Hintergrund laufen, echte Events sammeln und berechnen, ohne bestehende Zuschauerpunkte oder StreamElements-Funktionen zu gefaehrden.

## Ausgangslage

Bereits dokumentiert:

- `STEP194` - StreamElements Loyalty Migration Architecture
- `STEP202` - Loyalty Capture & Migration Prep
- `STEP202.1` - Loyalty DB-First Standard

Bestaetigte Regeln:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

```text
DB ist Hauptspeicher.
JSON ist nur Seed/Fallback/technische Boot-Konfig.
```

## Neue Startstrategie

Der StreamElements-Punkteimport ist kein Blocker mehr fuer die erste technische Umsetzung.

Neue Reihenfolge:

```text
1. Loyalty-System parallel aufbauen.
2. StreamElements bleibt aktiv und sichtbar.
3. Neues System sammelt im Hintergrund eigene Shadow-/Testdaten.
4. Mehrere Streams lang Verhalten, Logs und Punkte pruefen.
5. StreamElements-Punkte spaeter importieren.
6. Erst ganz am Ende StreamElements abschalten.
```

## Shadow Mode

### Bedeutung

Shadow Mode bedeutet:

```text
Das System rechnet und speichert intern mit,
aber es ersetzt StreamElements noch nicht produktiv.
```

Erlaubt im Shadow Mode:

```text
eigene DB-Tabellen anlegen
Settings speichern
Shadow-Kontostaende fuehren
Watch-Punkte im Hintergrund berechnen
Event-Boni im Shadow-Modus loggen
Transaktionen nachvollziehbar speichern
Ignored Users pruefen
Sub-Multiplikator pruefen
Admin-/Debug-Status anzeigen
```

Nicht erlaubt im Shadow Mode:

```text
StreamElements abschalten
alte Punkte produktiv ueberschreiben
Rewards produktiv ueber neue Punkte abrechnen
Giveaway-Tickets produktiv ueber neue Punkte abrechnen
Chat-Games produktiv ueber neue Punkte abrechnen
oeffentliche Punkte-Commands ohne Freigabe aktivieren
Overlays als produktive Economy-Anzeige verwenden
```

## Geplante Modus-Settings

Spaetere Settings muessen dashboardfaehig sein und in der DB liegen.

Empfohlene Settings:

```text
loyalty.mode = off | shadow | live
loyalty.enabled = true | false
loyalty.publicCommandsEnabled = true | false
loyalty.modCommandsEnabled = true | false
loyalty.watchEarningEnabled = true | false
loyalty.eventBonusesEnabled = true | false
loyalty.rewardsEnabled = true | false
loyalty.giveawaysEnabled = true | false
loyalty.gamesEnabled = true | false
loyalty.importStatus = not_imported | dry_run | imported
```

Empfohlener Startzustand:

```text
loyalty.mode = shadow
loyalty.enabled = true
loyalty.publicCommandsEnabled = false
loyalty.modCommandsEnabled = true
loyalty.watchEarningEnabled = true
loyalty.eventBonusesEnabled = false
loyalty.rewardsEnabled = false
loyalty.giveawaysEnabled = false
loyalty.gamesEnabled = false
loyalty.importStatus = not_imported
```

## Quellen und Modi sauber markieren

Jede Transaktion soll markieren, wo sie herkommt und in welchem Modus sie entstanden ist.

Empfohlene Felder:

```text
source_provider
source_module
mode
reference_type
reference_id
metadata_json
```

Beispiele:

```text
source_provider = stream_control_center
source_module = loyalty
mode = shadow
type = watch_interval
```

Spaeter beim Import:

```text
source_provider = streamelements
source_module = loyalty_import
mode = live
type = import_streamelements_balance
```

Dadurch bleibt nachvollziehbar:

```text
Welche Punkte wurden im Test gesammelt?
Welche Punkte kamen spaeter aus StreamElements?
Welche Punkte sind produktiv?
```

## Konfigurierbare Bonus-Regeln

Boni duerfen nicht hart im Code verdrahtet werden.

Alle Bonus-Regeln sollen dashboardfaehig und DB-basiert sein.

### Watch-Punkte

Bestaetigter StreamElements-Stand:

```text
Normale Viewer: 2 Kekskruemel alle 10 Minuten
Subscriber: 2 x 3 = 6 Kekskruemel alle 10 Minuten
```

Geplante Settings:

```text
watch_amount
watch_interval_minutes
subscriber_multiplier
```

Wichtig:

```text
Subscriber erhalten nicht separat statisch 6 Punkte.
Subscriber erhalten watch_amount x subscriber_multiplier.
```

### Bestehende Event-Boni

Bestaetigter StreamElements-Stand:

```text
Follower bonus: 10
Tip bonus: 10 pro 1,00 EUR
Subscriber bonus: 50
Cheer bonus: 10 pro 100 Bits
Raid bonus: 50
```

Geplante Settings:

```text
bonus_follow_enabled
bonus_follow_amount

bonus_tip_enabled
bonus_tip_per_eur

bonus_subscribe_enabled
bonus_subscribe_amount

bonus_cheer_enabled
bonus_cheer_per_100_bits

bonus_raid_enabled
bonus_raid_amount
```

### Erweiterte Sub-Boni

Zusaetzlich sollen folgende Boni vorbereitet werden:

```text
new sub bonus
resub bonus
gift sub giver bonus
gift sub receiver bonus
sub streak bonus
```

Geplante Settings:

```text
bonus_resub_enabled
bonus_resub_amount

bonus_gift_sub_giver_enabled
bonus_gift_sub_giver_amount

bonus_gift_sub_receiver_enabled
bonus_gift_sub_receiver_amount

bonus_sub_streak_enabled
bonus_sub_streak_rules_json
```

Beispiel fuer Streak-Regeln als DB-Wert mit JSON-Inhalt:

```json
[
  { "months": 3, "amount": 25 },
  { "months": 6, "amount": 50 },
  { "months": 12, "amount": 100 }
]
```

Wichtig:

```text
JSON-Inhalt in einem DB-Feld ist erlaubt, wenn es sich um eine strukturierte Regel handelt.
Externe JSON-Dateien duerfen nicht produktive Wahrheit fuer Loyalty sein.
```

## Geplante Transaktionstypen

### Watch / Basis

```text
watch_interval
```

### Event-Boni

```text
follow_bonus
subscribe_bonus
resub_bonus
gift_sub_giver_bonus
gift_sub_receiver_bonus
sub_streak_bonus
cheer_bonus
tip_bonus
raid_bonus
```

### Spaeter

```text
reward_redeem
reward_refund
giveaway_ticket
giveaway_refund
game_stake
game_win
game_loss
admin_adjustment
import_streamelements_balance
expiration
reservation_hold
reservation_release
reservation_capture
```

## Auswirkungen auf STEP203

Der naechste technische Schritt kann nun ohne StreamElements-Punkteimport geplant werden.

Neuer Zielname:

```text
STEP203 - Loyalty Core DB + Basis-API Shadow Mode
```

Geplanter Umfang:

```text
backend/modules/loyalty.js
config/loyalty.json als Seed/Fallback
DB-Tabellen fuer Core
/api/loyalty/status
/api/loyalty/settings
/api/loyalty/balance/:login
/api/loyalty/transactions
Shadow-Mode-Settings
keine StreamElements-Abschaltung
kein Import-Zwang
```

## Keine Code-Aenderung in diesem STEP

Dieser STEP ist reine Doku-/Regel-Aenderung.

Keine Code-Aenderung.
Keine API-Aenderung.
Keine DB-Aenderung.
Keine Live-Aenderung.
