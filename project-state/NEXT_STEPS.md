# NEXT STEPS - stream-control-center

Stand: 2026-05-03

## Wichtigster Grundsatz

Vor jedem neuen STEP:

1. git status pruefen.
2. docs/current/CURRENT_SYSTEM_STATUS.md lesen.
3. project-state/CURRENT_STATUS.md lesen.
4. Reale Dateien pruefen, keine Annahmen.
5. Kleine Aenderung planen.
6. Nach Aenderung testen, dokumentieren, committen, pushen und Live pruefen.

## Empfohlene naechste Arbeitspakete

### 1. STEP016 - VIP-Minimalroute mit Daily-Usage und DB-Texten

Ziel:

- Streamer.bot sendet nur Minimaldaten an Node.
- VIP-Modul prueft Daily-Usage pro User/pro Stream-Tag.
- VIP-Modul waehlt Heimleitungs-Zufallstext aus SQLite.
- VIP-Modul gibt einfache chatMessage zurueck.
- Keine Queue-Position mehr.
- Noch kein Dashboard-Umbau.
- Noch kein Overlay-Umbau.

Vorher pruefen:

- project-state/STEP015_VIP_SOUND_OVERLAY_PLAN_2026-05-03.md
- backend/modules/vip_sound_overlay.js
- backend/modules/sound_system.js
- backend/core/database.js
- backend/modules/sqlite_core.js
- backend/modules/helpers/helper_messages.js
- backend/modules/helpers/helper_config.js

Voraussichtlich betroffene Code-Dateien:

- backend/modules/vip_sound_overlay.js

Nur falls noetig:

- backend/core/database.js oder backend/modules/sqlite_core.js

Wichtig:

- app.sqlite niemals neu bauen oder ersetzen.
- Tabellen nur migrationssicher anlegen.
- Standardtexte nur seed'en, wenn Tabelle leer ist.
- Keine Funktionalitaet entfernen.

---

### 2. VIP-Sound-System-Kopplung

Ziel:

- VIP-Sound-Requests an sound_system uebergeben.
- Prioritaet/Queue/Cooldown des Sound-Systems nutzen.
- VIP-Overlay erst bei echtem Soundstart anzeigen.

Wichtig:

- Nicht gleichzeitig mit STEP016 erzwingen, wenn es zu gross wird.
- Sound-System nicht unnoetig umbauen.
- Bestehende alertSync-Logik als Orientierung verwenden.

---

### 3. Dashboard-Modulstandard definieren

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

### 4. VIP-Dashboard spaeter bauen

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

### 5. Fireworks spaeter neu aufbauen

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

### 6. Hug-Textbearbeitung spaeter sauber neu planen

Aktueller Zustand:

- Hug-System laeuft.
- Dashboard-Hug ist funktionierender Live-Stand.

Spaeterer Zielzustand:

- Rechte-/Rollenpruefung.
- Audit-Logging.
- Nutzung vorhandener Helper.
- Kein Parallelmodul.

---

### 7. Alerts-Modul spaeter behutsam splitten

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
