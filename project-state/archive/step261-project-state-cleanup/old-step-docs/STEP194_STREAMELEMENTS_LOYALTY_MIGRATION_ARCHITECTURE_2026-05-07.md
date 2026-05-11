# STEP194 - StreamElements Loyalty Migration / Punktehoheit

Stand: 2026-05-07

## Ziel

Dieses Dokument legt den verbindlichen Architektur-Standard fuer den geplanten Ersatz von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games durch eigene Module im Projekt `stream-control-center` fest.

Wichtigster Grundsatz:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

Damit bleibt die Economy zentral, nachvollziehbar und spaeter dashboardfaehig.

## Ausgangslage

Aktuell werden Teile der Zuschauer-Economy noch durch StreamElements abgedeckt:

- Loyalty Points / Kekskruemel
- Stream Store / Redeems
- Giveaways
- Chat Games, z. B. Bingo, Raffle, Duel, Eight-ball, Slots, Roulette, Votekick, Emote Pyramids

Diese Systeme sollen langfristig in das eigene `stream-control-center` ueberfuehrt werden.

Die bestehenden StreamElements-Daten sollen erhalten bleiben und nicht blind ersetzt werden.

## Sichtbare aktuelle StreamElements-Loyalty-Settings

Aus dem aktuellen StreamElements-Screenshot abgeleitete Werte:

```text
Currency name: Kekskruemel
Watch amount: 2
Interval: 10 Minuten
Subscriber multiplier: 3x

Follower bonus: 10
Tip bonus: 10 pro 1,00 EUR
Subscriber bonus: 50
Cheer bonus: 10 pro 100 Bits
Raid bonus: 50

Ignored users:
- streamelements
- forrestcgn

Punkteverfall:
- Zuschauerpunkte verfallen nach mehr als 1 Jahr Inaktivitaet
```

Diese Werte sind Ist-Stand fuer die spaetere Migration und muessen vor Implementierung gegen echte StreamElements-Exports/Screenshots geprueft werden.

## Harte Architektur-Regel: Punktehoheit

Das Loyalty-System ist die einzige Quelle fuer:

- User-Kontostaende
- Punkte-Transaktionen
- Punkte-Pruefungen
- Punkte-Reservierungen
- Punkte-Erstattungen
- Punkte-Auszahlungen
- Punkteverfall / Inaktivitaetslogik

Andere Module duerfen keine Punktestaende direkt veraendern.

Verboten:

```text
Giveaways schreiben direkt User-Punkte.
Chat Games schreiben direkt User-Punkte.
Rewards schreiben direkt User-Punkte.
SoundAlerts schreiben direkt User-Punkte.
Challenges schreiben direkt User-Punkte.
VIP-/TTS-/Overlay-Code schreibt direkt User-Punkte.
Streamer.bot-Scripte schreiben direkt User-Punkte.
Frontend/Overlay-JavaScript schreibt direkt User-Punkte.
```

Erlaubt:

```text
Andere Module fragen beim Loyalty-System an:
- hat User genug Punkte?
- buche X Punkte ab
- gib X Punkte dazu
- reserviere X Punkte
- erstatte X Punkte
- loese Reservierung auf
- gib Kontostand aus
```

## Transaktionspflicht

Jede Punkteveraenderung muss als Transaktion gespeichert werden.

Jede Transaktion braucht mindestens:

```text
user_login
user_display_name, sofern verfuegbar
amount
balance_before, wenn technisch sinnvoll
balance_after, wenn technisch sinnvoll
type
source_module
source_provider
reason
reference_type
reference_id
created_at
metadata_json
```

Beispiele fuer `type`:

```text
watch_interval
follow_bonus
subscribe_bonus
cheer_bonus
tip_bonus
raid_bonus
reward_redeem
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
```

## Reservierungslogik

Fuer laufende Sessions wird eine Reservierungslogik empfohlen.

Beispiele:

### Duel

```text
!duel @user 1000

1. Herausforderer muss 1000 Kekskruemel haben.
2. Loyalty reserviert 1000 beim Herausforderer.
3. Gegner nimmt an.
4. Loyalty reserviert 1000 beim Gegner.
5. Spiel endet.
6. Loyalty loest Reservierungen auf und zahlt Gewinner aus.
```

### Giveaway

```text
User kauft Tickets.

1. Giveaway fragt Loyalty: genug Punkte?
2. Loyalty bucht oder reserviert Punkte.
3. Giveaway speichert Tickets.
4. Bei Abbruch kann Loyalty sauber erstatten.
```

Reservierungen verhindern, dass ein User dieselben Punkte mehrfach parallel ausgibt.

## Import-Regel fuer StreamElements-Daten

Bestehende StreamElements-Daten duerfen nicht blind ueberschrieben werden.

Importierte Daten muessen markiert werden:

```text
source_provider = streamelements
source_imported_at = Zeitstempel
source_external_id = externe ID, falls vorhanden
source_raw_json = Originaldaten, falls sinnvoll und datenschutzrechtlich unkritisch
```

