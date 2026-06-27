# LWG-DASHBOARD-COPY-BOUND-WHEEL-3

Fix für Dashboard-Kopieren von Giveaway-bound Glücksrädern.

## Zweck

Beim Klick auf **Kopieren** wird nach der bestehenden Backend-Copy-Route geprüft, ob das Original ein gebundenes Glücksrad mit Feldern hat. Wenn die Kopie ein eigenes Bound-Wheel, aber noch keine Felder hat, werden die Felder aus dem Original-Bound-Wheel in das Bound-Wheel der Kopie kopiert.

## Betroffene Datei

- `htdocs/dashboard/modules/loyalty_giveaways.js`

## Nicht geändert

- Keine Backend-Datei
- Keine DB-Migration
- Keine Commands
- Keine Punktebuchung
- Kein globales Preset-Sharing

## Test

1. ZIP ab Repo-Root entpacken.
2. `stepdone.cmd` ausführen.
3. Node/Dashboard neu laden, Browser mit Strg+F5.
4. Alte kaputte Kopie löschen.
5. Original-Giveaway kopieren.
6. Kopie > Glücksrad bearbeiten öffnen.

Erwartung: Kopie hat eigenes gebundenes Rad und dieselbe Feldanzahl wie das Original.
