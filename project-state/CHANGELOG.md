# Changelog

## 2026-05-06

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


### STEP193.7.3 - SoundAlerts Overview Action-State Cleanup

- "Handlung noetig" auf der SoundAlerts-Uebersicht erscheint nur noch bei echtem Einrichtungsbedarf.
- Unbekannte historische Events loesen keine Handlung-noetig-Box mehr aus.
- KPI "Auto-zugeordnet" wurde aus der Uebersicht entfernt.
- Letzte-5-Events-Bereich zeigt nur noch abgespielte Events mit Datei und dient nur noch zum schnellen Neu starten.


### STEP193.7.2 - SoundAlerts Uebersicht / Statistik Cleanup

- Test-Buttons aus der SoundAlerts-Hero-Leiste entfernt.
- `Bot & Settings` in der Tab-Reihenfolge nach hinten verschoben.
- KPI `Datei gefunden` zu `Auto-zugeordnet` umbenannt.
- Uebersicht um irrelevante Miniwerte bereinigt.
- Statistik optisch und fachlich auf Top-Sounds, Top-User und Abspiel-Kennzahlen fokussiert.
- Keine Backend-/API-/DB-Aenderung.


### STEP193.7.1 - SoundAlerts Inaktiv/Filter Fix

- Fachregel korrigiert: `enabled: false` ist nicht automatisch „Einrichtung nötig“.
- Einträge-Tab um Filter `Alle`, `Aktiv`, `Inaktiv`, `Datei fehlt`, `Ignoriert` ergänzt.
- Übersicht-KPI-Klicks öffnen passende Eintragsfilter.
- Keine Backend-/API-/DB-Änderung.

### STEP193.7 - SoundAlerts Overview Dashboard

- SoundAlerts-Uebersichtsseite aufgeraeumt.
- Kompakte Kennzahlen fuer Gesamt/Aktiv/Inaktiv/Datei fehlt/Ignoriert/Datei gefunden ergaenzt.
- Wichtige Systemwerte kompakt auf der Uebersicht angezeigt.
- Letzte 5 Events auf der Uebersicht ergaenzt.
- Replay/Bearbeiten/Eintrag erstellen direkt aus der Uebersicht moeglich.
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

### STEP193.5 - SoundAlerts Upload UX / Ignore / Delete Doku-Sync

- Zentrale Projekt-Dokus nach erfolgreichem STEP193.2 bis STEP193.4 aktualisiert.
- Dokumentiert:
  - `soundalerts_bridge` Version `0.1.9`
  - Video-Upload-Limit live auf `1073741824` Bytes / 1 GB
  - Upload-Status/Fortschritt im Dashboard
  - Max Audio/Video Uploadgroessen dashboardfaehig
  - `ignored`-Status fuer Auto-Eintraege
  - Wiederkehr-Test fuer ignored-Eintraege erfolgreich
  - direkte Entry-Aktionen fuer Loeschen/Ignorieren
  - Loeschen braucht kein `Config speichern` mehr
- Keine Codeaenderung in diesem STEP.

### STEP193.4 - SoundAlerts direkte Entry-Aktionen

- `soundalerts_bridge` auf Version `0.1.9` gesetzt.
- Direkte Backend-Routen fuer Eintraege ergaenzt.
- Dashboard nutzt Loeschen/Ignorieren als direkte Backend-Aktionen.
- Loeschen/Ignorieren braucht kein Config-Speichern mehr.

### STEP193.3 - SoundAlerts Upload UX + Ignore Entries

- `soundalerts_bridge` auf Version `0.1.8` gesetzt.
- Upload-Status/Fortschritt im Dashboard ergaenzt.
- Max. Audio-Upload und Max. Video-Upload im Dashboard einstellbar gemacht.
- Status `ignored` fuer Auto-Eintraege nutzbar gemacht.

### STEP193.2 - SoundAlerts Upload Limit Settings

- `soundalerts_bridge` auf Version `0.1.7` gesetzt.
- Standard fuer Video-Uploads von 100 MB auf 500 MB angehoben.
- Live wurde spaeter 1 GB gesetzt: `1073741824` Bytes.

### STEP193.1 - SoundAlerts Inbox Auto Entries Doku-Sync

- Zentrale Projekt-Dokus nach erfolgreichem STEP193-Live-Test aktualisiert.

### STEP193 - SoundAlerts Inbox / Auto Entries

- Unbekannte SoundAlerts erzeugen automatisch einen Eintrag in `soundalerts_bridge_entries`.


### STEP193.7.4 - SoundAlerts Event-Log Klartext

- Events-Tab unterscheidet jetzt klarer zwischen aktueller Aufgabe und historischem Log-Eintrag.
- Alte geloeschte/unbekannte Events werden als `Kein aktueller Eintrag` angezeigt.
- Parse-Fehler werden als `Parse-Fehler` angezeigt.
- Unbrauchbare Roh-/Parse-Events bieten kein `Eintrag erstellen` mehr an.
- Keine Backend-/API-/DB-Aenderung.
