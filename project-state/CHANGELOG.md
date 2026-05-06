# Changelog

## 2026-05-06

### STEP193.12 - SoundAlerts Parser-Formate im Dashboard

- `Bot & Settings` um Bereich `Chat-Erkennung` erweitert.
- Parser-Formate koennen im Dashboard angezeigt, aktiviert/deaktiviert und bei Bedarf bearbeitet werden.
- Lokaler Test fuer Chattexte ergaenzt, ohne Event-/DB-Eintrag anzulegen.
- `parser.messageFormats` wird beim Speichern ueber die bestehende Settings-API gespeichert.
- Keine Backend-/API-/DB-Schemaaenderung.


### STEP193.11.1 - SoundAlerts Parser Settings Serialization Fix

- `soundalerts_bridge` auf Version `0.1.12` gesetzt.
- Fehler behoben, bei dem `parser.messageFormats` als `[object Object]` gespeichert/geladen wurde.
- Parser faellt bei kaputten Format-Werten automatisch auf die Default-Formate zurueck.
- Keine DB-Schema-/Dashboard-Aenderung.

### STEP193.11 - SoundAlerts konfigurierbare Parser-Formate

- `soundalerts_bridge` auf Version `0.1.11` gesetzt.
- Parser-Formate ueber `parser.messageFormats` konfigurierbar gemacht.
- Standardformate geseedet:
  - `<user> spielt <sound> fuer <amount> <currency>`
  - `<user> loest <sound> mit <amount> <currency> aus`
- `parser.messageFormats` als JSON-Setting in `soundalerts_bridge_settings` ergaenzt.
- Keine DB-Schemaaenderung und keine Dashboard-Aenderung.


### STEP193.10 - SoundAlerts Parser Format Fix

- `soundalerts_bridge` auf Version `0.1.10` gesetzt.
- Parser erkennt jetzt zusätzlich das Format `<user> löst <sound> mit <amount> Bits aus`.
- Live-Fehler `parse_failed` bei `ForrestCGN löst Airhorn mit 0 Bits aus` behoben.
- Bestehendes Format `<user> spielt <sound> für <amount> Bits!` bleibt erhalten.
- Keine Dashboard-/API-/DB-Schemaänderung.

### STEP193.9 - SoundAlerts Stable Handoff / Doku-Sync

- Stabilen SoundAlerts-Zwischenstand nach STEP193.8.1 dokumentiert.
- OBS-Loader-Standard festgehalten.
- Review-Workflow zusammengefasst:
  - `Zur Pruefung` bleibt bis zur einzelnen Freigabe sichtbar.
  - Globales Speichern gibt keine anderen Review-Eintraege frei.
  - Inaktive vollstaendige Eintraege sind kein offener Handlungsbedarf.
- Event-Historie-Regeln dokumentiert:
  - `Kein aktueller Eintrag` fuer geloeschte/unbekannte Alt-Events.
  - `Parse-Fehler` fuer unbrauchbare Rohdaten.
  - Replay nur bei Events mit Datei.
- Keine Code-/API-/DB-Aenderung.

### STEP193.8.1 - SoundAlerts Review Save Scope Fix

- `Speichern / Freigeben` finalisiert nur noch den aktuell bearbeiteten Eintrag.
- Globales `Config speichern` gibt keine anderen `Zur Pruefung`-Eintraege frei.
- Upload bleibt bis zur expliziten Freigabe im Status `review_required`.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.8 - SoundAlerts Review Workflow

- `file_matched`/`review_required` werden als `Zur Pruefung` angezeigt.
- Zur Pruefung zaehlt als Handlung, bis ein Eintrag gespeichert/freigegeben wurde.
- Speichern/Freigeben setzt gueltige Eintraege auf `active` oder `inactive`.
- Eintraege mit fehlendem Namen oder fehlender Datei bleiben `missing_file`.
- Ignorieren aus den normalen Eintragskarten entfernt, im Editor weniger prominent behalten.
- Keine Backend-/DB-Aenderung.

### STEP193.7.4 - SoundAlerts Event-Log Klartext

- Events-Tab unterscheidet klarer zwischen aktueller Aufgabe und historischem Log-Eintrag.
- Alte geloeschte/unbekannte Events werden als `Kein aktueller Eintrag` angezeigt.
- Parse-Fehler werden als `Parse-Fehler` angezeigt.
- Unbrauchbare Roh-/Parse-Events bieten kein `Eintrag erstellen` mehr an.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.7.3 - SoundAlerts Overview Action-State Cleanup

- `Handlung noetig` erscheint nur noch bei echtem Einrichtungsbedarf.
- Unbekannte historische Events loesen keine Handlung-noetig-Box mehr aus.
- KPI `Auto-zugeordnet` wurde aus der Uebersicht entfernt.
- Letzte-5-Events-Bereich zeigt nur noch abgespielte Events mit Datei.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.7.2 - SoundAlerts Uebersicht / Statistik Cleanup

- Test-Buttons aus der SoundAlerts-Hero-Leiste entfernt.
- `Bot & Settings` in der Tab-Reihenfolge nach hinten verschoben.
- Statistik auf Top-Sounds, Top-User und Abspiel-Kennzahlen fokussiert.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.7.1 - SoundAlerts Inaktiv/Filter Fix

- `enabled: false` ist nicht automatisch `Einrichtung noetig`.
- Eintraege-Tab um Filter ergaenzt.
- Uebersicht-KPI-Klicks oeffnen passende Filter.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.7 - SoundAlerts Overview Dashboard

- SoundAlerts-Uebersicht aufgeraeumt.
- Kompakte Kennzahlen und letzte Events mit Schnellaktionen ergaenzt.
- Vollstaendige Events und Statistik bleiben in eigenen Tabs.
- Keine Backend-/API-/DB-Aenderung.

### STEP193.6.1 - SoundAlerts OBS Loader Standard

- Doku fuer dauerhaft aktive, stumme 1x1-OBS-Browserquelle `_SoundAlerts_Loader` ergaenzt.
- Kein Node-/Headless-Browser-Loader, solange die OBS-Loader-Loesung stabil funktioniert.

### STEP193.6 - SoundAlerts Dashboard Layout Cleanup

- Eintragskarten links lesbarer gemacht.
- Button-Zeilen sauberer ausgerichtet.
- Status-Chips deutlicher dargestellt.
- Upload-Zeile ruhiger und weniger gequetscht.
- Keine Backend-/API-/DB-Aenderung.
