# STEP624B – Verschachtelte OBS-Szenen im Overlay-Monitor

## Ziel
Der Overlay-Monitor wertet die aktuell gewählte OBS-Program-Szene nicht mehr nur flach aus, sondern verfolgt eingebundene Unter-Szenen wie `_Alerts`, `_Audio`, `_Overlay-Deathcounter` usw.

## Änderungen
- `Control → Overlays → Quellenstatus` nutzt weiterhin die aktuelle OBS-Program-Szene als Standardauswahl.
- Bei Auto-Follow wird bei Szenewechsel automatisch die neue Program-Szene ausgewertet.
- Scene-Items werden rekursiv verfolgt, wenn ein Item selbst eine OBS-Szene ist.
- Browserquellen aus Unter-Szenen werden im Quellenstatus angezeigt.
- Pro Quelle werden Pfad, Container, direkte Sichtbarkeit und effektive Sichtbarkeit angezeigt.
- Die effektive Sichtbarkeit wird über alle Eltern-Szenen berechnet.

## Beispiel
`Live Gameplay Forrest → _Alerts → _VIP-Sound 1.5`

Wenn `_Alerts` oder `_VIP-Sound 1.5` ausgeblendet ist, gilt die Browserquelle effektiv als nicht sichtbar.

## Nicht enthalten
- Keine OBS-Aktionen
- Kein Cache-Refresh
- Keine Reparaturbuttons
- Keine DB-Migration
- Kein Backend-Code
