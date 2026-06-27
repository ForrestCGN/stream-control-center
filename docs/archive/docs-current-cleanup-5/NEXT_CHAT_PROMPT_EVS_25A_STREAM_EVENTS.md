# NEXT CHAT PROMPT – stream_events nach EVS-25a

Wir arbeiten am Projekt `stream-control-center` für ForrestCGN, Modul `stream_events` / Event-System.

Bitte halte dich an den Master-Prompt und an die Projektregeln:

- Keine Funktionalität entfernen.
- Vor Änderungen echte aktuelle Dateien / GitHub-dev / Live-Stand prüfen.
- Keine Annahmen über vorhandene Helper, Module, Routen oder Dashboard-Struktur.
- Vor System-/Live-Test immer `stepdone.cmd` ausführen.
- ZIPs immer mit echten Zielpfaden ab Repo-Root.
- Dashboard für Streamer/Mods einfach halten; technische Details nur in Admin/Diagnose.

## Aktueller Stand

Letzter vorbereiteter Stand:

```text
EVS-25a – Empty Overview Action Cleanup
MODULE_VERSION = 0.5.22
MODULE_BUILD   = STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
```

EVS-25a räumt die Event-System-Übersicht auf:

- `Event-System → Übersicht` ist die normale Status-/Startseite.
- Der eigene `Status`-Tab ist aus der normalen Navigation entfernt.
- Bei keinem aktiven Event zeigt die Übersicht:
  - `INAKTIV / Kein Event läuft`,
  - darunter `Nächstes Event` mit Button `Events öffnen`.
- Keine technischen Dispatcher-/DirectSend-/Prepared-only-Blöcke in der normalen Streamer-/Mod-Ansicht.
- Bei aktivem Event soll die Übersicht relevante Werte zeigen:
  - Sound-Aufgaben gesamt/gelöst/offen,
  - Text-Aufgaben gesamt/gelöst/offen,
  - Teilnehmer,
  - Top-Spieler / Top-Punkte.

## Bewusste Dashboard-Regel

Forrest hat festgelegt:

```text
Normales Dashboard = Streamer/Mod-freundlich.
Admin/Diagnose = technische Details.
```

Nicht in die normale Ansicht gehören:

- Dispatcher,
- DirectSend,
- Prepared-only,
- Blockierlisten,
- interne Payloads,
- API-Sicherheitsdetails,
- Chat-Abo-/Chat-Auswertungs-Erklärungen.

## Wichtige Systemregeln

- Event-System ist nur relevant, wenn ein Event aktiv läuft.
- Stream offline oder kein aktives Event = keine Event-Runtime nötig.
- Zentraler Twitch-Chat kann weiter über bestehende Systeme laufen, aber `stream_events` soll nur für aktive Events reagieren.
- Live-Chatmeldungen und Sound-Playback sind weiterhin nicht aktiviert.
- Sound-System-Queue nicht unkontrolliert berühren.
- Bestehende Helper/Systeme nutzen statt parallele Strukturen zu bauen.

## Direkt nach Chatstart prüfen

Falls EVS-25a noch nicht eingespielt wurde:

```powershell
cd /d D:\Git\stream-control-center
node -c .ackend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-25a Empty Overview Action Cleanup"
```

Dann Status prüfen:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```text
moduleVersion : 0.5.22
moduleBuild   : STEP_EVS_25A_EMPTY_OVERVIEW_ACTION_CLEANUP
lastError     :
```

## Sinnvoller nächster Schritt

Nicht sofort neues Sicherheits-/Techniksystem bauen.

Erst prüfen:

1. Wie sieht `Event-System → Übersicht` ohne aktives Event aus?
2. Danach ein Testevent aktiv starten und prüfen:
   - Aufgaben/Gelöst/Offen korrekt?
   - Top-Spieler korrekt?
   - Übersicht für Streamer/Mods verständlich?
3. Danach nur kleine UI-Korrektur, falls aktive Übersicht noch nicht passt.

Erst nach sauberer aktiver Übersicht wieder über Live-Chatmeldungen oder Playback sprechen.