Importierte Punktestaende werden als Transaktion angelegt, z. B.:

```text
+12345 import_streamelements_balance
```

Nicht als direkte stille Aenderung am User-Datensatz.

## Geplante Modul-Aufteilung

Empfohlene Zielstruktur:

```text
backend/modules/loyalty.js
backend/modules/loyalty_rewards.js
backend/modules/giveaways.js
backend/modules/loyalty_games.js

htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/giveaways.js
htdocs/dashboard/modules/giveaways.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css

config/loyalty.json
config/giveaways.json
config/loyalty_games.json
```

Hinweis:

- JSON bleibt Seed/Fallback.
- DB/Backend ist Hauptsystem.
- Dashboard nutzt nur Backend-APIs.
- Keine direkte Dashboard-Kopplung an SQLite oder Dateien.

## DB-Grundidee

Neue Tabellen muessen sanft angelegt werden:

```text
CREATE TABLE IF NOT EXISTS ...
```

Keine bestehende SQLite-Datenbank ersetzen oder neu bauen.

DB-Zugriffe fuer neue Module sollen ueber `backend/core/database.js` oder vorhandene Helper gekapselt werden.

Neue direkte Kopplung an `sqlite_core.js` vermeiden, wenn ein zentraler DB-Weg moeglich ist.

SQLite bleibt produktiv aktiv. MariaDB bleibt spaeteres Ziel und darf nicht theoretisch bestehende SQLite-Funktionalitaet brechen.

### Loyalty Core

```text
loyalty_users
loyalty_transactions
loyalty_settings
loyalty_reservations
loyalty_imports
loyalty_ignored_users
```

### Rewards / Stream Store

```text
loyalty_rewards
loyalty_reward_categories
loyalty_redemptions
loyalty_reward_cooldowns
```

### Giveaways

```text
giveaways
giveaway_entries
giveaway_winners
giveaway_settings
giveaway_assets
```

### Chat Games

```text
loyalty_games
loyalty_game_settings
loyalty_game_sessions
loyalty_game_entries
loyalty_game_results
```

## Loyalty Core - geplante Verantwortlichkeiten

Das Loyalty-Core-Modul verwaltet:

- Currency-Name, z. B. Kekskruemel
- Watchtime-Intervall
- Punkte pro Intervall
- Subscriber-Multiplikator
- Bonuspunkte fuer Follow/Sub/Cheer/Tip/Raid
- Ignorierte User/Bots
- Punkteverfall nach Inaktivitaet
- User-Kontostaende
- Transaktionshistorie
- Reservierungen
- Admin-Korrekturen
- Import aus StreamElements

## Rewards / Stream Store

Rewards/Store-Items duerfen Punkte nur ueber Loyalty buchen.

Geplante Reward-Felder:

```text
name
slug / entry_key
description
cost_points
active
category
type
quantity_limit
global_cooldown_seconds
user_cooldown_seconds
category_cooldown_seconds
auto_approve
requires_mod_approval
metadata_json
```

Moegliche Reward-Typen:

```text
sound
alert
challenge
tts
overlay
manual
custom
```

## Giveaways

Giveaways sind ein eigenes Modul, aber Punkte laufen ueber Loyalty.

Geplante Funktionen:

- Giveaway erstellen/bearbeiten
- Titel
- Beschreibung
- Preview-Asset
- erstes Ticket gratis
- Chatbestaetigung beim Ticketkauf
- nur Subs erlaubt
- Kosten pro Ticket
- Max Tickets pro User
- Subscriber-Luck / Gewichtung
- Start/Stop/Cancel
- Gewinner ziehen
- vergangene Giveaways anzeigen
- Teilnehmer/Tickets/Statistik anzeigen

Wichtige Regel:

```text
Giveaway speichert Tickets und Gewinner.
Loyalty bucht, reserviert oder erstattet Punkte.
```

## Chat Games

Die vorhandenen StreamElements-Chatspiele sollen als optional aktivierbare eigene Spiele nachgebaut werden.

Bekannte Kandidaten:

```text
Bingo
Raffle
Emote Pyramids
Duel
Eight-ball
Slot Machine
Votekick
Roulette
```

Weitere sinnvolle eigene Spiele:

```text
Coinflip
Wuerfel
Raubzug / Heist
Bossfight
Quiz
Wort-Raetsel / Scramble
Zahlenraten
Arena
Monster-/Kruemel-Jagd
Mission
```

Alle Spiele haben gemeinsame Basisoptionen:

```text
active
command
aliases
global_cooldown_seconds
user_cooldown_seconds
min_stake
max_stake
win_chance
payout_multiplier
text_category
overlay_enabled
history_enabled
```

Wichtige Regel:

```text
loyalty_games berechnet Spielstatus/Ergebnis.
Loyalty bucht Einsatz/Gewinn/Verlust.
```

## Overlay-Regel

Overlays duerfen niemals Punkte berechnen oder veraendern.

Overlays zeigen nur fertige Events an.

Erlaubter Ablauf:

