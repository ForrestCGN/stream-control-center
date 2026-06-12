# CURRENT_STATUS – stream-control-center

Stand: 2026-06-12

## Aktueller bestätigter Dashboard-/Loyalty-Stand

```text
STEP235S – Final Gamble Config Cleanup abgeschlossen
```

Zuletzt bestätigter Code-/Doku-Stand:

```text
STEP235P – Gamble Actor Fields Prepared
STEP235R – Gamble Cooldown UX Cleanup
STEP235S – finaler Doku-/Abschlussstand für Gamble-Config-Cleanup
```

Der aktuelle bestätigte Dashboard-/Loyalty-Stand ist:

```text
Loyalty ist fest in app.js und index.html integriert.
Gamble läuft ausschließlich im Loyalty-Bereich.
Die alte Standalone-Gamble-Seite ist entfernt.
STEP232-/Gamble-Shell-Reste sind bereinigt.
Der Runtime-Shell-Fallback in loyalty_games.js ist entfernt.
Actor-/Rollenfelder sind aus der normalen Gamble-Config-UI entfernt.
Cooldowns werden in der UI als Sekunden angezeigt und intern weiter in ms gesendet.
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

## Gamble Config – finaler STEP235-Zustand

Sichtbar im normalen Streamer-Dashboard:

```text
Engine aktiv
Command aktiv
Chat-Antwort
Gewinnchance %
Auszahlung x
Mindesteinsatz
Maximaleinsatz
Gamble-Cooldown pro User (Sek.)
Gamble-Cooldown global (Sek.)
Command-Cooldown pro User (Sek.)
Prozent-Einsätze erlauben
Keyword-Einsätze erlauben
Speichern
Letztes Speicher-Ergebnis
```

Nicht mehr sichtbar:

```text
Actor Login
Actor Rolle
Cooldown-Felder mit ms-Labels
technische Rohdaten-/JSON-Blöcke in der Ergebnisbox
Dryrun-Button
Write-bestätigen-Checkbox
```

Intern weiterhin erhalten:

```text
confirmWrite=true
Audit-Eintrag
actorLogin / actorDisplayName / actorRole
Cooldown-Werte in Millisekunden für Backend/API
```

## Rechtesystem

Das echte Dashboard-Rechtesystem wird später umgesetzt.

Aktuell nur vorbereitet:

```text
getDashboardActorFallback()
getDashboardActor()
window.CGN.auth.user als spätere Quelle
```

Bis echte Rechte/Sessiondaten angebunden sind, nutzt der Gamble-Config-Write den sicheren Fallback:

```text
actorLogin = forrestcgn
actorDisplayName = ForrestCGN
actorRole = streamer
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
STEP235N – Doku-/Status-Refresh
STEP235O – Actor-/Rollenfelder geprüft
STEP235P – Actor-/Rollenfelder aus normaler UI entfernt, Rechteanbindung vorbereitet
STEP235Q – Gamble-Config-UI geprüft
STEP235R – Cooldown-UX von ms auf Sekunden umgestellt
STEP235S – Gamble-Config-Cleanup final abgeschlossen
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
