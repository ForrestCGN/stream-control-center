# CURRENT_CHAT_HANDOFF_CAN44_29_SHOUTOUT_OVERLAY_SETS_DROPDOWN

Problem:
- CAN44.28 zeigte im Texte-Tab nur die alten Fallback-Keys shoutout.overlay.headline/subline.
- Nutzer wollte die Set-Zeilen weiter über Dropdown auswählen, nicht als getrennte Seite/Tab.

Lösung:
- Im Texte-Tab wird ein Pseudo-Textkey `shoutout.overlay.sets` in die Kategorie `shoutout.overlay` injiziert.
- Wenn dieser Key gewählt ist, rendert das Dashboard einen Spezialeditor mit Headline/Subline-Sets.
- Die alten Textkeys bleiben als Fallback sichtbar.

Geänderte Dateien:
- htdocs/dashboard/modules/shoutout_v2.js
- htdocs/dashboard/modules/shoutout_v2.css

Testpfad:
- Community -> Shoutout -> Texte -> Kategorie: Shoutout Overlay -> Textkey: shoutout.overlay.sets
