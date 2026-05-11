# CURRENT SYSTEM STATUS - stream-control-center

Stand: 2026-05-11
Quelle: GitHub/dev + bereitgestelltes Projekt-Doku-ZIP vom 2026-05-11

## Kurzstatus

Das Projekt ist aktuell in einem arbeitsfaehigen, aber dokumentationsseitig stark gewachsenen Zustand. Die produktiven Kernsysteme laufen weiter ueber Node/Express auf `127.0.0.1:8080`, Dashboard unter `/dashboard`, SQLite als produktiver Standard/Fallback und zentrale Helper-/DB-Schicht fuer neue Module.

Dieser Stand ersetzt nicht die historischen STEP-Dateien. Er ist die kompakte Orientierung fuer neue Arbeitsschritte.

## Aktuell stabile / abgenommene Bereiche

### Message-Rotator - STABLE nach Livetest

Stand nach STEP229, STEP230A, STEP230B und STEP231:

- Backend-Modul: `backend/modules/message_rotator.js`
- Dashboard-Modul: `htdocs/dashboard/modules/message_rotator.js`
- Dashboard-CSS: `htdocs/dashboard/modules/message_rotator.css`
- Dashboard-Navigation: `System -> Message-Rotator`
- Settings-Tabelle: `message_rotator_settings`
- Textvarianten: `module_text_variants` mit `module = message_rotator`
- JSON bleibt Fallback: `config/message_rotator.json` und `config/messages/*.json`
- Runtime nutzt zuerst DB-Textvarianten und faellt danach auf JSON zurueck.
- Zufallsauswahl aus aktiven Textvarianten funktioniert.
- Dashboard-Bearbeitung fuer Settings, Items und Nachrichten funktioniert.
- Start/Stop/Tick/Next wurde lokal getestet.
- Livetest im Stream lief erfolgreich.

Wichtige Routen:

```text
GET/POST /api/message-rotator/start
GET/POST /api/message-rotator/stop
GET/POST /api/message-rotator/tick
GET/POST /api/message-rotator/next
GET/POST /api/message-rotator/manual
GET      /api/message-rotator/status
GET      /api/message-rotator/integration-check
GET/POST /api/message-rotator/admin/settings
GET/POST /api/message-rotator/admin/texts
```

### Tagebuch / Todo

- API-Integration ist stabil.
- DB-/Settings-/Textvarianten-Integration ist vorhanden.
- Dashboard-Module existieren und dienen als Muster fuer weitere kategorisierte Textvarianten-Editoren.
- Texte sollen weiterhin ueber DB-Varianten laufen, JSON nur als Seed/Fallback.

### Alert-System / Twitch EventSub / TTS

Aktueller Stand nach den juengsten Alert-/Twitch-STEPS:

- Twitch-EventSub-Diagnose vorhanden:
  - `/api/twitch/eventsub/subscriptions`
  - `/api/twitch/eventsub/status`
- Twitch-Event-Simulator im Dashboard vorhanden.
- EventSub-Inbound-Audit schreibt JSONL nach `data/logs/twitch_eventsub_audit.jsonl`.
- Sub/Resub-Puffer fuer `channel.subscribe` vs. `channel.subscription.message` ist aktiv.
- Cheermote-Prefixe werden fuer Bits-TTS erkannt und aus TTS-Texten entfernt.
- Technische Subscription-Tiers werden nicht mehr als User-Message/TTS verwendet.

### Loyalty / Kekskruemel

- Shadow Mode aktiv.
- StreamElements bleibt produktiv aktiv.
- Watch/Lurk-Punkte laufen ueber Twitch Presence + AutoRunner.
- Event-Boni fuer Follow, Sub, Resub, Cheer/Bits, Raid und GiftSub sind vorbereitet/aktiv im Shadow Mode.
- GiftSub-Receiver-Buchung funktioniert, wenn ein `recipientLogin` vorhanden und aktiviert ist.
- Stream-State-Autostart/-Stop fuer Runner ist vorhanden.

### Datenbank / Portabilitaet

- Produktiv aktiv: SQLite `D:\Streaming\stramAssets\data\sqlite\app.sqlite`
- Zentrale DB-Schicht fuer neue Arbeit: `backend/core/database.js`
- `sqlite_core.js` bleibt als bestehender Kompatibilitaets-/Altbestand erhalten.
- MariaDB/MySQL sind geplant, aber nicht aktiv.
- Keine produktive Umschaltung auf MariaDB/MySQL ohne echten Adapter, Treiber, Testplan, Migration und Rollback.

