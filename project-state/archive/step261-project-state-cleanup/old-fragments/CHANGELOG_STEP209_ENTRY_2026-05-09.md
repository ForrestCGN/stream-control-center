# CHANGELOG ENTRY – STEP209

Stand: 2026-05-09

## STEP209 – Alert Message Text Settings

Added:
- Display-Profil-Einstellungen für Nachrichtentext im Alert-Overlay:
  - `messageEnabled`
  - `messageScale`
  - `messageWidthMode`
  - `messageMaxLines`
  - `messageWeight`

Changed:
- Alert-Designformular erweitert.
- Live-Vorschau an Nachrichtentext-Settings angebunden.
- Overlay-Rendering für Nachrichtentext an neue Settings angepasst.
- Mehrere Layout-/Preview-Fixes bis STEP209.4.

Fixed:
- Designformular war teilweise nicht erreichbar.
- Nachrichtengröße wurde durch alte spezifische Overlay-CSS-Regeln überstimmt.
- Nachrichtentext-Block war uneinheitlich/gequetscht.
- Layout lief rechts aus dem sichtbaren Bereich.

Unchanged:
- keine Backend-Änderung
- keine DB-Migration
- keine Alert-Regeländerung
- keine TTS-/Sound-/Queue-Änderung
- keine Funktionalität entfernt

Open:
- allgemeines Dashboard-Design später separat vereinheitlichen.
