# CURRENT_STATUS – stream_events / Event-System

Stand: 2026-06-13 nach EVS-19e – Sound/Text Parallel AND Runtime bestätigt

## Aktueller bestätigter Stand

Das Modul `stream_events` ist im `stream-control-center` als Backend- und Dashboard-Modul aufgebaut und wurde schrittweise getestet.

Aktueller technischer Stand der zuletzt getesteten Dateien:

```text
MODULE_VERSION: 0.5.11
MODULE_BUILD: STEP_EVS_19E_TEXT_OPTIONS_REGRESSION_FIX
```

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
- Event-Editor läuft als separates Modal/Fenster.
- Sound-Spiel und Text-Spiel sind Bereiche im Event-Editor.
- Statistik-Tab ist in Untertabs aufgeräumt.
- Texte-Tab hat Bereichs-/Modul-Dropdown und Suche.

### Text-Spiel Runtime

- Aktive Text-Events können Chatnachrichten auswerten.
- Komplette Satzlösung wird erkannt.
- Erlaubte Antwortvarianten werden erkannt.
- Pro Satz zählt nur der erste komplette Löser.
- Gelöste Sätze werden gespeichert und danach nicht erneut gewertet.
- Worttreffer werden pro Event/Satz/User/Wort nur einmal gespeichert.
- Optionale Wortpunkte werden über das bestehende Punktesystem gebucht.
- Vorbereitete Chat-Ausgaben werden erstellt, aber nicht direkt gesendet.

### Sound-Spiel Runtime

- Sound-Testevent kann angelegt und gestartet werden.
- Sound-Runden werden in `stream_events_rounds` gespeichert.
- Nächste Sound-Runde kann vorbereitet werden.
- Aktive Sound-Runde kann gelöst werden.
- Aktive Sound-Runde kann als ungelöst markiert werden.
- Sound-Punkte werden in das gemeinsame Ranking gebucht.
- Playback-Payload für Sound-System wird vorbereitet, aber nicht direkt ausgeführt.
- Sound-System-Queue wird nicht berührt.
- Falsche Soundantworten erzeugen keine Chat-Ausgabe.
- Richtige Soundantworten können per API-Testchat und echter Twitch-Chatnachricht erkannt werden.
- `sound.solved` ChatOutput wird vorbereitet.
- Debug-Ausgabe für akzeptierte Sound-Antworten ist nur API-/Dashboard-Test, nicht Overlay/Chat.

### Event-Lifecycle / Archiv-Regeln

- Alle Eventwerte bleiben an die jeweilige `eventUid` gebunden.
- Neues Event bedeutet neue `eventUid` und eigenes Event-Ranking.
- Alte Werte werden nicht in aktive Reports gemischt, wenn eine konkrete/aktive `eventUid` genutzt wird.
- Alte Eventdaten sollen archiviert/historisch abrufbar bleiben.
- Beim Start eines neuen Events wird nichts blind gelöscht.
- Alte aktive Test-/Stealth-Events dürfen beim Anlegen eines neuen Stealth-Testevents als `finished` archiviert werden.
- Hard-Delete wird später nur als geschützte Owner/Admin-Aktion mit Bestätigung und Audit geplant.

### EVS-19e – Sound/Text Parallel AND Runtime

Bestätigt:

```text
Eine Chatnachricht wird an Sound UND Text gegeben.
Sound blockiert Text nicht.
Text blockiert Sound nicht.
```

Finaler Test:

```text
Event: evs_event_mqcbpyjc_bf53fece7d25
Soundrunde: evs19_sound_schluessel
Nachricht: die heimleitung sucht den schluessel
soundSolved: true
textSolved: true
handledBy: sound, text
Soundpunkte: 30
Textpunkte: 40
chatOutputCount: 2
directSend: false
directPlayback: false
soundSystemQueueTouched: false
```

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
