# CURRENT_CHAT_HANDOFF_VIP30_STEP8_19_4_SIMPLE_NAME_POSITION_EXACT_DESIGN

## Ziel
Korrektur der STEP8.19.3 Preview: gleicher vereinfachter Aufbau, aber optisch naeher am echten VIP30-Block aus `sound_system_overlay.html`.

## Dateien
- `htdocs/overlays/_test-vip30-editor-preview-simple-position-exact.html`

## Inhalt
- Username separat anzeigen
- `namePosition: top/bottom`
- Headline 1 maximal 2-zeilig
- Subline mit groesserem Abstand unter der Headline
- Preview-Card-Basis exakt an den VIP30-Split-Lounge-Werten aus `sound_system_overlay.html` ausgerichtet:
  - 840x310
  - 245px linker Bereich
  - gleicher Hintergrundverlauf
  - gleicher Neon-Rahmen
  - gleicher Avatar-Ring
  - gleiche Grundabstaende im rechten Textbereich

## Nicht geaendert
- Keine produktive Dashboard-Datei
- Kein Backend
- Keine DB
- Kein Sound-System-Overlay produktiv
- Kein Reward-/EventSub-/Media-Flow

## Test
Nach Entpacken nach `D:\Git\stream-control-center`:

```cmd
cd /d D:\Git\stream-control-center
```

Im Browser oeffnen:

```txt
http://127.0.0.1:8080/overlays/_test-vip30-editor-preview-simple-position-exact.html
```

Danach Step abschliessen:

```cmd
.\stepdone.cmd "VIP30 STEP8.19.4 Simple Name Position Preview Sound-Design korrigiert"
```
