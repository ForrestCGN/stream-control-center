# STEP272I3 - Sound-Pegel Dashboard Dropdown-Auswahl

## Ziel
Boost-Kandidaten werden im Dashboard nicht mehr als lange Liste untereinander angezeigt. Stattdessen wählt man genau einen Sound über ein Dropdown aus und bearbeitet nur diesen Sound.

## Änderungen
- `System -> Sound-Pegel -> Boost-Kopien` zeigt eine Sound-Auswahl per Dropdown.
- Dropdown gruppiert Kandidaten nach:
  - aktiv genutzte Sounds
  - gespeicherte/deaktivierte Sounds
  - nicht in DB verwendete/Altdateien
- Nach Aktionen bleibt die ausgewählte Datei erhalten, solange sie weiterhin in der Preview vorkommt.
- Die Detailansicht zeigt nur noch die aktuell gewählte Datei mit:
  - Verwendung
  - LUFS/True Peak
  - Boost-Slider/Presets
  - Original abspielen
  - Test-Kopie abspielen
  - Boost-Kopie erzeugen
  - Als Original übernehmen
- Auswahl wird lokal im Browser gespeichert (`sound-level-selected-boost-file`).

## Sicherheit
- Keine Sound-Dateien im ZIP.
- Keine Backend-Logik geändert.
- Keine Originaldateien überschrieben.
- Keine Alert-/SoundAlert-Regeln geändert.
- `config/**` bleibt unverändert.

## Tests
- `node --check htdocs/dashboard/modules/sound_levelscan.js`
