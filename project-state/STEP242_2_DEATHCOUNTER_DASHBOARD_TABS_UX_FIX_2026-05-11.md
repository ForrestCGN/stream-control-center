# STEP242.2 DeathCounter Dashboard Tabs/UX Fix - 2026-05-11

## Ziel

DeathCounter-Dashboard aufraeumen und die Modul-Reiter korrekt trennen.

## Geaendert

- `htdocs/dashboard/modules/deathcounter.js`
- `htdocs/dashboard/modules/deathcounter.css`

## Inhalt

- `dc-panel[hidden]` wird jetzt per CSS wirklich ausgeblendet.
- Die Uebersicht enthaelt nur noch Kurzstatus und sichtbare Spieler.
- Spieler & Counts wurden in den neuen Tab `Spieler` verschoben.
- Eine erste `Statistik`-Seite wurde ergaenzt: KPIs, Top AllTime, Top aktuelles Spiel, Top Heute.
- Steuerung, Settings, Texte und Diagnose bleiben eigene Tabs.

## Nicht geaendert

- Kein Backend.
- Keine Datenbankstruktur.
- Keine Count-/State-Migration.
- Kein Overlay-Design.
- Keine Streamer.bot-Action.
