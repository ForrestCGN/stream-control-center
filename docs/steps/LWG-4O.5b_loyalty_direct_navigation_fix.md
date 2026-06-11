# LWG-4O.5b – Loyalty Direct Navigation Fix

## Ziel

Der Klick auf die linke Hauptnavigation **Loyalty** soll direkt das Loyalty-Modul öffnen. Die zusätzliche Zwischenübersicht mit der Kachel „Loyalty Games“ soll nicht mehr nötig sein.

## Geändert

- `htdocs/dashboard/modules/loyalty_games.js`
  - Sidebar-Button `Loyalty` wird auf direkte Modulnavigation zu `loyalty_games` umgestellt.
  - Bestehende Section-Buttons werden per Capture-Handler abgefangen, damit alte Section-Overview-Handler nicht mehr zuerst greifen.
  - Labels wurden bereinigt:
    - `Loyalty Games` → `Loyalty`
    - Sidebar-Subtitle → `Punkte, Giveaways, Glücksrad`
    - Modulbeschreibung ohne „Spiele“-Zwischenebene.
  - Section-Metadaten enthalten zusätzlich `directModule`, `defaultModule` und `hideOverview` als neutrale Hinweise für vorhandene/future Dashboard-Logik.

## Nicht geändert

- Kein Backend-Code.
- Kein Claim-/Giveaway-/Wheel-Runtime-Verhalten.
- Keine Datenbankänderung.
- Keine Funktionalität entfernt.

## Test

```powershell
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

Danach Dashboard hart neu laden und links auf **Loyalty** klicken.

Erwartung:

- Es erscheint direkt das Loyalty-Modul.
- Keine Zwischenkarte „Loyalty Games“ mit zusätzlichem Öffnen-Knopf.
- Sidebar zeigt `Punkte, Giveaways, Glücksrad`.
