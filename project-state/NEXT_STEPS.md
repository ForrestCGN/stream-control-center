# NEXT STEPS - stream-control-center

Stand: 2026-05-04

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. git status pruefen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Kleine Aenderung planen.
6. Nach Aenderung testen, dokumentieren, committen, pushen und Live pruefen.

## Empfohlene naechste Arbeitspakete

### 1. Debug-Option in OBS entfernen

Ziel:

- Falls die VIP-Browserquelle noch mit `?debug=1` laeuft, Debug-Parameter wieder entfernen.
- Ziel-URL fuer normalen Betrieb:
  - `/overlays/vip_sound_overlay_v2.html`

Wichtig:

- Keine Backend-Aenderung noetig.
- Debug nicht dauerhaft im Stream aktiv lassen.

---

### 2. Alte VIP-Action in Streamer.bot sichern/deaktiviert lassen

Ziel:

- Alte direkte Legacy-VIP-Overlay-Action nicht mehr am `!vip`-Command betreiben.
- Alte Action vorerst deaktiviert lassen oder spaeter nach Backup entfernen.
- Neuer `!vip`-Ablauf bleibt:
  - Fetch URL -> `/api/vip-sound/command`

Wichtig:

- Nicht einfach loeschen, falls noch alte Referenzen geprueft werden muessen.
- Keine doppelte Ausloesung von `/api/vip-sound/enqueue`.

---

### 3. Optional: echten Mod-Account testen

Ziel:

- Ein echter Mod testet einmal den VIP-Override-Command mit Target.
- Erwartung: Streamer.bot liefert ebenfalls `isModerator=True`.

Wichtig:

- Nur notwendig, wenn wir absolut sicher sein wollen.
- Kein Code-Fix erwartet.

---

### 4. VIP-Soundpfad konfigurierbar machen

Ziel:

- Aktueller Fallback bleibt: `D:\Streaming\stramAssets\htdocs\assets\sounds\vip\`.
- Ziel: Pfad/Dateiregel ueber DB/Config und spaeter Dashboard bearbeitbar.
- Keine hart codierten Pfade als Endloesung.

Wichtig:

- Bestehende ENV-Fallbacks nicht entfernen.
- Dashboard erst nach stabiler Backend-API.

---

### 5. VIP-Dashboard spaeter bauen

Ziel:

- VIP-Status anzeigen.
- Heimleitungs-Texte pro Event-Key bearbeiten.
- Texte aktivieren/deaktivieren.
- Gewichtung einstellen.
- VIP-Soundpfad und Dateiregel konfigurieren.
- Testausloesung ermoeglichen.

Wichtig:

- Erst nach stabiler Backend-API.
- Dashboard soll API nutzen, nicht direkt Dateien/SQL anfassen.

---

### 6. Dashboard-Modulstandard definieren

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

### 7. Fireworks spaeter neu aufbauen

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

### 8. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 9. Alerts-Modul spaeter behutsam splitten

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
