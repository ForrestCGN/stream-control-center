# CURRENT STATUS - stream-control-center

Stand: 2026-05-06

## Aktueller SoundAlerts-Stand nach STEP193.16

SoundAlerts ist bis `STEP193.16` technisch umgesetzt und live getestet. Der aktuelle Backend-Stand ist `soundalerts_bridge` Version `0.1.14`.

Backend:

- `backend/modules/soundalerts_bridge.js`
- Version: `0.1.14`
- DB-Zugriffe laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback.

Dashboard:

- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- Uebersicht zeigt relevante Kennzahlen und die letzten 5 abspielbaren Events.
- Eintraege koennen gefiltert werden: Alle, Aktiv, Inaktiv, Zur Pruefung, Datei fehlt, Ignoriert.
- Automatisch erkannte Eintraege bleiben `Zur Pruefung`, bis sie einzeln gespeichert/freigegeben werden.
- Globales Speichern gibt keine anderen Review-Eintraege frei.
- Inaktive vollstaendige Eintraege zaehlen nicht als offene Einrichtung.
- Events werden als Historie klarer dargestellt: Kein aktueller Eintrag / Parse-Fehler / Replay nur bei Datei.
- Parser-Formate sind unter `Bot & Settings > Chat-Erkennung` dashboardfaehig.
- Eintraege haben Test-Buttons.
- Lokaler Overlay-Test ist vorbereitet.
- Nach Upload/Speichern bleibt der aktuell bearbeitete Eintrag selektiert.
- Ausgabeziel orientiert sich an Medientyp und globalem Audio-/Video-Ziel.

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

Parser-Fachregel:

```text
parser.messageFormats liegt in soundalerts_bridge_settings.
Die Werte muessen echte Objekt-Arrays sein, nicht [object Object].
```

Aktuell erkannte Formate:

```text
ForrestCGN spielt Lily was here fuer 0 Bits!
ForrestCGN loest Airhorn mit 0 Bits aus
```

Review-Fachregel:

```text
Zur Pruefung = automatisch erkannt, noch nicht einzeln freigegeben.
Aktiv = gespeichert/freigegeben und aktiv.
Inaktiv = gespeichert, aber bewusst deaktiviert.
Datei fehlt = Name/Datei fehlt oder Platzhalter-Datei.
Ignoriert = technisch vorhanden, aber nicht prominent im normalen Workflow.
```

Test-Fachregel:

```text
Normaler Eintrag-Test nutzt das gespeicherte Ausgabeziel.
Overlay-Test darf temporaer outputTarget=overlay senden, ohne den Eintrag dauerhaft umzuschalten.
```

## Bewusst offen

- Overlay-Bugs in `htdocs/overlays/sound_system_overlay.html` spaeter separat beheben.
- Audio/Video-Verhalten im lokalen Overlay weiter testen.
- Falls gewuenscht spaeter Event-Tab-Filter ergaenzen.
- Falls gewuenscht spaeter Statistik backendseitig erweitern.
- Clip-System live testen.
- MariaDB-Adapter spaeter zentral implementieren.
