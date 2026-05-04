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

### 1. VIP auf helper_settings.js umstellen

Ziel:

- Die aktuell im VIP-Modul vorhandenen internen Settings-Hilfsfunktionen kontrolliert auf `backend/modules/helpers/helper_settings.js` umstellen.
- Lesereihenfolge bleibt:
  1. Datenbank
  2. JSON-Fallback ueber `helper_config.js`
  3. Code-Default

Wichtig:

- Keine bestehende VIP-Funktionalitaet entfernen.
- Vorher aktuellen `vip_sound_overlay.js`-Stand hochladen, falls GitHub/Tools die Datei kuerzen.
- Erst nach erfolgreichem Test Dashboard bauen.

---

### 2. Dashboard-Settings spaeter schreiben/lesen

Ziel:

- Dashboard soll alle wichtigen Modulwerte lesen und schreiben koennen.
- Schreibziel fuer dashboardfaehige Werte ist primaer die Datenbank.
- Datei-Configs werden nur fuer technische Configs, Fallbacks oder bewusste Imports genutzt.
- Secrets/Tokens bleiben ausserhalb des Dashboards und werden nicht im Klartext angezeigt.

---

### 3. Bestehende Systeme vor Dashboard-Bau pruefen und ggf. umbauen

Ziel:

- Vor dem eigentlichen Dashboard-Ausbau alle bisherigen Systeme noch einmal gegen den neuen Standard pruefen.
- Relevante Systeme: VIP, Sound-System, Alerts, Hug, Messages/Rotator, Tagebuch, Todo, OBS/Scene-Control, Twitch/Presence, Overlay-Chat.
- Pruefen, welche Werte noch hart codiert, nur in JSON-Dateien oder uneinheitlich gespeichert sind.
- Dashboard-faehige Werte schrittweise in DB-/Settings-Strukturen ueberfuehren.
- Bestehende JSON-Configs nur dort behalten, wo sie technische Fallbacks, Imports oder systemnahe Konfiguration sind.
- APIs vereinheitlichen, damit das Dashboard spaeter nicht direkt Dateien oder SQLite anfassen muss.

Wichtig:

- Kein Blind-Umbau grosser Module.
- Erst Bestand je System dokumentieren, dann kleine Steps.
- Keine Funktionalitaet entfernen.
- Bestehende Live-Funktion immer nach jedem Umbau testen.

---

### 4. VIP-Soundpfad und Dateiregel spaeter im Dashboard einstellbar machen

Aktueller Stand:

- `soundBaseDir`, `fileNameMode` und `fileExtension` liegen in `vip_sound_settings`.
- Seit STEP032 werden diese Werte aktiv fuer die Sounddatei-Aufloesung genutzt.

Ziel:

- Dashboard kann diese Werte anzeigen und bearbeiten.
- Aenderungen laufen ueber Backend-API und DB, nicht ueber direkte Datei-/SQL-Zugriffe.
- Bestehender Fallback bleibt: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.

---

### 5. VIP-Textverwaltung spaeter ins Dashboard bringen

Ziel:

- VIP-/Mod-Chattexte und Overlaytexte aus `vip_sound_message_templates` anzeigen.
- Texte aktivieren/deaktivieren.
- Texte bearbeiten.
- Gewichtung einstellen.
- Event-Keys verstaendlich gruppieren.

Wichtig:

- Interne Style-ID `heimleitung` bleibt vorerst aus Kompatibilitaetsgruenden bestehen.
- Sichtbarer Begriff bleibt `Heimaufsicht`.

---

### 6. VIP-Rollen-Fallbacks spaeter im Dashboard bearbeiten

Ziel:

- Rollen-Fallbacks aus `vip_sound_role_overrides` anzeigen und bearbeiten.
- `config/vip_sound_roles.json` bleibt nur Import-/Fallback-Quelle.
- Twitch-Erkennung bleibt primaer.

---

### 7. VIP-Daily-Usage und Events/Statistiken spaeter im Dashboard anzeigen

Ziel:

- Heutige Nutzung anzeigen.
- Daily-Usage resetten.
- Letzte VIP-Events anzeigen.
- Statistiken aus `vip_sound_events` anzeigen.
- Retention/Cleanup spaeter konfigurierbar machen.

Wichtig:

- Auto-Cleanup noch nicht hart aktivieren.
- Retention spaeter ueber DB/Dashboard einstellbar machen.

---

### 8. Debug-Option in OBS entfernen

Ziel:

- Falls die VIP-Browserquelle noch mit `?debug=1` laeuft, Debug-Parameter wieder entfernen.
- Ziel-URL fuer normalen Betrieb:
  - `/overlays/vip_sound_overlay_v2.html`

Wichtig:

- Keine Backend-Aenderung noetig.
- Debug nicht dauerhaft im Stream aktiv lassen.

---

### 9. Alte VIP-Action in Streamer.bot sichern/deaktiviert lassen

Ziel:

- Alte direkte Legacy-VIP-Overlay-Action nicht mehr am `!vip`-Command betreiben.
- Alte Action vorerst deaktiviert lassen oder spaeter nach Backup entfernen.
- Neuer `!vip`-Ablauf bleibt:
  - Fetch URL -> `/api/vip-sound/command`

Wichtig:

- Nicht einfach loeschen, falls noch alte Referenzen geprueft werden muessen.
- Keine doppelte Ausloesung von `/api/vip-sound/enqueue`.

---

### 10. Dashboard-Modulstandard definieren

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

### 11. Fireworks spaeter neu aufbauen

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

### 12. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 13. Alerts-Modul spaeter behutsam splitten

Aktueller Zustand:

- alerts.js ist gross und funktionsreich.
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
