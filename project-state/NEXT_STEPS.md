# NEXT STEPS - stream-control-center

Stand: 2026-05-04

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. `tools\easy\03_NUR_STATUS_PRUEFEN.cmd` oder `git status --short` pruefen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Wenn GitHub/Toolausgaben grosse Dateien kuerzen, echte Datei von Forrest anfordern und diese als Basis nutzen.
6. Kleine Aenderung planen.
7. Nach Aenderung testen, dokumentieren, committen, pushen und Live ueber `tools\easy\01_LIVE_AKTUALISIEREN_VON_GITHUB.cmd` aktualisieren.

## Empfohlene naechste Arbeitspakete

### 1. TTS / Sound-System / Alerts dashboardfaehig machen

Aktueller Stand:

- Chat-TTS laeuft ueber Sound-System.
- TTS-Overlay zeigt Sound-System-Visual-State nach VIP-Prinzip.
- Google fuer Broadcaster/Mods/VIPs funktioniert.
- Piper fuer Subscriber funktioniert.
- Ko-fi Donation-TTS und Tipeee Donation-TTS sind aktiviert/getestet.
- Alert-Sound wird seit STEP046 frueh in Sound-System-Queue eingereiht.
- Sound-System-Prio funktioniert mit `sortByPriority=true`, `allowParallel=false`, `maxParallel=1`.

Ziel:

- TTS-/Alert-TTS-/Sound-System-Werte im Dashboard anzeigen und bearbeiten.
- Dashboard schreibt nur ueber Backend-APIs.
- Dashboardfaehige Werte primaer in DB/Settings.
- JSON bleibt fuer technische Fallbacks/Imports.
- Keine direkten Datei- oder SQLite-Zugriffe aus dem Dashboard.

Dashboard-relevante Felder:

- TTS allgemein: enabled, command, defaultVoice, fallbackVoice, Limits, Textfilter.
- TTS Rollen: broadcaster, moderator, vip, subscriber, viewer.
- TTS Overlay: position, width, minWidth, bottom, scale, avatarSize, showAvatar, maxTextLines, debug.
- Chat-TTS Playback: playbackMode, soundSystemOutputTarget, volume, priority, doneMode, fallbackToOverlay.
- Alert-TTS pro Regel: enabled, timing, mode, template, maxChars, minAmount, voice, output target, volume, delay.
- Sound-System Queue: sortByPriority, allowParallel, maxParallel, priorities, categoryDefaults.
- Provider-/Alert-Settings: Secrets maskieren, keine Tokens im Klartext anzeigen.

Wichtig:

- Kein grosser Blind-Umbau.
- Zuerst API-/Settings-Stand pruefen.
- `liveAlert`/`livealert` Duplikat in Alert-Settings bereinigen.
- Bestehende Funktionalitaet darf nicht entfernt werden.

---

### 2. Alert-Sound + Alert-TTS Kopplung pruefen

Aktueller Test:

- Crew -> Chat-TTS -> Ko-fi Alert wurde getestet.
- Ergebnis nach STEP046: Crew -> Alert -> TTS korrekt.

Noch gezielt pruefen:

- Ko-fi mit aktivem Alert-TTS: Alert-Sound -> Alert-TTS -> Chat-TTS.
- Tipeee mit aktivem Alert-TTS: Alert-Sound -> Alert-TTS -> Chat-TTS.
- Kein anderes Sound-Item darf zwischen Alert-Sound und dessen Alert-TTS rutschen, wenn diese logisch zusammengehoeren.

Falls noetig:

- Alert-TTS als gekoppelte Folgeausgabe des Alert-Sounds behandeln.
- Sound-System bleibt Audio-Wahrheit.

---

### 3. Sound-System Runtime-Settings sauber dokumentieren und dashboardfaehig machen

Aktueller Befund:

- `config/sound_system.json` wird durch DB-Tabelle `sound_settings` ueberlagert.
- Runtime-/DB-Settings gewinnen gegenueber JSON.
- Beispiel: Queue-Werte mussten ueber `/api/sound/settings` gesetzt werden, nicht nur per JSON.

Ziel:

- Dashboard-Seite fuer Sound-System Settings.
- Sichtbar machen, welche Werte aus DB kommen und welche aus JSON-Fallback.
- Bearbeitbar machen:
  - Queue-Modus / Prioritaet
  - Parallel erlaubt
  - MaxParallel
  - Kategorien/Prioritaeten
  - Output-Ziele
  - Geraeteausgabe
  - Lautstaerken

---

### 4. TTS-Overlay-Settings in DB/API vorbereiten

Aktueller Stand:

- Overlay-Optik ist aktuell per URL/CSS/HTML gesteuert.
- Funktioniert mit Avatar, Displayname, adaptiver Breite und Text-Clamp.

Ziel:

