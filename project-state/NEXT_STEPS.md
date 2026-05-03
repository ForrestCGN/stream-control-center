# NEXT STEPS - stream-control-center

Stand: 2026-05-03

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. git status prüfen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien prüfen, keine Annahmen.
5. Kleine Änderung planen.
6. Nach Änderung testen, dokumentieren, committen, pushen und Live prüfen.

## Empfohlene nächste Arbeitspakete

### 1. Dashboard-Modulstandard definieren

Ziel:

- Einheitlicher Aufbau für Dashboard-Module.
- Klare Struktur für init/load/render/bindActions.
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

### 2. VIP-/Sound-/Overlay-System weiterentwickeln

Nur starten, wenn vorher der aktuelle Stand geprüft wurde.

Vorher prüfen:

- docs/current/CURRENT_SYSTEM_STATUS.md
- docs/sound_system/
- htdocs/dashboard/modules/sound.js
- backend/modules/sound_system.js
- backend/modules/vip_sound_overlay.js

---

### 3. Fireworks später neu aufbauen

Aktueller Zustand:

- Fireworks-Routen sind doppelt registriert.
- Dokumentiert in STEP008.
- Kein kurzfristiger Umbau.

Späterer Zielzustand:

- Fireworks vollständig in eigenes Modul.
- server.js von Fireworks-Spezialrouten befreien.
- Einheitliches /api/fireworks/* System.
- WebSocket-Broadcast zentralisieren.

---

### 4. Hug-Textbearbeitung später sauber neu planen

Aktueller Zustand:

- Hug-System läuft.
- Unfertiges hug_text_admin.js wurde entfernt.
- Dashboard-Hug ist funktionierender Live-Stand.

Späterer Zielzustand:

- Keine alte unfertige Version wiederbeleben.
- Rechte-/Rollenprüfung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 5. Alerts-Modul später behutsam splitten

Aktueller Zustand:

- alerts.js ist groß und funktionsreich.
- Nicht blind umbauen.

Späterer Zielzustand:

- alerts.api.js
- alerts.rules.js
- alerts.assets.js
- alerts.texts.js
- alerts.presets.js
- alerts.history.js

Wichtig:

- Nur schrittweise.
- Erst Tests und Doku.
