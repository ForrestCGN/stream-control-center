# CURRENT SYSTEM STATUS

Stand: 2026-05-06

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## SoundAlerts / Sound-System - aktueller Stand bis STEP193.15

SoundAlerts ist aktuell der aktiv bearbeitete und live getestete Block. Der letzte technische Stand ist `STEP193.15`.

Aktueller Modulstand:

- `soundalerts_bridge` Version: `0.1.13`
- Backend-Datei:
  - `backend/modules/soundalerts_bridge.js`
- Dashboard-Dateien:
  - `htdocs/dashboard/modules/soundalerts.js`
  - `htdocs/dashboard/modules/soundalerts.css`
- Sound-System Overlay:
  - `htdocs/overlays/sound_system_overlay.html`
- Config/Fallback:
  - `config/soundalerts_bridge.json`
- DB ist Hauptspeicher fuer Eintraege, Events, Meta und technische Settings.
- JSON bleibt Seed/Fallback/Notfall.
- SoundAlerts-DB-Zugriffe laufen ueber `backend/core/database.js` bzw. Helper-Schichten.
- SQLite ist produktiv aktiv; MariaDB bleibt spaeteres Ziel, ist aber noch nicht aktiv.

## OBS Loader Standard

SoundAlerts benoetigt weiterhin eine aktiv geladene Browserquelle. Diese Quelle wird nicht als sichtbare/hoerbare Ausgabe genutzt.

Aktueller Standard:

```text
OBS-Quelle: _SoundAlerts_Loader
URL: SoundAlerts Browser Source URL
Groesse: 1x1 px
Audio: im OBS-Mixer stumm
Sichtbar: Ja, nicht per Auge deaktivieren
Quelle herunterfahren, wenn nicht sichtbar: AUS
Browser aktualisieren, wenn Szene aktiv wird: AUS
```

Fachregel:

- Bild/Ton-Ausgabe laeuft ueber das eigene Sound-System.
- Die SoundAlerts-Quelle bleibt nur als aktiver Loader geladen.
- Kein Node-/Headless-Browser-Loader, solange diese OBS-Loesung stabil funktioniert.

## Aktive SoundAlerts-Routen

- `GET /api/soundalerts/status`
- `GET /api/soundalerts/settings`
- `POST /api/soundalerts/settings`
- `GET /api/soundalerts/entries`
- `POST /api/soundalerts/entries`
- `DELETE /api/soundalerts/entries/:entryKey`
- `POST /api/soundalerts/entries/:entryKey/delete`
- `POST /api/soundalerts/entries/:entryKey/ignore`
- `GET /api/soundalerts/config`
- `POST /api/soundalerts/config`
- `POST /api/soundalerts/test/chat`
- `GET /api/soundalerts/events`
- `GET /api/soundalerts/stats`

## Parser / Chat-Erkennung

SoundAlerts-Chattexte werden ueber `parser.messageFormats` erkannt. Diese Formate sind dashboardfaehig und liegen in `soundalerts_bridge_settings`.

Aktuelle Standardformate:

```text
<user> spielt <sound> fuer <amount> <currency>
<user> loest <sound> mit <amount> <currency> aus
```

Beispiele:

```text
ForrestCGN spielt Lily was here fuer 0 Bits!
ForrestCGN loest Airhorn mit 0 Bits aus
```

Wichtiger Fix aus STEP193.11.1:

- `parser.messageFormats` darf nicht als `[object Object]` gespeichert werden.
- Live bestaetigt wurde `0.1.12`, bei dem `messageFormats` wieder als echtes Objekt-Array geladen wurde.

## Dashboard-Workflow SoundAlerts

### Uebersicht

Die Uebersicht zeigt nur relevante Werte und Schnellzugriffe:

- Gesamt
- Aktiv
- Inaktiv
- Datei fehlt
- Zur Pruefung
- Letzte 5 abspielbare Events mit Datei als Replay-Schnellzugriff

Nicht als Handlungsbedarf zaehlen:

