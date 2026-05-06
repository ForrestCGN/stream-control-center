# CURRENT SYSTEM STATUS

Stand: 2026-05-06

## Single Source of Truth

- Branch: `dev`
- Repo: `D:\Git\stream-control-center`
- Live: `D:\Streaming\stramAssets`
- GitHub: `https://github.com/ForrestCGN/stream-control-center`

## SoundAlerts / Sound-System - aktueller Stand bis STEP193.7

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

## OBS Loader Standard fuer SoundAlerts

- SoundAlerts benoetigt weiterhin eine aktiv geladene Browserquelle.
- Aktueller Standard: OBS-Browserquelle `_SoundAlerts_Loader` bleibt dauerhaft sichtbar/aktiv, aber nur 1x1 px und im OBS-Mixer stumm.
- Die Quelle darf nicht per Auge deaktiviert werden.
- `Quelle herunterfahren, wenn nicht sichtbar` bleibt AUS.
- `Browser aktualisieren, wenn Szene aktiv wird` bleibt AUS.
- Bild-/Ton-Ausgabe laeuft nicht ueber SoundAlerts, sondern ueber das eigene Sound-System.
- Kein Node-/Headless-Browser-Loader, solange diese OBS-Loader-Loesung stabil funktioniert.

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

## STEP193.7 bestaetigt / vorbereitet

- SoundAlerts-Uebersichtsseite zeigt kompakte Kennzahlen fuer Gesamt/Aktiv/Inaktiv/Datei fehlt/Ignoriert/Datei gefunden.
- Uebersicht zeigt wichtige Systemwerte und Statuswerte kompakt.
- Uebersicht zeigt die letzten 5 Events mit direkten Aktionen.
- Events koennen aus der Uebersicht erneut gestartet werden, sofern eine Datei vorhanden ist.
- Vollstaendige Event-/Statistiklisten bleiben in eigenen Tabs.
- Keine Backend-/API-/DB-Aenderung.

## STEP193.5 bis STEP193.7.1 bestaetigt

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


## STEP193.7.1 Dashboard-Regel

- Inaktive, vollstaendig konfigurierte SoundAlert-Eintraege gelten als bewusst deaktiviert und nicht als offene Einrichtung.
- Einrichtung noetig ist nur bei fehlendem Namen oder fehlender/Platzhalter-Datei.
- Der Eintraege-Tab kann nach `Alle`, `Aktiv`, `Inaktiv`, `Datei fehlt` und `Ignoriert` gefiltert werden.


## STEP193.7.2 Uebersicht / Statistik Cleanup

- Hero-Leiste enthaelt keine Test-Buttons mehr.
- Tab-Reihenfolge: Uebersicht, Eintraege, Events, Statistik, Bot & Settings.
- KPI `Datei gefunden` wurde zu `Auto-zugeordnet` umbenannt.
- Statistik zeigt nutzbare Kennzahlen, Top-Sounds und Top-User.
- `Nicht eingerichtet` und `In Warteschlange` werden in der Statistik nicht mehr als Hauptwerte angezeigt.
- Keine Backend-/API-/DB-Aenderung.

## Globaler DB-Portability-Standard

- SQLite ist aktuell die produktive Datenbank und bleibt Standard/Fallback.
- Neue Module und neue DB-Features muessen so gebaut werden, dass eine spaetere MariaDB-Nutzung moeglich bleibt.
- Neue DB-Zugriffe sollen bevorzugt ueber `backend/core/database.js` oder vorhandene Helper laufen.
- MariaDB ist Ziel/Plan, aber erst aktiv, wenn der echte Adapter in `backend/core/database.js` implementiert und getestet ist.
- Bis dahin darf keine Aenderung die bestehende SQLite-Funktionalitaet brechen.


## STEP193.7.3 bestaetigt

- SoundAlerts-Uebersicht zeigt "Handlung noetig" nur noch bei echtem Einrichtungsbedarf.
- Historische/unbekannte Events im Log zaehlen nicht mehr als offener Handlungsbedarf.
- "Auto-zugeordnet" wurde aus den Uebersichts-KPIs entfernt.
- Letzte 5 Events auf der Uebersicht zeigen nur noch abgespielte Events mit Datei und dienen als Replay-Schnellzugriff.

## Naechster empfohlener Schritt

`STEP193.8 - SoundAlerts Eintragsfilter / Ansichten`

- Optional Filter fuer `active`, `missing_file`, `ignored`, `file_matched`.
- Keine neue Backend-Funktionalitaet, wenn vorhandene Daten reichen.


## STEP193.7.4 - Event-Log-Klartext

- Events im SoundAlerts-Dashboard unterscheiden nun deutlicher zwischen aktuellem Eintrag und historischem Log-Eintrag.
- Alte Events zu geloeschten/unbekannten SoundAlerts werden als `Kein aktueller Eintrag` angezeigt.
- Parse-Fehler werden als `Parse-Fehler` angezeigt.
- Keine Backend-/API-/DB-Aenderung.
