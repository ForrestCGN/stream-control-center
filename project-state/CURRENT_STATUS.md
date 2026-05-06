# CURRENT STATUS - stream-control-center

Stand: 2026-05-06

## Aktueller SoundAlerts-Stand nach STEP193.11

SoundAlerts ist bis `STEP193.8.1` technisch umgesetzt, mit `STEP193.9` als stabiler Doku-/Handoff-Stand zusammengefasst und mit `STEP193.10` um einen Parser-Fix erweitert.

Backend:

- `backend/modules/soundalerts_bridge.js`
- Version: `0.1.11`
- DB-Zugriffe laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.


Parser:

- Erkennt altes Format: `<user> spielt <sound> für <amount> Bits!`.
- Erkennt neues Format: `<user> löst <sound> mit <amount> Bits aus`.
- Behebt `parse_failed` bei `ForrestCGN löst Airhorn mit 0 Bits aus`.

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- Uebersicht zeigt relevante Kennzahlen und die letzten 5 abspielbaren Events.
- Eintraege koennen gefiltert werden: Alle, Aktiv, Inaktiv, Zur Pruefung, Datei fehlt, Ignoriert.
- Automatisch erkannte Eintraege bleiben `Zur Pruefung`, bis sie einzeln gespeichert/freigegeben werden.
- Globales Speichern gibt keine anderen Review-Eintraege frei.
- Inaktive vollstaendige Eintraege zaehlen nicht als offene Einrichtung.
- Events werden als Historie klarer dargestellt: Kein aktueller Eintrag / Parse-Fehler / Replay nur bei Datei.

DB-Strukturen:

- `soundalerts_bridge_events`
- `soundalerts_bridge_entries`
- `soundalerts_bridge_meta`
- `soundalerts_bridge_settings`

OBS Loader:

```text
_SoundAlerts_Loader bleibt als aktive, stumme 1x1-OBS-Browserquelle geladen.
Nicht per Auge deaktivieren.
Bild/Ton-Ausgabe laeuft ueber das eigene Sound-System.
```

Review-Fachregel:

```text
Zur Pruefung = automatisch erkannt, noch nicht einzeln freigegeben.
Aktiv = gespeichert/freigegeben und aktiv.
Inaktiv = gespeichert, aber bewusst deaktiviert.
Datei fehlt = Name/Datei fehlt oder Platzhalter-Datei.
Ignoriert = technisch vorhanden, aber nicht prominent im normalen Workflow.
```

## Bewusst offen

- Live-Test beim Einrichten fortsetzen.
- Falls gewuenscht spaeter Event-Tab-Filter ergaenzen.
- Falls gewuenscht spaeter Statistik backendseitig erweitern.
- Clip-System live testen.
- MariaDB-Adapter spaeter zentral implementieren.

## SoundAlerts Parser-Formate

Ab `STEP193.11` sind die SoundAlerts-Chattext-Formate ueber das JSON-Setting `parser.messageFormats` konfigurierbar.

Standardmaessig aktiv:

```text
<user> spielt <sound> fuer <amount> <currency>
<user> loest <sound> mit <amount> <currency> aus
```

Neue Formate koennen ueber Regex + Gruppen-Zuordnung ergaenzt werden, ohne die Parser-Funktion selbst umzubauen.
