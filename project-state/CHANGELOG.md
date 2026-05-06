# Changelog

## 2026-05-06


### STEP193.6 - SoundAlerts Dashboard Layout Cleanup

- `htdocs/dashboard/modules/soundalerts.css` optisch aufgeraeumt.
- Linke Eintragskarten lesbarer gemacht.
- Button-Zeilen in der Eintragsliste sauberer ausgerichtet.
- Status-Chips fuer `active`, `missing_file`, `ignored`, `file_matched` deutlicher dargestellt.
- Upload-Zeile und Upload-Hinweise weniger gedrungen gestaltet.
- Keine Backend-, API- oder DB-Aenderung.

### STEP193.6.1 - SoundAlerts OBS Loader Standard

- Vorlaeufigen SoundAlerts-OBS-Loader-Standard dokumentiert.
- SoundAlerts-Browserquelle bleibt als aktive 1x1 px Quelle geladen, damit SoundAlerts die Quelle nicht als offline erkennt.
- Bild/Ton-Ausgabe ueber SoundAlerts bleibt unerwuenscht; Audio wird im OBS-Mixer stummgeschaltet.
- Die Quelle darf nicht per Auge deaktiviert oder aus der aktiven Szenenstruktur entfernt werden.
- Node-/Headless-Browser-Loader wird aktuell bewusst nicht umgesetzt, solange der OBS-Loader stabil funktioniert.
- Keine Codeaenderung, keine Backend-Aenderung, keine DB-Aenderung.

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
