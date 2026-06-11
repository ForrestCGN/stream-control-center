# CURRENT_STATUS – stream-control-center

Stand: 2026-06-11

## Aktueller bestätigter Hauptstand

```text
STEP213 / LWG-5.5 – Points Command Freigabepaket
```

## Bestätigt

```text
STEP212b / LWG-5.4b – Points Runtime kontrolliert bestätigt
```

Live-Test-Ergebnis:

```text
=== TEST OK: STEP212b / LWG-5.4b Points Runtime kontrolliert bestaetigt ===
```

Bestätigte Punkte:

```text
Loyalty-Core läuft: v0.1.13 / shadow
Verfügbare Punkte korrekt: 3400
Ranking korrekt: Platz 2 von 418
!punkte war vor Test deaktiviert
Disabled-Guard greift korrekt
Temporärer Runtime-Test für !punkte funktioniert
!points Alias funktioniert
@user-Abfrage blockt Nicht-Mods korrekt
Restore hat !punkte wieder deaktiviert
```

## Runtime-Stand

```text
backend/modules/loyalty.js
version: 0.1.13
step: STEP210

backend/modules/loyalty_games.js
moduleVersion: 0.2.2
moduleBuild: STEP_LWG_5_2_STATUS_CLEANUP

backend/modules/loyalty_games/gamble.js
vorbereitet seit LWG-5.1
```

STEP213 enthält keine Runtime-JS-Änderung, sondern Freigabe-/Rollback-/Testscript plus Doku.

## Freigabeziel STEP213

Nur aktivieren:

```text
!punkte
!points
```

Nicht aktivieren:

```text
!givepoints
!setpoint
!gamble
!duell
!raffle
!roulette
```

## Arbeitsregeln

```text
Keine Funktionalität entfernen.
Keine produktive SQLite-Datei ersetzen oder überschreiben.
Keine Tokens/.env/Secrets in ZIPs aufnehmen.
Bestehende Transaktionen/Audit-Daten nicht löschen.
Module aktiv halten; Commands separat freigeben.
Multitexte über DB/Helper, dashboardfähig, CGN-/Altersheim-/Heimleitung-/Rentner-Stil.
EventBus/Communication Bus und Heartbeats berücksichtigen.
Bei Tests nur notwendige Felder ausgeben.
Nach jedem Code-/Doku-STEP stepdone.cmd ausführen.
```
