# Konsolidierte aktuelle STEP-Dokumente

Stand: 2026-05-29  
Erstellt in: STEP534_CURRENT_STEP_DOCS_CONSOLIDATION_BATCH2

## Ziel

Diese Datei fasst alte Einzel-STEP-Dokumente aus `docs/current/` zusammen, damit die eigentliche Current-Doku wieder lesbarer wird.

Die ursprünglichen Einzeldateien werden nicht inhaltlich vergessen, sondern in Quarantine verschoben.

## Konsolidierte Themen

### Alert Provider Safety / STEP202.3 bis STEP204.1

Ausgangsproblem:

- TipeeeStream spiegelte Twitch-Events über den Tipeee-Socket.
- Diese wurden fälschlich als Tipeee-Donation verarbeitet.
- Betroffen waren unter anderem Bits und Raid-Duplikate.

Wichtige Entscheidung:

```text
raw.event.origin == "twitch" -> ignorieren
raw.event.ref beginnt mit "TWITCH_" -> ignorieren
raw.event.type entspricht Twitch-Typen -> ignorieren
```

Ziel:

```text
Twitch-Event kommt genau einmal über Twitch/EventSub.
Tipeee darf keine Twitch-Spiegelungen als Donation in die Alert-Queue schieben.
Echte Tipeee-Donations bleiben erhalten.
```

STEP203 dokumentiert den umgesetzten Stand:

- Mirror-Filter in `backend/modules/tipeee.js`
- globaler Alert-Disable vor Queue/DB-Insert
- klareres Twitch-Subscription-Mapping
- DB-basierte Alert-History über `GET /api/alerts/events?limit=100`
- keine Secrets, keine SQLite-Datei, keine bestehende Route entfernt

Wichtige Alert-Typen:

```text
sub
resub
gift_sub
gift_bomb
gifted_sub_received
```

STEP204.1 dokumentiert den produktiven Regelstand für Sub/Gift/Resub:

```text
ID 55 | twitch | sub       | Sub Standard       | 0+    | aktiv
ID 56 | twitch | sub       | falsche alte Regel | 10-20 | inaktiv
ID 36 | twitch | resub     | Re-Sub             | -     | aktiv
ID 54 | twitch | gift_sub  | Gift Subs 1-4      | 1-4   | aktiv
ID 39 | twitch | gift_bomb | Sub-Bombe 5-9      | 5-9   | aktiv
ID 40 | twitch | gift_bomb | Sub-Bombe 10-20    | 10-20 | aktiv
ID 61 | twitch | gift_bomb | Sub-Bombe ab 21    | 21+   | aktiv
```

Bewusst offen aus diesem Themenblock:

- echte Live-Events Twitch Bits/Raid/Sub/GiftSub/Sub-Bombe im Stream prüfen
- Dashboard-Config-UX für globalen Alert-Schalter schöner machen
- falls bestehende Regeln nur alte Typen nutzen, GiftSub/Sub-Bombe-Regeln im Dashboard prüfen/anlegen
- Tier-spezifische Regeln für Sub/GiftSub/Resub
- Prime-Erkennung, falls Twitch-Daten das später sauber hergeben
- `gifted_sub_received` optional dashboardfähig aktivierbar machen
- TTS pro Text-Event weiter ausbauen:
  - Cheer message
  - Resub message.text
  - Ko-fi/Tipeee Donation message
  - Channelpoints user_input
- HypeTrain-Regeln:
  - Start
  - Progress nach Level/Stufen
  - End
- Dashboard-UX für Spezialbedingungen aus `meta_json.match`

### Alert TTS / STEP206 bis STEP209

STEP206 ergänzt serverseitiges Alert-TTS:

```text
Alert-Regel -> TTS vorbereiten -> erzeugte TTS-Datei über Sound-System abspielen
```

Fachliche Regel:

```text
1. Alert-Sound zuerst
2. Danach Alert-TTS
3. Alert bleibt sichtbar, bis TTS-Ausgabe durch ist
```

Wichtige Defaults:

```text
ttsPrepareUrl = http://127.0.0.1:8080/api/tts/prepare-alert
ttsSoundCategory = tts
ttsSoundSource = alert_tts
ttsSoundPriority = 50
ttsSoundVolume = 85
ttsOutputTarget = device
ttsAfterSoundDelayMs = 250
```

Bewusst offen aus STEP206:

- Dashboard-UX für TTS-Settings pro Regel weiter polieren
- Bits/Resub TTS erst nach erfolgreichem Provider-Test bewusst aktivieren
- TTS-Timing `before_alert` und `with_alert` sind vorbereitet, Fokus aktuell `after_alert`

STEP209 ergänzt echte Einstellungen für den kleinen Nachrichtentext im Alert-Overlay:

```text
messageEnabled
messageScale
messageWidthMode
messageMaxLines
messageWeight
```

Diese Einstellungen betreffen ausschließlich den kleinen User-Text unter dem Alert, z. B. Bits-, Resub- oder Donation-Nachrichten.

Nicht betroffen:

```text
Headline
Betrag/Wert-Zeile
Sound
TTS
Alert-Queue
Regeln
Provider-Logik
```

