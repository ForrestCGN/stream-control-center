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

### 1. STEP021 - soundSystemRequestId sauber in VIP-Response uebernehmen

Ziel:

- `soundSystemRequestId` aus `/api/sound/play` Response korrekt in der VIP-Response ausgeben.
- Wenn Sound-System die ID nicht direkt liefert, Response-Struktur zuerst pruefen.
- Nur falls noetig Sound-System-Response minimal erweitern.

Vorher pruefen:

- backend/modules/vip_sound_overlay.js
- backend/modules/sound_system.js
- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md

Wichtig:

- Kleine Aenderung.
- Keine Queue-Logik umbauen.
- Keine Funktionalitaet entfernen.
- Nach Aenderung `node -c` fuer betroffene JS-Dateien ausfuehren.
- Danach normale VIP-Ausloesung und Override erneut kurz testen.

---

### 2. Reale Streamer.bot-Rollen-/Badge-Parameter pruefen

Ziel:

- Sicherstellen, dass Streamer.bot 1.0.4 bei echten Commands die Rollen-/Badge-Daten so liefert, dass `actorCanOverride()` sie erkennt.
- Falls Streamer.bot andere Feldnamen liefert, nur das Mapping in `backend/modules/vip_sound_overlay.js` erweitern.

Wichtig:

- Keine Sound-/Queue-Logik umbauen.
- Keine Funktionalitaet entfernen.

---

### 3. VIP-Overlay an echten Sound-System-Start koppeln / verifizieren

Ziel:

- VIP-Overlay darf nicht beim Command oder Enqueue erscheinen.
- VIP-Overlay soll erst erscheinen, wenn das Sound-System den VIP-Sound wirklich startet.
- Sound-System-Visualdaten fuer `vip_sound_overlay` auswerten.
- Keine neue parallele Sound-Queue bauen.
- Alte `/api/vip-sound/enqueue`-Routen vorerst kompatibel lassen.

Vorher pruefen:

- project-state/STEP017_VIP_SOUND_SYSTEM_QUEUE_2026-05-03.md
- project-state/STEP019_VIP_SOUND_OVERRIDE_2026-05-04.md
- project-state/STEP020_VIP_OVERRIDE_LIVE_TEST_2026-05-04.md
- backend/modules/vip_sound_overlay.js
- backend/modules/sound_system.js
- htdocs/overlays/vip_sound_overlay.html
- htdocs/overlays/vip_sound_overlay_v2.html
- htdocs/overlays/sound_system_overlay.html

Wichtig:

- Keine Funktionalitaet entfernen.
- Sound-System bleibt Quelle fuer Prioritaet/Queue/Start.
- VIP-Modul darf keinen eigenen neuen Soundstart erzeugen.

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
