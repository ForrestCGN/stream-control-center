# CURRENT_CHAT_HANDOFF_CAN44_30_SHOUTOUT_OVERLAY_SETS_VISIBLE_FIX

CAN44.29 Problem:
- Pseudo-Key shoutout.overlay.sets wurde nicht im Dropdown angezeigt.

CAN44.30 Fix:
- Injection in textRowsForCategory('shoutout.overlay')
- zusätzlicher Guard in renderTextKeyOptions()

Dateien:
- htdocs/dashboard/modules/shoutout_v2.js
- htdocs/dashboard/modules/shoutout_v2.css
