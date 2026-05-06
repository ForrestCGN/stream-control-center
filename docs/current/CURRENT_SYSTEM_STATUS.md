# CURRENT SYSTEM STATUS

Stand: 2026-05-06

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## SoundAlerts / Sound-System - aktueller Stand bis STEP193.11

`STEP193.11` erweitert den SoundAlerts-Parser fuer ein weiteres deutsches SoundAlerts-Chatformat. Der Dashboard-/Review-Workflow aus STEP193.9 bleibt unveraendert.

Aktueller Modulstand:

- `soundalerts_bridge` Version: `0.1.13`
- Dashboard-Dateien:
  - `htdocs/dashboard/modules/soundalerts.js`
  - `htdocs/dashboard/modules/soundalerts.css`
- Backend-Datei:
  - `backend/modules/soundalerts_bridge.js`
- Config/Fallback:
  - `config/soundalerts_bridge.json`
- DB ist Hauptspeicher fuer Eintraege, Events, Meta und technische Settings.
- JSON bleibt Seed/Fallback/Notfall.
- SoundAlerts-DB-Zugriffe laufen ueber `backend/core/database.js` bzw. Helper-Schichten.
- SQLite ist produktiv aktiv; MariaDB bleibt spaeteres Ziel, aber ist noch nicht aktiv.


## STEP193.11 Parser-Fix

Live erkanntes neues SoundAlerts-Format:

```text
ForrestCGN löst Airhorn mit 0 Bits aus
```

wurde vorher als `parse_failed` gespeichert. Der Parser erkennt jetzt beide Formate:

```text
<user> spielt <sound> für <amount> Bits!
<user> löst <sound> mit <amount> Bits aus
```

Damit kann fuer neue/unbekannte Sounds wie `Airhorn` wieder die Auto-Entry-Logik greifen.

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

## Dashboard-Workflow SoundAlerts

### Uebersicht

Die Uebersicht zeigt nur noch wirklich relevante Werte und Schnellzugriffe:

- Gesamt
- Aktiv
- Inaktiv
- Datei fehlt
- Zur Pruefung
- Letzte 5 abspielbare Events mit Datei als Replay-Schnellzugriff

Nicht mehr als Handlungsbedarf zaehlen:

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

Wichtige Korrektur aus STEP193.8.1:

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

### Lokaler Test

- Das lokale Sound-System-Overlay kann im Dashboard über `🖥️ Lokales Overlay` geöffnet werden.
- URL: `/overlays/sound_system_overlay.html?debug=1`
- Einträge zeigen ihr Ausgabeziel: `Device`, `Overlay` oder `Beides`.
- Das Ausgabeziel ist im Eintrag-Editor bearbeitbar.
- Device-Tests laufen über das lokale Audio-Gerät.
- Overlay-/Beides-Tests brauchen ein geöffnetes lokales oder OBS-Sound-Overlay.

### Statistik

Die Statistik ist fachlich auf nutzbare Werte ausgerichtet:

- abgespielte Sounds
- Sound-Ausloesungen
- User-Ausloesungen
- verschiedene Sounds
- verschiedene User
- Top-Sounds
- Top-User

`Nicht eingerichtet` und `In Warteschlange` sind keine Hauptwerte mehr.

## Loeschen / Ignorieren

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

Ignorieren ist nicht mehr prominent im normalen Kartenfluss, bleibt aber technisch vorhanden.

## Live bestaetigter Referenzwert

```text
upload.maxVideoSizeBytes = 1073741824
```

## Parser-Formate / STEP193.11

Der SoundAlerts-Parser ist ab `0.1.11` ueber `parser.messageFormats` konfigurierbar.

Aktive Standardformate:

```text
ForrestCGN spielt Lily was here fuer 0 Bits!
ForrestCGN loest Airhorn mit 0 Bits aus
```

Die Formate werden als JSON-Setting `parser.messageFormats` in `soundalerts_bridge_settings` geseedet und koennen spaeter ueber Config/API angepasst werden.

Formatfelder:

```text
id, enabled, pattern, flags, triggerGroup, soundGroup, amountGroup, currencyGroup
```

Damit muessen neue SoundAlerts-Chattexte nicht mehr hart im Parser-Code verdrahtet werden, solange sie mit Regex + Gruppen-Zuordnung abbildbar sind.

## STEP193.11.1 Parser-Settings-Fix

- `parser.messageFormats` darf nicht als `[object Object]` gespeichert/geladen werden.
- Kaputte Formatwerte werden automatisch auf die Default-Formate zurueckgesetzt.
- Dadurch werden beide bekannten SoundAlerts-Chattexte wieder erkannt:
  - `spielt ... fuer ...`
  - `loest ... mit ... aus`

## Bewusst offen

- SoundAlerts weiter live beim echten Einrichten testen.
- Bei Bedarf Event-Tab spaeter filtern: Alle / Abgespielt / Fehler / Kein aktueller Eintrag.
- Bei Bedarf Statistik spaeter backendseitig robuster machen, falls Live-Daten weitere Felder brauchen.
- Clip-System spaeter live testen.
- MariaDB-Adapter spaeter in `backend/core/database.js` implementieren.


## STEP193.12 - Parser-Formate im Dashboard

- SoundAlerts `Bot & Settings` enthaelt jetzt den Bereich `Chat-Erkennung`.
- `parser.messageFormats` kann dort angezeigt, aktiviert/deaktiviert und erweitert werden.
- Beispieltexte koennen lokal getestet werden, ohne Event-/DB-Eintrag anzulegen.
- Speichern nutzt die bestehende Settings-API; keine Backend-/DB-Schemaaenderung.

## STEP193.13 - Entry-Test im Dashboard

- Einzelne SoundAlerts-Eintraege koennen im Dashboard direkt getestet werden.
- Eintragskarten und Detail-Editor nutzen kompakte Icon-Aktionen fuer Testen, Bearbeiten/Speichern und Loeschen.
- Der Test nutzt die bestehende `/api/soundalerts/test/chat`-Route.
- Testen ist nur sichtbar, wenn ein Eintrag einen SoundAlerts-Namen und eine Datei hat.
- Keine Backend-/API-/DB-Aenderung.

## STEP193.15 - Test-Ausgabeziel Override

- Eintraege koennen normal mit gespeichertem Ausgabeziel getestet werden.
- Zusaetzlich gibt es einen Overlay-Test, der den Test einmalig mit `outputTarget=overlay` an das Sound-System sendet.
- Das gespeicherte Ausgabeziel des Eintrags wird dadurch nicht veraendert.
- Fuer Overlay-Tests muss das lokale Sound-System-Overlay oder die OBS-Overlayquelle aktiv geladen sein.

