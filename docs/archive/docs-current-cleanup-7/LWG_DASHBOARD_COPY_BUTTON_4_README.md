# LWG-DASHBOARD-COPY-BUTTON-4

Fix: Der Kopieren-Button wird wieder sichtbar angezeigt, auch wenn ein Giveaway noch im Status `draft`/bearbeitbar ist.

Zusätzlich bleibt die Copy-Bound-Wheel-Field-Logik aus dem vorherigen Stand erhalten. Beim Kopieren wird der Titel aus dem tatsächlich angeklickten Giveaway ermittelt.

## Test
1. ZIP ab Repo-Root entpacken.
2. `stepdone.cmd` ausführen.
3. Dashboard per Strg+F5 neu laden.
4. Im Giveaway-Tab prüfen: Button `Kopieren` ist bei der Karte sichtbar.
5. Kopieren, neue Kopie öffnen, Glücksrad bearbeiten: Felder sollten kopiert sein.
