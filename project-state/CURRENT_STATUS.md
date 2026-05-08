# CURRENT STATUS - stream-control-center

Stand: 2026-05-08

## STEP199.1 - TTS Standard Admin/API

TTS wurde um ein separates Standard-API-Modul erweitert:

- `backend/modules/tts_admin_api.js`
- Version: `0.1.0`
- Doku: `project-state/STEP199_1_TTS_STANDARD_ADMIN_API_2026-05-08.md`

Neue Routen:

```text
GET  /api/tts/config
GET  /api/tts/voices
GET  /api/tts/routes
GET  /api/tts/admin/settings
POST /api/tts/admin/settings
```

Wichtig:

- `tts_system.js` wurde bewusst nicht veraendert.
- Bestehende TTS-Queue, Playback-Logik, Chat-Commands und Sound-System-Anbindung bleiben unveraendert.
- `tts_admin_api.js` liefert nur dashboard-/statusfaehige Standard-Routen.
- `/api/tts/config` merged `config/tts_config.json` mit `tts_settings`, wobei DB-Werte gegenueber JSON gewinnen.
- Secret-/Key-Werte werden in den neuen Config-/Voice-Routen nicht ausgegeben.
- `voices.*.keyFile` wird nicht als Pfad ausgegeben, sondern nur als `keyFileConfigured` und `keyFileExists`.

Architekturregel fuer TTS:

```text
TTS erzeugt Audiodateien.
Sound-Ausgabe soll standardmaessig ueber das Sound-System laufen.
Overlay bleibt Visualisierung/Fallback.
Dashboard liest/schreibt nur ueber Backend-APIs.
DB ist aktive Wahrheit fuer dashboardfaehige Settings.
JSON bleibt Seed/Fallback/technische Boot-Konfig.
Secrets bleiben ENV/Secret-Dateien.
```

## Aktueller SoundAlerts-Stand nach STEP193.17.2

SoundAlerts ist bis `STEP193.17.1` technisch umgesetzt, live getestet und mit `STEP193.17.2` dokumentiert. Der aktuelle Backend-Stand ist `soundalerts_bridge` Version `0.1.14`.

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
- Der Filter-Regression-Bug aus `STEP193.17` ist in `STEP193.17.1` behoben.
- Automatisch erkannte Eintraege bleiben `Zur Pruefung`, bis sie einzeln gespeichert/freigegeben werden.
- Globales Speichern gibt keine anderen Review-Eintraege frei.
- Inaktive vollstaendige Eintraege zaehlen nicht als offene Einrichtung.
- Events werden als Historie klarer dargestellt: Kein aktueller Eintrag / Parse-Fehler / Replay nur bei Datei.
- Parser-Formate sind unter `Bot & Settings > Chat-Erkennung` dashboardfaehig.
- Eintraege haben Test-Buttons.
- Lokaler Overlay-Test ist vorbereitet.
- Nach Upload/Speichern bleibt der aktuell bearbeitete Eintrag selektiert.
- Ausgabeziel ist im Eintrag-Editor nicht mehr manuell auswaehlbar; es orientiert sich automatisch an Medientyp und globalem Audio-/Video-Ziel.

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

## STEP194 - Loyalty / StreamElements Migration Architektur

Mit `STEP194` wurde ein Architekturstandard fuer die spaetere Migration von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games dokumentiert.

Kernregel:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

Dokument:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`

Wichtig:

- Keine Code-Aenderung.
- Keine API-Aenderung.
- Keine DB-Aenderung.
- Keine StreamElements-Abschaltung.
- Der STEP dokumentiert nur den spaeter verbindlichen Aufbau.

Geplante spaetere Zielbereiche:

- Loyalty Core
- Rewards / Stream Store
- Giveaways
- Loyalty Games
- Loyalty-/Game-Overlays

Fachregeln:

- Andere Module duerfen keine Punktestaende direkt schreiben.
- Giveaways, Chat Games, Rewards, SoundAlerts, Challenges, VIP/TTS/Overlays und Streamer.bot-Scripte muessen Punkte ueber Loyalty anfragen.
- Jede Punkteveraenderung muss als Transaktion nachvollziehbar gespeichert werden.
- Overlays zeigen nur fertige Events an und duerfen keine Punkte berechnen oder veraendern.
- StreamElements-Daten muessen importiert und markiert werden, nicht blind ueberschrieben.
- Neue DB-Features sollen ueber `backend/core/database.js` oder vorhandene Helper gekapselt und spaeter MariaDB-tauglich vorbereitet werden.

## Bewusst offen

- STEP199.2: TTS-Routen live pruefen und danach Dashboard-Modul planen/bauen.
- TTS-Texte spaeter in das globale DB-basierte Textvarianten-System migrieren.
- Overlay-Bugs in `htdocs/overlays/sound_system_overlay.html` spaeter separat beheben.
- Audio/Video-Verhalten im lokalen Overlay weiter testen.
- Falls gewuenscht spaeter Event-Tab-Filter ergaenzen.
- Falls gewuenscht spaeter Statistik backendseitig erweitern.
- Clip-System live testen.
- MariaDB-Adapter spaeter zentral implementieren.
- Fuer Loyalty/StreamElements-Migration echte Exportdaten, Store-Items, Giveaway-Settings und aktive Chat-Games erfassen.