Bewusst offen aus STEP209:

- Alert Dashboard UI Cleanup
- einheitliche Kachelfarben
- einheitliche Abstände
- einheitliche Feldhöhen
- einheitliche Label-/Hilfetext-Optik
- Designbereich insgesamt ruhiger und konsistenter machen

### Message-Rotator Scheduler / STEP240

Der Message-Rotator bekam einen eigenen Backend-Scheduler, damit Streamer.bot nicht mehr als Timer/Sender arbeiten muss.

Streamer.bot bleibt für Events zuständig:

```text
Stream startet -> /api/message-rotator/start
Stream endet   -> /api/message-rotator/stop
Chat Message   -> /api/message-rotator/tick?user=%userName%
```

Neue Datei:

```text
backend/modules/message_rotator_scheduler.js
```

Wichtige Routen:

```text
GET      /api/message-rotator/scheduler/status
GET/POST /api/message-rotator/scheduler/reload
GET/POST /api/message-rotator/scheduler/start
GET/POST /api/message-rotator/scheduler/stop
GET/POST /api/message-rotator/scheduler/run
GET      /api/message-rotator/scheduler/settings
POST     /api/message-rotator/scheduler/settings
GET      /api/message-rotator/scheduler/routes
```

Zielzustand Streamer.bot:

Behalten:

```text
STREAM - Start mit /api/message-rotator/start
STREAM - Ende mit /api/message-rotator/stop
AUTOPOST - Chat zählen mit /api/message-rotator/tick?user=%userName%
```

Nach erfolgreichem Scheduler-Test deaktivieren:

```text
AUTOPOST - Automatisch senden
```

Manuelle Befehle später prüfen:

```text
AUTOPOST - Kategorie senden
BEFEHL - Discord
BEFEHL - Follow
BEFEHL - Youtube
```

Diese dürfen bei Backend-Delivery nicht zusätzlich noch selbst eine Twitch Message senden.

### VIP Bus Mode Handoff / STEP432 → STEP433

STEP432 war abgeschlossen. VIP bekam einen vorbereiteten Bus-Modus-Schalter mit:

```text
legacy
shadow
play_test
bus_enabled
```

Geprüfter Stand:

```text
vip_sound_overlay.js Version: 1.8.15
Sound-System Version: 0.1.17
```

Routen:

```text
/api/vip-sound/eventbus/sound-command/mode
/api/vip-sound-overlay/eventbus/sound-command/mode
```

Offener Punkt für STEP433:

```text
Nach mode?mode=shadow zeigt die Statusroute wieder vipBusMode: legacy,
obwohl recentCommands den Shadow-Set korrekt enthält.
```

Ziel STEP433:

```text
mode?mode=shadow
→ status.vipBusMode: shadow

mode?mode=play_test
→ status.vipBusMode: play_test
```

Wichtig:

```text
kein produktiver VIP-Bus-Flow
kein automatischer Soundstart über Bus
kein Alert-Flow
kein Bundle/TTS-Flow
keine Overlay-Steuerung
keine DB-Migration
```

Produktiv bleibt:

```text
legacy_sound_system_api
```

## Dateien, die in STEP534 verschoben werden sollen

```text
docs/current/STEP201_MODULE_MATRIX_2026-05-08.csv
docs/current/STEP202_1_SOUNDALERTS_EVENTS_LIMIT_100.md
docs/current/STEP202_1B_SOUNDALERTS_LONGER_LOG.md
docs/current/STEP202_3_ALERTS_URGENT_NEXT_WORK.md
docs/current/STEP202_ALERT_HISTORY_PROVIDER_DIAG_README.md
docs/current/STEP202_TIPEEE_TWITCH_TIMING_CHECK_FIX.md
docs/current/STEP202_TIPEEE_TWITCH_TIMING_SQLITE_CORE.md
docs/current/STEP203_ALERT_PROVIDER_SAFETY_FIX.md
docs/current/STEP204_1_TWITCH_SUB_GIFT_RULE_CLEANUP.md
docs/current/STEP204_TWITCH_SUB_GIFT_RULE_MODEL.md
docs/current/STEP205_ALERT_RULE_VALUE_HINTS.md
docs/current/STEP206_ALERT_TTS_DISPATCH.md
docs/current/STEP207_1_ALERT_TTS_VERIFIED_2026-05-09.md
docs/current/STEP207_ALERT_RULE_TTS_DASHBOARD_SETTINGS.md
docs/current/STEP208_ALERT_OVERLAY_USERNAME_LAYOUT_VERIFIED_2026-05-09.md
docs/current/STEP209_ALERT_MESSAGE_TEXT_SETTINGS_2026-05-09.md
docs/current/STEP240_MESSAGE_ROTATOR_BACKEND_SCHEDULER.md
docs/current/STEP432_TO_STEP433_HANDOFF.md
```

## Nicht aus dieser Konsolidierung ableiten

Diese Doku ersetzt keine Live-Prüfung. Bei echten Codeänderungen weiterhin:

- echte aktuelle Datei prüfen
- keine Funktionalität entfernen
- keine DB überschreiben
- keine Secrets committen
- Dashboard nur über Backend-APIs
- Stepweise testen