- alte/unbekannte Events aus dem Log
- geloeschte Alt-Events
- reine Historie ohne aktuellen Eintrag
- bewusst inaktive vollstaendige Eintraege

`Handlung noetig` erscheint nur, wenn ein aktueller Eintrag wirklich bearbeitet werden muss.

### Eintraege

Eintraege koennen gefiltert werden:

- Alle
- Aktiv
- Inaktiv
- Zur Pruefung
- Datei fehlt
- Ignoriert

Fachregel:

```text
Inaktiv = bewusst deaktiviert und kein offener Arbeitsstand, sofern Name/Datei vorhanden sind.
Zur Pruefung = automatisch erkannt, noch nicht einzeln gespeichert/freigegeben.
Datei fehlt = Name/Datei fehlt oder Platzhalter-Datei.
```

### Review Workflow

Automatisch erkannte Eintraege bleiben sichtbar, bis sie einzeln geprueft und gespeichert/freigegeben werden.

Statuslogik:

- `review_required` / `file_matched` = `Zur Pruefung`
- `active` = gespeichert/freigegeben und aktiv
- `inactive` = gespeichert, aber bewusst deaktiviert
- `missing_file` = Name oder Datei fehlt
- `ignored` = bewusst ignoriert, nicht prominent im Normalfluss

Wichtige Korrektur:

- `Speichern / Freigeben` finalisiert nur den aktuell bearbeiteten Eintrag.
- Globales `Config speichern` gibt keine anderen `Zur Pruefung`-Eintraege frei.
- Uploads bleiben bis zur expliziten Freigabe im Status `review_required`.

### Events

Der Events-Tab ist Historie/Logbuch, nicht automatisch eine aktuelle Aufgabenliste.

Klartextregeln:

- Alte Events zu geloeschten/unbekannten Eintraegen werden als `Kein aktueller Eintrag` dargestellt.
- Parse-/Rohdatenfehler werden als `Parse-Fehler` dargestellt.
- Unbrauchbare Parse-Events bieten keinen sinnlosen `Eintrag erstellen`-Button an.
- Replay wird nur angeboten, wenn eine Datei vorhanden ist.

### Statistik

Die Statistik ist fachlich auf nutzbare Werte ausgerichtet:

- abgespielte Sounds
- Sound-Ausloesungen
- User-Ausloesungen
- verschiedene Sounds
- verschiedene User
- Top-Sounds
- Top-User

## Lokaler Overlay-Test / Test-Ausgabe

Seit STEP193.14/STEP193.15 ist ein lokaler Overlay-Test-Workflow vorbereitet:

- Button `Lokales Overlay` im Dashboard.
- Oeffnet `/overlays/sound_system_overlay.html?debug=1`.
- Eintraege zeigen ihr Ausgabeziel: `Device`, `Overlay`, `Beides`.
- Ausgabeziel ist im Eintrag-Editor bearbeitbar.
- Normaler Test nutzt das gespeicherte Ausgabeziel.
- Overlay-Test kann temporaer `outputTarget: overlay` senden, ohne den Eintrag dauerhaft umzuschalten.

Wichtige Regel:

```text
Produktiv-Ausgabe bleibt gespeichert.
Nur der Overlay-Test darf temporaer auf overlay overriden.
```

## Loeschen / Ignorieren

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

Ignorieren ist nicht prominent im normalen Kartenfluss, bleibt aber technisch vorhanden.

## Live bestaetigte Referenzwerte

```text
soundalerts_bridge version = 0.1.13
upload.maxVideoSizeBytes = 1073741824
parser.messageFormats = echtes Objekt-Array, nicht [object Object]
```

## Bewusst offen

- Sound-System Overlay hat noch Bugs und soll spaeter separat bereinigt werden.
- Audio/Video-Verhalten im lokalen Overlay weiter pruefen.
- Status-/Debuganzeige im Overlay verbessern.
- Bei Bedarf Event-Tab spaeter filtern: Alle / Abgespielt / Fehler / Kein aktueller Eintrag.
- Bei Bedarf Statistik spaeter backendseitig robuster machen.
- Clip-System spaeter live testen.
- MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.
