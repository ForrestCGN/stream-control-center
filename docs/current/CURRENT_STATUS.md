# CURRENT_STATUS – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Dashboard-/Loyalty-Stand

```text
STEP235N – Doku-/Status-Refresh finaler STEP235-Stand
```

Zuletzt bestätigter Code-Stand:

```text
518dd6e4 STEP235M Remove Loyalty Runtime Shell Fallback
9ab5e619 STEP235J Remove Standalone Gamble Dashboard
```

Der aktuelle bestätigte Dashboard-/Loyalty-Stand ist:

```text
Loyalty ist fest in app.js und index.html integriert.
Gamble läuft ausschließlich im Loyalty-Bereich.
Die alte Standalone-Gamble-Seite ist entfernt.
STEP232-/Gamble-Shell-Reste sind bereinigt.
Der Runtime-Shell-Fallback in loyalty_games.js ist entfernt.
```

## Aktive Zielstruktur Dashboard / Loyalty

Dashboard-Einstieg:

```text
/dashboard
```

Aktive Loyalty-Bereiche:

```text
Loyalty → Gamble
Loyalty → Config → Gamble
Loyalty → Core / Kekskrümel
Loyalty → Giveaways
```

Aktive relevante Dashboard-Dateien:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/loyalty.js
htdocs/dashboard/modules/loyalty.css
htdocs/dashboard/modules/loyalty_games.js
htdocs/dashboard/modules/loyalty_games.css
htdocs/dashboard/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_giveaways.css
```

## Entfernte Altlasten

Folgende alte Standalone-/STEP232-Gamble-Struktur darf nicht mehr als Basis verwendet werden:

```text
htdocs/dashboard/loyalty-gamble.html
htdocs/dashboard/modules/loyalty-gamble.js
htdocs/dashboard/modules/loyalty-gamble.css
htdocs/dashboard/modules/loyalty-gamble-nav.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.js
htdocs/dashboard/modules/loyalty-gamble-shell-card.css
```

Status:

```text
Standalone-Gamble entfernt.
loyalty-gamble-nav.js war bereits nicht mehr vorhanden.
STEP232-/gamble-shell-card-Verweise wurden in der Prüfung nicht mehr gefunden.
```

## Bestätigte STEP235-Ergebnisse

```text
STEP235H – Config UX Standard aktiv
STEP235J – Standalone Gamble Dashboard entfernt
STEP235K – Cleanup-Prüfung ohne alte STEP232-/Gamble-Reste
STEP235L – Runtime-Fallback als überflüssig bewertet
STEP235M – Runtime-Shell-Fallback aus loyalty_games.js entfernt
STEP235N – dieser Doku-/Status-Refresh
```

## Gamble-Zielverhalten

Gamble wird nicht mehr über eine eigene Standalone-Seite gepflegt.

Aktiv ist:

```text
Loyalty → Gamble
Loyalty → Config → Gamble
```

Gamble-Config-UX:

```text
kein normal sichtbarer Dryrun
keine sichtbare „Write bestätigen“-Checkbox
Speichern nutzt Bestätigungsdialog
intern bleibt confirmWrite=true
keine rohe JSON-Ausgabe in der normalen Ergebnisbox
Audit/Statistik bleiben sichtbar
```

## Weiterhin gültiger LWG-4Q.11 Backend-/Giveaway-Stand

Der vorherige bestätigte Backend-/API-Stand für Loyalty / Giveaways / CGN-Glücksrad bleibt gültig:

```text
STEP LWG-4Q.11 – Manual Winner Flow and Prize Quantity Cleanup
```

Bestätigung:

```powershell
powershell -ExecutionPolicy Bypass -File .\Test_LWG_4Q11_manual_winner_flow_ForrestCGN.ps1
```

Ergebnis:

```text
ModuleBuild: STEP_LWG_4Q_11
=== TEST OK: Alle aktivierten Szenarien erfolgreich ===
```

Wichtige LWG-4Q.11-Regeln:

```text
Normale Giveaways enden nicht automatisch nach Gewinneranzahl.
Streamer entscheidet live über „Weiteren Gewinner auslosen“ und „Beenden“.
Glücksrad-Giveaways enden, wenn keine nutzbaren Wheel-Gewinne/Felder mehr vorhanden sind.
Paid Tickets buchen Loyalty-Punkte beim Ticket-Kauf ab.
Refund ist explizit steuerbar und idempotent.
Archivieren ist nur bei status=finished erlaubt.
Löschen bedeutet Hard-Delete.
```

## Wichtige Arbeitsregeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
Keine Tokens/.env/Secrets in ZIPs aufnehmen.
Bestehende Transaktionen/Audit-Daten nicht löschen.
Bei weiteren Änderungen zuerst echte aktuelle Dateien/Repo/Live-Stand prüfen.
Bei UI-Tests maximal ein Test-Giveaway pro Szenario erzeugen.
Keine großen UI-assisted Scripts mit mehreren parallelen Testfällen mehr verwenden.
STEP232-/Standalone-Gamble nicht mehr als Basis verwenden.
```
