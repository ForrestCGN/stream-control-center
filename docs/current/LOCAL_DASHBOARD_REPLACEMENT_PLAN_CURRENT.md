# Local Dashboard Replacement Plan Current

Stand: 0.2.20B

0.2.19 richtete die lokale/remote OBS-Seite als spaetere Mod-Bedienflaeche aus:

```text
- dieselbe Remote-Modboard-UI online und lokal
- aktuelle Szene prominent
- produktive Szenen = Szenen ohne fuehrenden `_`
- interne `_`-Szenen in normaler Mod-Ansicht ausgeblendet
- Audioquellen read-only sichtbar
- Quellen nur kompakte Vorschau
- Rollen-/Rechte-Zielbild sichtbar vorbereitet
```

0.2.20/0.2.20B setzt die Entscheidung `Inventar langsam, Bedienstatus schnell` technisch fuer online um:

```text
- lokaler Live-Status bleibt ueber /api/remote-agent/obs/live/status
- Stream-PC sendet schnellen read-only Live-State ueber bestehende Agent-WSS-Verbindung
- Webserver haelt Live-State nur in Memory
- Online-UI nutzt /api/remote/agent/obs/live/status fuer aktuelle Szene
- Heartbeat bleibt klein und transportiert kein OBS-Inventar
- Inventar bleibt langsam/manuell und online ohne lokale OBS-Daten leer/placeholder
```

Sicherheitsgrenzen bleiben unveraendert:

```text
keine OBS-Steuerung
keine Agent-Actions
keine Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS-Payloads
keine Secrets in Logs, Status, UI oder Doku
```

Technikdetails wie Agentstatus, Inventarstatus, ENV-Diagnose, interne Szenen und komplette Quellenliste gehoeren spaeter in Admin / Diagnose.
