# TODO

## Diagnose / Registry

- [x] Zentrale Backend-Registry `/api/diagnostics/registry` eingeführt.
- [x] Registry-Coverage ergänzt und normalisiert.
- [x] Dashboard nutzt Registry mit Fallback.
- [x] Alte nicht mehr geladene Diagnose-Dateien aus Repo und Live entfernt.
- [x] Neue Modulregel dokumentiert: Diagnose-/Registry-Check ist Pflicht.

## Bei jedem neuen Modul prüfen

- [ ] Echte Datei-/Repo-Basis prüfen, keine Annahmen.
- [ ] Statusroute definieren oder begründet weglassen.
- [ ] Standard-`diagnostics`-Block einbauen, wenn diagnosefähig.
- [ ] Registry-Eintrag ergänzen, wenn diagnosefähig.
- [ ] Registry-Coverage testen.
- [ ] Keine neuen pro-Modul-Dashboard-Diagnose-Dateien anlegen.
- [ ] Modul-Doku und Projektstatus aktualisieren.

## Später sinnvoll

- [ ] Registry langfristig aus Modul-Metadaten statt statischer Liste erzeugen.
- [ ] Diagnosefähigkeit pro Modul sauber klassifizieren: fachlich / technisch / helper / bridge / overlay.
- [ ] Dashboard-Diagnose weiter als read-only Control-Center ausbauen, ohne produktive Buttons.
