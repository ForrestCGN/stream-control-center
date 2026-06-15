# STEP LC-MINIGAMES-1D - Raffle Detail-Layout unten

Datum: 2026-06-15

## Ziel

Bereinigung der unteren Raffle-Dashboard-Darstellung im Loyalty/Mini-Spiele-Tab.

## Geändert

- `dashboard/modules/loyalty_games.js`
- `dashboard/modules/loyalty_games.css`
- Live-Zielpfade zusätzlich vorbereitet unter `htdocs/dashboard/modules/...`

## Änderungen

- Gewinnerregel wird nicht mehr als klebende Textzeile dargestellt.
- Gewinnerregel ist jetzt als saubere Zeilen-/Tabellenliste mit getrenntem Bereich für Teilnehmerzahl und Gewinnerregel aufgebaut.
- Textkeys werden als einzelne Chips dargestellt und laufen nicht mehr ineinander.
- Unterer Raffle-Bereich bekommt mehr Abstand und bessere Lesbarkeit.

## Nicht geändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine Raffle-Logik geändert.
- Keine Punktebuchung geändert.
- Keine Gamble-Logik geändert.
- Keine Textvarianten geändert.

## Test

1. ZIP passend zum Ziel entpacken.
2. Bei Repo-Workflow StepDone ausführen:

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP LC-MINIGAMES-1D Raffle Detail-Layout unten bereinigt"
```

3. Dashboard hart neu laden: `Strg + Shift + R`.
4. Prüfen: `Loyalty -> Mini-Spiele -> Raffle`.

## Erwartung

- Gewinnerregel ist sauber zeilenweise dargestellt.
- Textkeys erscheinen als einzelne Chips.
- Keine zusammengeklebten Texte im unteren Raffle-Bereich.
