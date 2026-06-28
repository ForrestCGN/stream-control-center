# Local Dashboard Replacement Plan Current

Stand: 0.2.19

0.2.18D verbesserte den lokalen OBS-Inventar-Read diagnostisch:

```text
- remote_agent erkennt OBS_WS_URL und OBS_WS_PASSWORD aus der lokalen .env.
- OBS_WS_URL=ws://127.0.0.1:4455 reicht als lokaler Alias, um den read-only Inventar-Read zu aktivieren.
- Diagnose-Endpunkt: /api/remote-agent/obs/inventory/status.
- Remote-Modboard online bleibt read-only Placeholder.
```

0.2.19 richtet die lokale/remote OBS-Seite als spaetere Mod-Bedienflaeche aus:

```text
- dieselbe Remote-Modboard-UI online und lokal
- aktuelle Szene prominent
- produktive Szenen = Szenen ohne fuehrenden `_`
- interne `_`-Szenen in normaler Mod-Ansicht ausgeblendet
- Audioquellen read-only sichtbar
- Quellen nur kompakte Vorschau
- Rollen-/Rechte-Zielbild sichtbar vorbereitet
```

Sicherheitsgrenzen bleiben unveraendert:

```text
keine OBS-Steuerung
keine Agent-Actions
keine Writes
keine DB-Migration
keine Shell-/Datei-/Prozess-Actions
keine freien OBS-Payloads
```

Technikdetails wie Agentstatus, Inventarstatus, ENV-Diagnose, interne Szenen und komplette Quellenliste gehoeren spaeter in Admin / Diagnose.
