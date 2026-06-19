# LWG-DASHBOARD-COPY-BOUND-WHEEL-2

Datum: 2026-06-19
Bereich: Loyalty / Giveaways / Dashboard

## Ziel

Der Dashboard-Button **Kopieren** soll bei einem Glücksrad-Giveaway nicht nur das Giveaway kopieren, sondern auch das an das Original-Giveaway gebundene Glücksrad vollständig für die Kopie duplizieren.

## Änderung

Datei:

- `htdocs/dashboard/modules/loyalty_giveaways.js`

Der Copy-Ablauf macht nun nach der bestehenden Backend-Copy-Route zusätzlich:

1. Original-Giveaway laden.
2. Originales gebundenes Wheel laden.
3. Kopiertes Giveaway laden.
4. Ziel-Bound-Wheel der Kopie prüfen bzw. anlegen.
5. Wenn das Ziel-Bound-Wheel noch keine Felder hat, werden alle Felder aus dem Original-Bound-Wheel kopiert.
6. Die kopierten Felder werden über die bestehende Backend-Route des kopierten Giveaways erstellt, sodass sie zur Kopie und zu deren eigenem Bound-Wheel gehören.

## Wichtig

- Das originale Giveaway bleibt unverändert.
- Das originale Bound-Wheel bleibt unverändert.
- Die Kopie bekommt eigene Bound-Wheel-Felder.
- Es wird kein gemeinsames Wheel zwischen Original und Kopie verwendet.
- Es wird keine Datenbankmigration durchgeführt.
- Es werden keine Chat-Commands aktiviert.

## Test

1. ZIP ab Repo-Root entpacken.
2. `stepdone.cmd "LWG-DASHBOARD-COPY-BOUND-WHEEL-2 Giveaway-Kopie kopiert Bound-Wheel-Felder"` ausführen.
3. Node/Backend muss für diese Dashboard-Datei normalerweise nicht neu gestartet werden, aber Dashboard im Browser mit Strg+F5 neu laden.
4. Kopie des Original-Giveaways erstellen.
5. In der Kopie auf **Glücksrad bearbeiten** gehen.
6. Erwartung:
   - eigenes gebundenes Rad vorhanden
   - Felder: gleiche Anzahl wie Original, z. B. 8
   - Startbereit: Ja

## Rollback

Die Datei `htdocs/dashboard/modules/loyalty_giveaways.js` aus dem vorherigen Backup/Repo-Stand wiederherstellen.