- TTS-Overlay-Settings als DB-Block vorbereiten, z. B. `ttsOverlay` in `tts_settings`.
- Overlay soll spaeter optional Settings aus Backend laden.
- OBS-URL soll langfristig weniger Parameter brauchen.

Moegliche Werte:

- `position`
- `width`
- `minWidth`
- `bottom`
- `scale`
- `avatarSize`
- `showAvatar`
- `showInnerBorder`
- `maxTextLines`
- `fontSizeName`
- `fontSizeText`
- `debug`

---

### 5. Alert-Regel-TTS im Dashboard integrieren

Aktueller Stand:

- Alert-Regeln besitzen TTS-Felder:
  - `tts_enabled`
  - `tts_timing`
  - `tts_mode`
  - `tts_template`
  - `tts_max_chars`
  - `tts_min_amount`
- Ko-fi Donation und Tipeee Donation koennen TTS nutzen.

Ziel:

- Diese Felder im Alert-Dashboard sichtbar und editierbar machen.
- Template-Hilfe mit Platzhaltern anzeigen.
- Aktiv/Inaktiv klar darstellen.
- Spaeter ggf. Stimme/Output/Lautstaerke pro Regel ergaenzen.

---

### 6. Provider-/Settings-Ausgaben maskieren

Problem:

- `/api/alerts/settings` kann Provider-Keys/Secrets enthalten.
- Dashboard darf Secrets nicht im Klartext anzeigen.

Ziel:

- Public-/Dashboard-Ausgabe maskiert sensible Felder.
- Schreiben von Secrets nur ueber gesonderte, geschuetzte API.
- Audit-Logging spaeter einplanen.

---

### 7. VIP auf helper_settings.js weiter angleichen / Dashboard bauen

Ziel:

- VIP ist dashboard-ready dokumentiert.
- Spaeter Dashboard-Modul fuer VIP bauen.
- Einstellungen, Texte, Rollen, Daily-Usage, Events und Stats ueber API anzeigen/bearbeiten.

Wichtig:

- Keine bestehende VIP-Funktionalitaet entfernen.
- Vorher aktuellen `vip_sound_overlay.js`-Stand hochladen, falls GitHub/Tools die Datei kuerzen.

---

### 8. Bestehende Systeme vor Dashboard-Bau pruefen und ggf. umbauen

Ziel:

- Vor dem eigentlichen Dashboard-Ausbau alle bisherigen Systeme gegen den neuen Standard pruefen.
- Relevante Systeme: VIP, Sound-System, Alerts, TTS, Hug, Messages/Rotator, Tagebuch, Todo, OBS/Scene-Control, Twitch/Presence, Overlay-Chat.
- Pruefen, welche Werte noch hart codiert, nur in JSON-Dateien oder uneinheitlich gespeichert sind.
- Dashboard-faehige Werte schrittweise in DB-/Settings-Strukturen ueberfuehren.
- APIs vereinheitlichen, damit das Dashboard spaeter nicht direkt Dateien oder SQLite anfassen muss.

Wichtig:

- Kein Blind-Umbau grosser Module.
- Erst Bestand je System dokumentieren, dann kleine Steps.
- Keine Funktionalitaet entfernen.
- Bestehende Live-Funktion immer nach jedem Umbau testen.

---

### 9. Dashboard-Modulstandard definieren

Ziel:

- Einheitlicher Aufbau fuer Dashboard-Module.
- Klare Struktur fuer init/load/render/bindActions.
- Einheitliches API-Verhalten.
- Einheitliche Loading/Error/Empty-States.
- Einheitliche Config-Strategie.

Betroffene Bereiche:

- htdocs/dashboard/app.js
- htdocs/dashboard/modules/*.js
- docs/dashboard/
- docs/current/CURRENT_SYSTEM_STATUS.md

Wichtig:

- Erst dokumentieren, dann ein kleines Referenzmodul anpassen.
- Keine Funktionen entfernen.

---

### 10. Fireworks spaeter neu aufbauen

Aktueller Zustand:

- Fireworks-Routen sind doppelt registriert.
- Dokumentiert in STEP008.
- Kein kurzfristiger Umbau.

Spaeterer Zielzustand:

- Fireworks vollstaendig in eigenes Modul.
- server.js von Fireworks-Spezialrouten befreien.
- Einheitliches /api/fireworks/* System.
- WebSocket-Broadcast zentralisieren.

---

### 11. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 12. Alerts-Modul spaeter behutsam splitten

Aktueller Zustand:

- `alert_system.js` ist gross und funktionsreich.
- Nicht blind umbauen.

Spaeterer Zielzustand:

- alerts.api.js
- alerts.rules.js
- alerts.assets.js
- alerts.texts.js
- alerts.presets.js
- alerts.history.js

Wichtig:

- Nur schrittweise.
- Erst Tests und Doku.
