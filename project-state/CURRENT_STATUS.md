# CURRENT_STATUS

## Aktueller Stand: CAN-42.12b vorbereitet

CAN-42.12b ergänzt einen kleinen Dashboard-Fix für die zentrale Admin-Diagnose.

Auslöser:

- `/api/hug/status` liefert nach CAN-42.12 korrekt `moduleVersion = 0.1.1` und `diagnostics.version = 0.1.1`.
- In der Diagnose-Oberfläche wurde beim Hug-System trotzdem `Version 0.1` angezeigt.
- Außerdem wurde bei Hug `Routen -` angezeigt, obwohl mindestens die Statusroute `/api/hug/status` existiert.

Geändert:

```text
htdocs/dashboard/index.html
htdocs/dashboard/modules/diagnostics_hug_display_fix.js
```

Ergebnis:

- Das Dashboard lädt nach `diagnostics.js` zusätzlich `diagnostics_hug_display_fix.js`.
- Der Fix ist read-only und betrifft nur die Anzeige im zentralen Diagnosepanel.
- Wenn die Hug-Diagnosekarte sichtbar ist, wird `/api/hug/status` GET-only erneut gelesen und die sichtbaren Metriken `Version`, `Schema`, `Routen`, `Config-Quelle`, `Textsystem` und `Letzter Fehler` nachgezogen.
- Die Version wird explizit als String aus `diagnostics.version`, `moduleVersion` oder `version` angezeigt.
- `Routen` zeigt mindestens `1`, wenn keine Routenliste geliefert wird, aber die Statusroute erreichbar ist.

Nicht geändert:

```text
Kein Backend geändert
Keine Hug-/Rehug-Logik geändert
Keine Statusroute geändert
Keine DB-Migration
Keine produktive Aktion
Keine Admin-Aktion
Keine Funktionalität entfernt
```

Lokaler Syntax-Check im Chat:

```powershell
node --check htdocs/dashboard/modules/diagnostics_hug_display_fix.js
```

Nächster Schritt nach dem Entpacken:

```powershell
.\stepdone.cmd "CAN-42.12b Dashboard Hug diagnostics display fix"
node -c htdocs\dashboard\modules\diagnostics_hug_display_fix.js
```

Danach im Dashboard prüfen:

```text
Admin > Diagnose > Hug-System
Version = 0.1.1
Routen = 1 oder echte Routenzahl
GET Status erreichbar = OK
```
