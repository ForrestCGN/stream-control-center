# Changelog

## 0.2.21 - OBS Allowlist-/Rechte-Modell read-only

- OBS-Allowlist-Modell fuer spaetere Szene-/Audio-/Quellen-Bedienung vorbereitet.
- Rechte-Zielbild read-only vorbereitet: `obs.read`, `obs.scene.switch`, `obs.audio.mute`, `obs.source.visibility`, `obs.admin.diagnostics`.
- UI zeigt Szenen nicht mehr pauschal als spaeter schaltbar.
- UI unterscheidet read-only: aktuell / freigegeben / nicht freigegeben.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.20C - Agent OBS Live-State Scene Mapping read-only

- Scene-Mapping im Live-State korrigiert.
- Webserver uebernimmt `currentScene` / `currentProgramSceneName` korrekt aus dem Agent-Live-State.
- Online-Endpoint `/api/remote/agent/obs/live/status` liefert bestaetigt `active=true` und `status=live_scene_available`.
- Bestaetigte Szene: `Live Gameplay Engel&Forrest`.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.

## 0.2.20B - Agent Heartbeat slim + Live-State getrennt

- Heartbeat abgespeckt, damit Verbindung nicht wegen `heartbeat_payload_too_large` getrennt wird.
- Schneller Live-State bleibt separat.
- Architektur festgelegt: Heartbeat klein, Live-State schnell, Inventory langsam/groesser.

## 0.2.20 - Agent OBS Live-State read-only

- Schnellen OBS-Live-State ueber Agent-WSS vorbereitet.
- Online-Route `/api/remote/agent/obs/live/status` vorbereitet.
- UI auf Online-Live-State vorbereitet.
- Alles read-only und in Memory.

## 0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet

- OBS-Seite von technischer Statusanzeige in Richtung Mod-Bedienflaeche umgebaut.
- Aktuelle Program-Szene prominent sichtbar gemacht.
- Produktive Szenen nach Regel `Name beginnt nicht mit _` gefiltert.
- Interne `_`-Szenen aus normaler Mod-Ansicht ausgeblendet.
- Audioquellen inklusive read-only Mute-Status angezeigt.
- Quellen nur noch als kompakte Vorschau; Technikdetails sollen spaeter in Admin / Diagnose.
- Rollen-/Rechte-Zielbild vorbereitet.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
