# Changelog

## 0.2.19 - lokale OBS-Inventar UI als Mod-Bedienflaeche read-only vorbereitet

- OBS-Seite von technischer Statusanzeige in Richtung Mod-Bedienflaeche umgebaut.
- Aktuelle Program-Szene prominent sichtbar gemacht.
- Produktive Szenen nach Regel `Name beginnt nicht mit _` gefiltert.
- Interne `_`-Szenen aus normaler Mod-Ansicht ausgeblendet.
- Audioquellen inklusive read-only Mute-Status angezeigt.
- Quellen nur noch als kompakte Vorschau; Technikdetails sollen spaeter in Admin / Diagnose.
- Rollen-/Rechte-Zielbild vorbereitet: `obs.read`, `obs.scene.switch`, `obs.audio.mute`, `obs.source.visibility`.
- Keine OBS-Steuerung, keine Agent-Actions, keine Writes.
