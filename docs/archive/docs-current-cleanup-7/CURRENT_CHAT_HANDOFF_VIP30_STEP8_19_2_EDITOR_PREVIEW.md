# CURRENT CHAT HANDOFF – VIP30 STEP8.19.2 Editor Preview Prototype

Stand: 2026-06-06

## Inhalt

Erstellt wurde eine reine Test-/Vorschau-Datei:

```txt
htdocs/overlays/_test-vip30-editor-preview-a.html
```

## Zweck

Prototyp für den geplanten VIP30 Textset-Editor mit Live-Vorschau.

Regeln:

```txt
- bestehendes VIP30 Split-Lounge Design bleibt erhalten
- Textflow nach TestOverlay A
- Headline maximal 2 Zeilen
- keine 3-zeilige Headline
- Chips/Perks in der Vorschau ausgeblendet
- Testnamen-Dropdown inklusive CrazyMeerschweinchen und Extremnamen
- bestehende VIP30 Default-Textsets als Testdaten enthalten
```

## Nicht geändert

```txt
Backend
Datenbank
Dashboard-Produktivdateien
Sound-System-Bundle
Media-System
VIP30 Reward/EventSub Flow
produktives sound_system_overlay.html
produktives _overlay-vip30.html
```

## Nächster Schritt

Im Browser prüfen, ob der Editor-/Vorschau-Ansatz so grundsätzlich passt.
Erst danach entscheiden, ob die Logik in `htdocs/dashboard/modules/vip30.js` und `htdocs/dashboard/modules/vip30.css` produktiv eingebaut wird.
