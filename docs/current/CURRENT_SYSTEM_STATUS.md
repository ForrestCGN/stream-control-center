# CURRENT SYSTEM STATUS

Stand: 2026-05-06

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## SoundAlerts / Sound-System - aktueller Stand bis STEP193.6.1 + STEP193.6 Layout-Cleanup

- `soundalerts_bridge` laeuft live auf Version `0.1.9`.
- SoundAlerts Bridge ist erfolgreich mit Sound-System und Dashboard verbunden.
- Aktive DB-Strukturen:
  - `soundalerts_bridge_events`
  - `soundalerts_bridge_entries`
  - `soundalerts_bridge_meta`
  - `soundalerts_bridge_settings`
- DB ist Hauptspeicher fuer dashboardfaehige SoundAlert-Eintraege und technische Settings.
- JSON `config/soundalerts_bridge.json` bleibt Seed/Fallback/Notfall.
- SoundAlerts-DB-Zugriffe laufen ueber `backend/core/database.js` bzw. Helper-Schichten.
- MariaDB ist vorbereitet, aber echter Adapter ist noch offen.

## SoundAlerts OBS-Loader-Standard

SoundAlerts benoetigt aktuell weiterhin eine geladene Browser Source, damit die SoundAlerts-Quelle als aktiv erkannt wird. Die Ausgabe von Bild und Ton soll aber nicht ueber SoundAlerts laufen, sondern ueber das eigene Sound-System.

Aktueller Standard:

```text
OBS-Quelle: _SoundAlerts_Loader
URL: https://source.soundalerts.com/alert/6f35ccb8-42c5-4fd8-8a4d-154d1d47627f
Groesse: 1 x 1 px
Sichtbar: Ja
Audio: im OBS-Mixer stumm
Quelle herunterfahren, wenn nicht sichtbar: Aus
Browser aktualisieren, wenn Szene aktiv wird: Aus
Audio ueber OBS steuern: An
```

Wichtige Regel:

```text
Die Quelle darf nicht per Auge deaktiviert oder aus der aktiven Szenenstruktur entfernt werden. Sie bleibt als Loader aktiv, ist 1x1 px klein und stummgeschaltet. Bild/Ton-Ausgabe laeuft nicht ueber SoundAlerts, sondern ueber das eigene Sound-System.
```

Node-/Headless-Browser-Loader wird aktuell bewusst nicht umgesetzt, solange der 1x1-OBS-Loader stabil funktioniert.

## Aktive SoundAlerts-Dateien

- `backend/modules/soundalerts_bridge.js`
- `htdocs/dashboard/modules/soundalerts.js`
- `htdocs/dashboard/modules/soundalerts.css`
- `config/soundalerts_bridge.json`

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

## STEP193.5 bestaetigt

- Video-Upload-Limit ist live auf 1 GB gesetzt: `upload.maxVideoSizeBytes = 1073741824`.
- Dashboard zeigt Upload-Status/Fortschritt.
- Max Audio/Video Uploadgroessen sind dashboardfaehig.
- `file_too_large` gibt lesbare Groessenwerte zurueck.
- `neuer_test_sound` wurde erfolgreich auf `ignored` gesetzt.
- Wiederkehr-Test erzeugte keinen zweiten Eintrag.
- `loesch_test_sound` wurde direkt geloescht, ohne `Config speichern`.

## Fachregel SoundAlerts

```text
Loeschen = Eintrag wird entfernt. Kommt derselbe SoundAlert wieder rein, wird er neu erkannt und neu angelegt.
Ignorieren = Eintrag bleibt mit Status ignored bestehen. Kommt derselbe SoundAlert wieder rein, wird er nicht als neuer offener Eintrag angelegt.
```

## Aktiver getesteter Produktiv-Eintrag

```json
{
  "id": "fahrstuhl_sound",
  "enabled": true,
  "status": "active",
  "soundAlertName": "Fahrstuhl Sound",
  "label": "Fahrstuhl Sound",
  "file": "soundalerts/video/3cgn.mp4",
  "mediaType": "video",
  "category": "channel_reward",
  "outputTarget": "overlay",
  "volume": 100
}
```

## Globaler DB-Portability-Standard

- SQLite ist aktuell die produktive Datenbank und bleibt Standard/Fallback.
- Neue Module und neue DB-Features muessen so gebaut werden, dass eine spaetere MariaDB-Nutzung moeglich bleibt.
- Neue DB-Zugriffe sollen bevorzugt ueber `backend/core/database.js` oder vorhandene Helper laufen.
- MariaDB ist Ziel/Plan, aber erst aktiv, wenn der echte Adapter in `backend/core/database.js` implementiert und getestet ist.
- Bis dahin darf keine Aenderung die bestehende SQLite-Funktionalitaet brechen.

## STEP193.6 Dashboard Layout Cleanup

- `htdocs/dashboard/modules/soundalerts.css` wurde optisch aufgeraeumt.
- Linke Eintragskarten sind besser lesbar.
- Button-Zeilen in der Eintragsliste sind sauberer ausgerichtet.
- Status-Chips fuer `active`, `missing_file`, `ignored`, `file_matched` sind deutlicher.
- Upload-Zeile und Upload-Hinweise sind weniger gedrungen.
- Keine Backend-Funktionalitaet, API-Route oder DB-Struktur wurde geaendert.

## Naechster empfohlener Schritt

`STEP193.7 - SoundAlerts Eintragsfilter / Listenansichten`

- Optional Filter fuer Active / Offen / Ignored / Datei gefunden bauen.
- Nur angehen, wenn die Eintragsliste nach dem Layout-Cleanup bei vielen Sounds noch zu unuebersichtlich ist.