```text
Chat Command
↓
Backend Game-/Giveaway-/Reward-Modul
↓
Loyalty prueft/bucht/reserviert Punkte
↓
Backend sendet fertiges WebSocket-Event
↓
Overlay zeigt Animation/Status/Gewinn/Verlust
```

Nicht erlaubt:

```text
Overlay-JS zieht Punkte ab.
Overlay-JS entscheidet echten Punktgewinn.
Overlay-JS schreibt Kontostand.
```

## Overlay-Zielbild

Ein generisches Overlay fuer kleine Spiele wird empfohlen:

```text
htdocs/overlays/loyalty-games-overlay.html
```

Moegliche WebSocket-Events:

```text
loyalty_game_event
loyalty_giveaway_event
loyalty_reward_event
```

Startfaehige Overlay-Typen:

```text
Coinflip Popup
Wuerfel Popup
Slots Popup
Roulette Popup
Duel Widget
Raffle Widget
Giveaway Widget
Votekick Widget
```

Groessere spaetere Events:

```text
Bossfight Overlay
Arena Overlay
Quiz Overlay
Monster-/Kruemel-Jagd Overlay
Bingo Overlay
```

## Dashboard-Zielbild

Empfohlene Dashboard-Bereiche:

```text
Loyalty
- Uebersicht
- User / Kontostaende
- Transaktionen
- Settings
- Import / Migration

Rewards / Store
- Items
- Kategorien
- Redemptions
- Cooldowns
- Freigaben

Giveaways
- Uebersicht
- Erstellen/Bearbeiten
- Aktive Giveaways
- Teilnehmer
- Gewinner
- Historie

Loyalty Games
- Uebersicht
- Spiel-Konfiguration
- Aktive Sessions
- Ergebnisse/Historie
- Texte
- Overlay-Test
```

## Texte / Varianten

Alle Chat-/Overlay-/Systemtexte muessen langfristig DB-basiert, kategorisiert und variantenfaehig sein.

Keine hart codierten Einzeltexte, wenn sie fuer Chat, Discord, Dashboard oder Overlay sichtbar sind.

Gewuenschte Struktur:

```text
module
category
text_key
variant
active
weight
metadata_json
```

Bestehende Helper fuer Settings/Texte sollen genutzt werden, statt neue Parallelstrukturen zu bauen.

## Sicherheits- und Audit-Regeln

Admin-/Dashboard-Aktionen muessen spaeter auditierbar sein:

- wer hat Punkte geaendert?
- wer hat Reward geloescht?
- wer hat Giveaway gestartet?
- wer hat Gewinner gezogen?
- wer hat Settings geaendert?

Sensible Daten, Tokens, Secrets, `.env`, SQLite-Dateien, Backups und temporäre Dateien duerfen nicht committet werden.

## Migration in kleinen STEPs

Empfohlene weitere Reihenfolge:

### STEP195 - Loyalty Core DB + Settings Plan/Implementierung

- DB-Tabellen fuer User, Settings, Transactions, Reservations
- Basis-API fuer Status/Settings/User/Balance
- keine StreamElements-Abschaltung

### STEP196 - StreamElements Import Dry-Run

- Importformat klaeren
- Dry-Run
- Mapping anzeigen
- keine produktive Ueberschreibung

### STEP197 - Rewards / Stream Store

- Reward-Items
- `!redeem`-Kompatibilitaet
- Cooldowns
- Redemptions

### STEP198 - Giveaways

- Giveaway-Tabellen
- Dashboard-Grundseite
- Ticketkauf ueber Loyalty
- Gewinnerziehung

### STEP199 - Loyalty Games Basis

- einfache Spiele zuerst:
  - Coinflip
  - Wuerfel
  - Roulette
  - Slots
- danach Session-Spiele:
  - Duel
  - Raffle
  - Bingo
  - Votekick

### STEP200 - Overlay-Unterstuetzung

- generisches Loyalty-Games-Overlay
- WebSocket-Events
- kleine Popup-Animationen
- spaeter grosse Community-Widgets

## Bewusst offen

Vor Implementierung noch klaeren:

- Welche StreamElements-Daten koennen exportiert werden?
- Gibt es CSV/JSON/API fuer User-Punkte?
- Welche Store-Items existieren aktuell?
- Welche Giveaways sollen historisch uebernommen werden?
- Welche Chat-Games sind wirklich aktiv und wichtig?
- Welche Commands sollen identisch bleiben?
- Soll `!redeem` weiter genutzt werden?
- Deutsche Aliase gewuenscht?
  - `!punkte`
  - `!einloesen`
  - `!rang`
  - `!ticket`
- Wie stark sollen Overlays am Anfang sichtbar sein?
- Soll es Moderator-Freigaben fuer bestimmte Rewards geben?
- Wie werden Refunds behandelt?

## Kein Code in diesem STEP

Dieser STEP ist reine Doku/Architektur.

Keine Code-Aenderung.
Keine API-Aenderung.
Keine DB-Aenderung.
Keine Live-Aenderung.
