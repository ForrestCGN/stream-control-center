# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19 – Sound/Text Parallel AND Runtime

## Aktueller bestätigter Stand

Das Modul `stream_events` ist im `stream-control-center` als Backend- und Dashboard-Modul aufgebaut und wurde schrittweise getestet.

Aktueller technischer Stand der zuletzt getesteten Dateien:

```text
MODULE_VERSION: 0.5.10
MODULE_BUILD: STEP_EVS_19D_PARALLEL_CONTEXT_EVENTUID_FIX
```

EVS-18c ist ein Doku-/Lifecycle-Regel-Step. Es gab keine Codeänderung und keine Modulversionserhöhung.

## Erfolgreich getestet

### Backend / Bus / Heartbeat

- `stream_events` lädt sauber.
- Modul ist auf dem vorhandenen `communication_bus` registriert.
- Heartbeat läuft.
- Bus-Status ist sichtbar.
- Keine neue Bus-Struktur wurde gebaut.
- `directSend=false` und `directPlay=false` bleiben die Sicherheits-Vorgabe.

### Dashboard-Grundstruktur

- Event-System ist im Dashboard sichtbar.
- Main-Tabs:
  - Übersicht
  - Events
  - Texte
  - Config
  - Statistik
  - Overlay
- Event-Editor läuft als separates Modal/Fenster.
- Sound-Spiel und Text-Spiel sind keine Haupttabs mehr, sondern Bereiche im Event-Editor.
- Statistik-Tab wurde in Untertabs aufgeräumt:
  - Übersicht
  - Ranking
  - Text-Spiel
  - Sound-Spiel
  - User
- Texte-Tab hat Bereichs-/Modul-Dropdown und Suche, damit man nicht mehr durch alle Textvarianten scrollen muss.

### Text-Spiel Runtime

- Aktive Text-Events können Chatnachrichten auswerten.
- Komplette Satzlösung wird erkannt.
- Erlaubte Antwortvarianten werden erkannt.
- Pro Satz zählt nur der erste komplette Löser.
- Gelöste Sätze werden gespeichert und danach nicht erneut gewertet.
- Worttreffer werden pro Event/Satz/User/Wort nur einmal gespeichert.
- Optionale Wortpunkte werden über das bestehende Punktesystem gebucht.
- Vorbereitete Chat-Ausgaben werden über Payloads erstellt, aber nicht direkt gesendet.
- Textvarianten im Altersheim-/CGN-/Rentner-/Heimleitungsstil funktionieren.

### Text-Spiel Testdaten / Testhelper

- Testevent kann angelegt und gestartet werden.
- Testchat kann per API simuliert werden.
- Report zeigt Worttreffer, Satzlösungen, Ranking und vorbereitete ChatOutputs.

### User-Statistik

- Userliste kann aus Eventdaten aufgebaut werden.
- User-Detailreport existiert.
- User-Detail-Popup ist vorgesehen/umgesetzt.
- AutoReload lädt nur Popup-/Bereichsdaten neu, nicht die ganze Dashboard-Seite.
- Scrollbare Detailansicht wurde berücksichtigt.

### Sound-Spiel Runtime

- Sound-Testevent kann angelegt und gestartet werden.
- Sound-Runden werden in `stream_events_rounds` gespeichert.
- Nächste Sound-Runde kann vorbereitet werden.
- Aktive Sound-Runde kann gelöst werden.
- Aktive Sound-Runde kann als ungelöst markiert werden.
- Sound-Punkte werden in das gemeinsame Ranking gebucht.
- Playback-Payload für Sound-System wird vorbereitet, aber nicht direkt ausgeführt.
- Sound-System-Queue wird nicht berührt.
- Falsche Soundantworten erzeugen keine Chat-Ausgabe, damit kein Spam entsteht.
- Richtige Soundantworten können per Testchat erkannt werden.
- Echte Twitch-Chatantworten über `twitch.chat.message` lösen aktive Soundrunden korrekt.
- `sound.solved` ChatOutput wird vorbereitet.
- Debug-Ausgabe für akzeptierte Sound-Antworten ist im API-/Dashboard-Test sichtbar, nicht im Overlay oder Chat.

### Event-Lifecycle / Archiv-Regeln