Bereits auf `backend/core/database.js` portierte Bereiche laut aktuellem Projektstand:

```text
kofi.js
tipeee.js
twitch.js
sound_system.js
dashboard_auth.js
alert_system.js
tagebuch.js
todo.js
challenge.js
```

## Dashboard-Architektur - aktuelles Muster

Neue Dashboard-Module sollen weiterhin nach diesem Muster gebaut werden:

```text
htdocs/dashboard/index.html            -> CSS/JS/Panel einbinden
htdocs/dashboard/app.js                -> Modul registrieren + Katalog aktivieren
htdocs/dashboard/modules/<modul>.js    -> UI/Logik, nur Backend-APIs nutzen
htdocs/dashboard/modules/<modul>.css   -> Modul-Styles
backend/modules/<modul>.js             -> API/Runtime/Settings/Textzugriff
project-state/STEPxxx_*.md             -> STEP-Doku
```

Dashboard-Regel bleibt:

```text
Dashboard liest/schreibt nie direkt SQLite oder Dateien.
Dashboard nutzt immer Backend-APIs.
```

## Doku-/Projektstruktur - bereinigte Orientierung

### Aktive Einstiegspunkte

```text
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
```

### Historische Analyse-Snapshots

Diese bleiben historische Referenz und werden nicht blind ueberschrieben:

```text
docs/backend/Backend_Systemuebersicht_2026-05-03.txt
docs/dashboard/DASHBOARD_SYSTEMUEBERSICHT_IST_STAND_2026-05-03.txt
docs/database/ForrestCGN_Datenbank_Uebersicht_app_sqlite_2026-05-03.txt
docs/overlays/overlay_iststand_analyse.txt
docs/system-inspection/2026-05-03/SYSTEM_INSPEKTION_MASTER_TODO_v1_1_FINAL_GITHUB_2026-05-03.txt
```

### Doku-Befund aus STEP232

Das bereitgestellte ZIP enthaelt:

```text
578 Dateien gesamt
101 Dateien in docs/
477 Dateien in project-state/
60 Dateien in docs/current/
466 Dateien direkt unter project-state/
127 Dateien mit APPEND im Namen
26 STATUS_NOTE-Dateien
15 HANDOFF-Dateien
155 STEP201-bezogene Dateien
```

Bewertung:

- Die Historie ist wertvoll, aber als Arbeitsbasis zu laut.
- Neue Arbeit soll sich an den fuenf aktiven Einstiegspunkten orientieren.
- Alte APPEND-/STATUS_NOTE-/HANDOFF-Dateien sollen nicht geloescht werden, aber in der taeglichen Arbeit nicht mehr als erste Quelle dienen.

## Aktuelle wichtigste offene Punkte

Prioritaet A:

1. Message-Rotator final im Repo dokumentiert halten und keine weiteren Sofortumbauten.
2. Twitch/EventSub-Audit im echten Stream weiter beobachten.
3. Alert-System-Sonderfaelle spaeter sauber planen: Prime-Sub, GiftBomb 101+, HypeTrain, Shoutout-Statistik.

Prioritaet B:

1. Hug/Rehug ins aktuelle Dashboard-/DB-/Textvarianten-Muster ueberfuehren.
2. SoundAlerts/Sound-System weiter vereinheitlichen.
3. Rotator optional spaeter um History/Statistik erweitern.

Prioritaet C:

1. Doku-Altdaten spaeter in einem separaten Archiv-STEP physisch sortieren.
2. `project-state` auf aktive Zusammenfassungen + historische STEP-Dateien reduzieren.
3. APPEND-Dateien nach Uebernahme in Hauptdokumente als historische Append-Dateien einordnen.

## Arbeitsregel fuer die naechsten Schritte

- Erst echten Datei-/Repo-Stand pruefen.
- Keine Funktionen entfernen.
- Keine SQLite-Datei ersetzen.
- Neue Module DB-/Helper-/Dashboard-faehig bauen.
- Texte immer variantenfaehig und dashboardfaehig planen.
- Historische STEP-Dateien nicht blind loeschen.
- Bei Aufraeumarbeiten erst dokumentieren, dann verschieben/archivieren.


## STEP233 - Doku-Fragmente archivieren

- Archivierung alter Append-/Status-/Handoff-Fragmente vorbereitet.
- 187 geprüfte Dateien werden per `tools/archive_docs_step233.ps1` in Archivordner verschoben.
- Es wird nichts gelöscht; Inhalte bleiben im Repo erhalten.
- Aktive Einstiegsdokus bleiben direkt sichtbar.
