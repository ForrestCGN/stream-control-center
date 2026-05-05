# NEXT STEPS - stream-control-center

Stand: 2026-05-05

## Naechster empfohlener Schritt

### STEP178 - Tagebuch/Todo Dashboard-Integration

Ziel:

- Tagebuch und Todo im Dashboard sichtbar und bedienbar machen.
- Neue Backend-Routen aus STEP177 nutzen.
- Keine direkten Dashboard-Zugriffe auf SQLite oder Dateien.
- Keine bestehende Funktionalitaet entfernen.

Voraussichtlich betroffene Dateien:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/app.js`
- `htdocs/dashboard/modules/sectionhome.js`
- `htdocs/dashboard/modules/controlhome.js`
- `htdocs/dashboard/modules/tagebuch.js`
- `htdocs/dashboard/modules/tagebuch.css`
- `htdocs/dashboard/modules/todo.js`
- `htdocs/dashboard/modules/todo.css`
- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/*`

Vorgesehene Dashboard-Funktionen:

Tagebuch:

- Status anzeigen
- aktive Seite/naechste Seite anzeigen
- Stream aktiv/inaktiv anzeigen
- Stats anzeigen
- Settings aus `/api/tagebuch/admin/settings` anzeigen/bearbeiten
- Texte aus `/api/tagebuch/admin/texts` anzeigen/bearbeiten
- Reload ausloesen
- Reset/Hardreset nicht prominent einbauen

Todo:

- Status anzeigen
- Targets und Discord-Channel-Status anzeigen
- Stats anzeigen
- Settings aus `/api/todo/admin/settings` anzeigen/bearbeiten
- Texte aus `/api/todo/admin/texts` anzeigen/bearbeiten
- Reload ausloesen

## Danach moeglich

### STEP179 - Tagebuch/Todo Feinschliff

- Text-Editor UX verbessern
- Settings-Felder benennen/beschreiben
- Zielpersonen/Targets fuer Todo komfortabler editierbar machen
- Audit-Logging fuer Admin-Aenderungen vorbereiten

### VIP

- Echte 7-/30-Tage-Statistik backendseitig ergaenzen.
- Upload-UX nur behutsam weiter verbessern.
- Sound-Vorschau optional erweitern:
  - Stop-Button
  - aktuelle Vorschau optisch markieren
  - lokale Dashboard-Lautstaerke

### System allgemein

- Provider-/Settings-Ausgaben maskieren, da Settings sensible Werte enthalten koennen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings spaeter bereinigen.
- Dashboard-Rollen/Rechte und Audit-Logging vorbereiten.
- Fireworks spaeter neu aufbauen.
- Hug-Textbearbeitung spaeter sauber neu planen.
- Alerts-Modul spaeter behutsam splitten.
- Overlays langfristig mit einheitlichem Overlay-Client standardisieren.


## STEP179 Tagebuch/Todo UX Feinschliff

- Bekannte Settings mit besseren Labels/Beschreibungen darstellen.
- Technische/sensible Settings schuetzen oder als erweitert markieren.
- Optional Sammel-Speichern fuer Texte/Settings ergaenzen.
- Todo-Ziele als sicherere Formularstruktur statt reinem JSON-Textarea planen.



## Nach STEP179 empfohlen

### STEP180 - Live-/UX-Feinschliff Textvarianten

- Live-Test: Varianten hinzufuegen, deaktivieren, loeschen und zufaellige Ausgabe pruefen.
- Editor-UX verbessern: bessere Beschreibungen je Text-Key, Platzhalter-Hinweise, technische Keys gruppieren.
- Textvarianten-Editor als wiederverwendbares Dashboard-Konzept fuer weitere Module planen.
- Audit-Logging fuer Admin-Aenderungen vorbereiten.


## Nach STEP180 empfohlen

### STEP181 - Praxistest Textvarianten

- Im Dashboard je eine zweite aktive Variante fuer `todo.added` und `tagebuch.entrySaved` anlegen.
- Live-Ausgabe pruefen, ob zufaellige aktive Varianten verwendet werden.
- Kleine UI-Fehler im Varianten-Editor beheben, falls beim Praxistest auffaellig.
- Danach den Varianten-Editor als wiederverwendbares Muster fuer weitere Module planen.
