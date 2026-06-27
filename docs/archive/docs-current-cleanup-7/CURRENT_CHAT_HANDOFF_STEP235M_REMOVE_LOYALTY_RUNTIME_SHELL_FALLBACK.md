# CURRENT CHAT HANDOFF – STEP235M Remove Loyalty Runtime Shell Fallback

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
Bereich: Dashboard / Loyalty / Runtime-Shell

## Ziel

Die alte Runtime-Shell-Injection aus `htdocs/dashboard/modules/loyalty_games.js` wurde entfernt bzw. auf eine harmlose Reload-Absicherung reduziert.

## Hintergrund

Seit STEP235A ist Loyalty fest in der Dashboard-Shell registriert:

- `htdocs/dashboard/app.js` enthält `loyalty`, `loyalty_games` und `loyalty_giveaways` in `window.CGN.modules`.
- `htdocs/dashboard/app.js` enthält `window.CGN.sections.loyalty`.
- `htdocs/dashboard/index.html` enthält den festen Hauptnavigationspunkt `data-section="loyalty"`.

Damit muss `loyalty_games.js` keine Navigation, Section-Einträge, ModuleCatalog-Einträge oder Favorites mehr zur Laufzeit erzeugen.

## Geänderte Datei

- `htdocs/dashboard/modules/loyalty_games.js`

## Entfernt

Aus `loyalty_games.js` entfernt:

- `ensureLoyaltyMainSection()`
- Runtime-Erzeugung von `window.CGN.sections.loyalty`
- Runtime-Erzeugung des Loyalty-Navigationsbuttons
- Runtime-Überschreiben von `window.CGN.modules.loyalty_games`
- Runtime-Überschreiben von `window.CGN.moduleCatalog.loyalty_games`
- Runtime-Manipulation von `window.CGN.favorites`
- automatisches Nachschieben von `loyalty_games` in Section-Items

## Behalten

`registerDashboardModule()` bleibt als kleine Absicherung bestehen:

- prüft `window.CGN.modules.loyalty_games`
- aktualisiert nur die Reload-Funktion
- ergänzt nur fehlende Overlay-Label/Link-Werte ohne die Shell-Struktur zu erzeugen
- rendert optional `SectionHomeModule` neu

## Nicht geändert

- kein Backend
- keine Datenbank
- keine API
- keine Commands
- keine Gamble-Engine
- keine Giveaways
- kein Loyalty-Core
- keine Overlays
- keine Tabs oder produktiven Funktionen im Loyalty-Bereich

## Tests

Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
node -c .\htdocs\dashboard\app.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_giveaways.js
```

Browser-Test:

- `/dashboard`
- Loyalty links sichtbar
- Klick auf Loyalty öffnet `loyalty_games`
- Tabs bleiben sichtbar
- Gamble funktioniert
- Config → Gamble funktioniert
- Audit/Statistik laden
- Core/Giveaways erreichbar
- keine doppelte Navigation
- keine Console-Fehler

## StepDone

Nach erfolgreichem Test:

```powershell
.\stepdone.cmd "STEP235M Remove Loyalty Runtime Shell Fallback"
```

## Risiko

Niedrig bis mittel. Die feste Shell-Struktur ist vorhanden. Falls ein sehr alter Einstieg ohne `app.js` existiert, würde er nicht mehr durch `loyalty_games.js` repariert. Im regulären Dashboard ist das gewollt.
