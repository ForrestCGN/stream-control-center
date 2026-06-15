# STEP LC-MINIGAMES-1C – Dashboard Layout-Cleanup

Datum: 2026-06-15
Bereich: Loyalty / Mini-Spiele / Dashboard

## Ziel

Dieser STEP bereinigt ausschließlich das Layout im neuen Loyalty-Tab **Mini-Spiele**. Die in 1B sichtbar gewordenen Raffle- und Gamble-Karten sowie Detailbereiche bleiben funktional unverändert, werden aber optisch besser lesbar dargestellt.

## Geänderte Dateien

- `dashboard/modules/loyalty_games.js`
- `dashboard/modules/loyalty_games.css`

## Änderungen

- KPI-Karten in Mini-Spiele/Gamble und Mini-Spiele/Raffle erhalten eine eigene Darstellung mit klar getrennten Label-, Wert- und Hinweiszeilen.
- Raffle-Formularfelder erhalten sauberere Abstände.
- Checkbox-Zeilen im Raffle-Formular werden als klare Zeilen mit Text links und Schalter rechts dargestellt.
- Der Begriff `Gewinnpool intern` wurde im Raffle-Dashboard zu `Raffle-Gewinn gesamt` umbenannt, damit klarer ist, dass dieser Betrag intern auf die Gewinner aufgeteilt wird.
- Der interne Gewinnbetrag bleibt im Dashboard sichtbar.
- Die öffentliche Chat-Regel bleibt unverändert: Der Pool wird im Chat nicht angezeigt.

## Nicht geändert

- Keine Backend-Änderung.
- Keine Datenbank-Änderung.
- Keine Raffle-Logik geändert.
- Keine Punktebuchung geändert.
- Keine Gamble-Logik geändert.
- Keine Textvarianten geändert.
- Keine Command-Änderung.

## Test

1. ZIP nach `D:\Git\stream-control-center` entpacken.
2. StepDone ausführen:

```powershell
.\stepdone.cmd "STEP LC-MINIGAMES-1C Dashboard Layout-Cleanup fuer Mini-Spiele"
```

3. Optional Syntax prüfen:

```powershell
node -c .\dashboard\modules\loyalty_games.js
```

4. Dashboard neu laden:

```text
http://127.0.0.1:8080/dashboard
```

5. Prüfen:

- `Loyalty -> Mini-Spiele`
- KPI-Werte kleben nicht mehr direkt an den Labels.
- Raffle-Formular ist besser lesbar.
- Raffle speichert weiterhin über `/api/loyalty/raffle/config`.
- `showPoolInChat` bleibt `false`.
