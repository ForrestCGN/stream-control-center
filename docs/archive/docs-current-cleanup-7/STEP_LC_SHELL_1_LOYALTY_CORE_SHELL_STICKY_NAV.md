# STEP LC-SHELL-1 – Loyalty Core als gemeinsame Shell mit sticky Navigation

## Ziel

Loyalty/Core ist die gemeinsame Hauptstruktur für den Loyalty-Bereich. Die Hauptnavigation wird nicht mehr in jedem Loyalty-Unterbereich einzeln gepflegt, sondern zentral über `loyalty.js` bereitgestellt und von Core, Games und Giveaways genutzt.

## Geändert

- `htdocs/dashboard/app.js`
  - Loyalty-Hauptbereich zeigt wieder auf `loyalty` / Core.
- `htdocs/dashboard/index.html`
  - Linker Loyalty-Hauptbutton zeigt auf `loyalty` / Core.
- `htdocs/dashboard/modules/loyalty.js`
  - zentrale Loyalty-Hauptnavigation definiert.
  - zentrale Funktionen `renderMainTabs`, `bindMainTabs`, `openMainTab` bereitgestellt.
  - Core nutzt dieselbe Hauptnavigation.
- `htdocs/dashboard/modules/loyalty_games.js`
  - nutzt die zentrale Loyalty-Hauptnavigation aus `loyalty.js`.
  - Übersicht lädt zusätzlich `/api/loyalty/status` und zeigt Core-Status/Konten/Transaktionen/WatchStates/Runner an.
- `htdocs/dashboard/modules/loyalty_giveaways.js`
  - nutzt die zentrale Loyalty-Hauptnavigation aus `loyalty.js`.
- `htdocs/dashboard/modules/loyalty.css`
- `htdocs/dashboard/modules/loyalty_games.css`
- `htdocs/dashboard/modules/loyalty_giveaways.css`
  - gemeinsame Hauptnavigation ist sticky und bleibt beim Scrollen sichtbar.

## Nicht geändert

- Kein Backend.
- Keine DB.
- Kein Shadow/Live-Wechsel.
- Keine Commands geändert.
- Keine Punkte-Migration.
- Keine Games-/Giveaway-Funktionalität entfernt.
- Keine neue Moduldatei angelegt.

## Tests

1. Dashboard hart neu laden (`STRG + F5`).
2. Links auf `Loyalty` klicken.
   - Erwartung: `Loyalty / Core` öffnet.
3. In der Hauptnavigation prüfen:
   - Übersicht
   - Core
   - Glücksrad
   - Presets
   - Giveaways
   - Gamble
   - Config
   - Chat/Commands
   - Verlauf
   - Hinweise
4. Zwischen Core, Übersicht, Glücksrad und Giveaways wechseln.
5. In Giveaways weit nach unten scrollen.
   - Erwartung: Hauptnavigation bleibt sichtbar/sticky.
6. Übersicht prüfen.
   - Erwartung: Core-Status zeigt Modus, User, Transaktionen, WatchStates, StreamElements/Shadow und Runner.

## StepDone

```cmd
.\stepdone.cmd "STEP LC-SHELL-1 Loyalty Core als gemeinsame Shell mit sticky Navigation"
```
