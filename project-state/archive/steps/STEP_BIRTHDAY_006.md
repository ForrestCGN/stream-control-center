# STEP_BIRTHDAY_006 – Celebration Overlay Visual Upgrade

## Ziel

Birthday-Overlay optisch deutlich aufwerten, ohne Command-, Queue-, Sound-System- oder Dashboard-Speicherlogik zu ändern.

## Änderungen

- `htdocs/overlays/_overlay-birthday.html` komplett visuell überarbeitet.
- Klarere Trennung: Intro ruhig, Party eskaliert erst bei `phase=party`.
- Avatar wird stärker inszeniert: Neon-Ring, Krone, Spotlight.
- Mehrere optisch unterscheidbare Styles: `classic_party`, `cgn_neon`, `epic_party`, `heimaufsicht_fun`, `cute_soft`.
- Partyphase wirkt lebendiger über Szenenwechsel: Herzregen, Konfetti-Sturm, Namens-Spotlight, Cake/Heimaufsicht, Final Burst.
- Zusätzliche Effektlayer: Herzen, Konfetti, Ballons, Sparkles, Bokeh, Ringe, Lichtstrahlen, Ribbon-Runner, Floating-Words.
- Fallback-Effekte pro Style, falls Party-Preset noch keine eigenen Effekte gesetzt hat.

## Nicht geändert

- Keine Änderung an Birthday-Queue.
- Keine Änderung am Sound-System.
- Keine Änderung an Uploads, User-Resolve oder Party-Preset-Speicherung.
- Keine Funktionen entfernt.

## Test

```powershell
node --check backend\modules\birthday.js
```

Overlay im Browser:

```text
http://127.0.0.1:8080/overlays/_overlay-birthday.html?debug=1
```