- Alle Eventwerte bleiben an die jeweilige `eventUid` gebunden.
- Neues Event bedeutet neue `eventUid` und eigenes Event-Ranking.
- Alte Werte werden nicht in aktive Reports gemischt, wenn eine konkrete/aktive `eventUid` genutzt wird.
- Alte Eventdaten sollen archiviert/historisch abrufbar bleiben.
- Beim Start eines neuen Events wird nichts blind gelöscht.
- Hard-Delete wird später nur als geschützte Owner/Admin-Aktion mit Bestätigung und Audit geplant.

## Zuletzt bestätigter Test

EVS-18 Sound Twitch Chat Answer Runtime:

```text
status.ok=True
moduleVersion=0.5.5
moduleBuild=STEP_EVS_18_SOUND_TWITCH_CHAT_ANSWER_RUNTIME
subscriptionCount=9
soundChatMessagesProcessed=2
soundAnswerMisses=1
soundAnswerMatches=1
active=0
solved=4
soundScoreEntries=4
chatOutputs=4
playbackPayloads=0
directSend=False
```

Ranking im Testevent:

```text
soundtester: 55 Punkte / 2 Einträge
ForrestCGN: 45 Punkte / 2 Einträge
```


### EVS-19d – Parallel Test Event Activation Fix

- Stealth-Testevent-Helper startet neue Kombi-Testevents standardmäßig.
- Alte aktive Test-/Stealth-Events werden beim Helper als `finished` archiviert, nicht gelöscht.
- Der neue Test nutzt dadurch nicht mehr versehentlich ein altes aktives Event.
- `GET /api/stream-events/text-runtime/report` wurde repariert; der versehentlich eingefügte Sound-Debug-Block wurde entfernt.
- `POST /api/stream-events/chat-runtime/test-chat` kann optional `eventUid` nutzen.

## Weiterhin bewusst NICHT produktiv aktiv

- Keine direkte Twitch-Chat-Ausgabe.
- Kein direktes Sound-Playback.
- Keine direkte Sound-System-Queue-Berührung.
- Kein Overlay-Livebetrieb.
- Keine automatische Timer-/Timeout-Steuerung für Soundrunden.
- Keine echte Soundausgabe über Media-/Sound-System.
- Keine produktive Chat-Ausgabe über Bot-Modul.

## Wichtige Projektregeln

- Keine Funktionalität entfernen.
- Immer echte aktuelle Dateien/Repo/ZIP als Source of Truth nutzen.
- Keine Parallelstrukturen bauen, vorhandene Helper/Systeme verwenden.
- EventBus/CommunicationBus verwenden, keinen neuen Bus bauen.
- Media-/Sound-System verwenden, keinen zweiten Player bauen.
- Textvarianten über vorhandene `helper_texts` / DB-Struktur nutzen.
- Dashboard streamer-/modfreundlich halten.
- StepDone vor Live-/Systemtest.


## EVS-19 – Umgesetzt / zu testen

EVS-19 setzt die vom Streamer gewünschte UND-Regel um:

```text
Eine Chatnachricht wird nicht mehr entweder Sound oder Text zugeordnet,
sondern parallel an Sound und Text gegeben, wenn beide Spieltypen aktiv sind.
```

Technisch:

```text
- `processParallelChatMessage(...)` bündelt die koordinierte Auswertung.
- Echte `twitch.chat.message` Bus-Events nutzen diese Parallel-Auswertung.
- Neue API-Testroute `POST /api/stream-events/chat-runtime/test-chat` nutzt dieselbe Logik.
- Neue Testevent-Route `POST /api/stream-events/chat-runtime/create-stealth-test-event?confirm=1` erstellt ein Kombi-Testevent.
```

Sicherheitsstand bleibt unverändert:

```text
directSend=false
directPlay=false
soundSystemQueueTouched=false
preparedOnly=true
```

Noch ausstehend: Live-/API-Test nach StepDone.


## EVS-19a Fixstatus

Der Fehler `getTextPhrases is not defined` im Stealth-Testevent-Endpunkt wurde behoben. Modulstand ist `MODULE_VERSION: 0.5.10` / `MODULE_BUILD: STEP_EVS_19D_PARALLEL_CONTEXT_EVENTUID_FIX`. EVS-19-UND-Auswertung bleibt unverändert aktiv.
