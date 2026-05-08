# CURRENT STATUS - stream-control-center

Stand: 2026-05-08

## Aktueller TTS-Stand nach STEP199.4

Der TTS-Block ist technisch umgesetzt, live getestet und im Dashboard eingebunden.

Backend:

- `backend/modules/tts_system.js`
- Keine separate Admin-Datei als Zielstand.
- Die temporaere `backend/modules/tts_admin_api.js` wurde wieder entfernt.
- DB-Zugriffe laufen ueber `backend/core/database.js`.
- Settings laufen ueber `backend/modules/helpers/helper_settings.js`.
- JSON `config/tts_config.json` bleibt Seed/Fallback/technische Boot-Konfig.
- Texte liegen aktuell noch in `config/tts_messages.json` und sind noch nicht ins globale DB-Textvarianten-System migriert.

Dashboard:

- `htdocs/dashboard/modules/tts.js`
- `htdocs/dashboard/modules/tts.css`
- Einbindung in `htdocs/dashboard/index.html`
- TTS registriert sich im Dashboard selbst in `window.CGN.modules.tts` und `window.CGN.moduleCatalog.tts`.
- `htdocs/dashboard/app.js` wurde fuer TTS nicht geaendert.

TTS-Routen:

```text
GET/POST /api/tts/run
GET/POST /api/tts/say
GET/POST /api/tts/done
GET      /api/tts/status
GET      /api/tts/overlay-state
GET/POST /api/tts/on
GET/POST /api/tts/off
GET/POST /api/tts/stop
GET/POST /api/tts/clear
GET/POST /api/tts/reload
GET/POST /api/tts/command
GET      /api/tts/settings
GET/POST /api/tts/settings/upsert
GET      /api/tts/events
GET      /api/tts/stats
GET      /api/tts/stats/users
GET/POST /api/tts/prepare-alert
GET/POST /api/tts/synthesize
GET      /api/tts/config
GET      /api/tts/voices
GET      /api/tts/routes
GET      /api/tts/admin/settings
POST     /api/tts/admin/settings
```

TTS Dashboard Tabs:

```text
Uebersicht
User-Statistik
Stimmen
Rollen
Sound-System
Settings
Test
Events
Routen
```

TTS DB-Strukturen:

- `tts_events`
- `tts_usage_daily`
- `tts_settings`

TTS-Statistik:

- `/api/tts/status` zeigt Laufzeit, Queue, Nutzung und Rollen.
- `/api/tts/stats/users` zeigt User-Auswertung: wer wie oft, Zeichen, Fehler, Google/Piper, Dauer, letzte Nutzung, Rollen-Auswertung.
- Dashboard zeigt die User-Statistik mit Zeitraum-/Sortierfilter.

TTS Architekturregel:

```text
TTS erzeugt Audiodateien.
Sound-Ausgabe soll standardmaessig ueber das Sound-System laufen.
Overlay bleibt Visualisierung/Fallback.
Dashboard liest/schreibt nur ueber Backend-APIs.
DB ist aktive Wahrheit fuer dashboardfaehige Settings.
JSON bleibt Seed/Fallback/technische Boot-Konfig.
Sensible technische Zugangsdaten bleiben aus bereinigten Config-/Voice-Routen raus.
```

TTS Dokus:

- `project-state/STEP199_1_TTS_STANDARD_ADMIN_API_2026-05-08.md`
- `project-state/STEP199_2_TTS_DASHBOARD_MODULE_2026-05-08.md`
- `project-state/STEP199_3_TTS_USER_STATS_2026-05-08.md`
- `project-state/STEP199_4_TTS_DASHBOARD_STATS_POLISH_2026-05-08.md`
- `project-state/STEP199_5_TTS_DOC_SYNC_2026-05-08.md`

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

## STEP194 - Loyalty / StreamElements Migration Architektur

Mit `STEP194` wurde ein Architekturstandard fuer die spaetere Migration von StreamElements Loyalty, Stream Store, Giveaways und Chat-Games dokumentiert.

Kernregel:

```text
Alles, was Kekskruemel gibt, nimmt, prueft, reserviert, erstattet oder veraendert, laeuft ausschliesslich ueber das Loyalty-System.
```

Dokument:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`

## Bewusst offen

- TTS-Texte spaeter in das globale DB-basierte Textvarianten-System migrieren.
- TTS Settings-Tab spaeter von Raw-JSON auf fachliche Formulare aufteilen.
- TTS optional: CSV-Export und klickbare Tabellensortierung fuer User-Statistik.
- Overlay-Bugs in `htdocs/overlays/sound_system_overlay.html` spaeter separat beheben.
- Audio/Video-Verhalten im lokalen Overlay weiter testen.
- Clip-System live testen.
- MariaDB-Adapter spaeter zentral implementieren.
- Fuer Loyalty/StreamElements-Migration echte Exportdaten, Store-Items, Giveaway-Settings und aktive Chat-Games erfassen.
