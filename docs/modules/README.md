# Module-Dokumentation

Stand: 2026-06-11

## Aktueller bestätigter Bereich

```text
STEP211 / LWG-5.3 – Dokumentation und Handoff für Loyalty Safety + Gamble Prepared
```

Dieser Dokumentationsstand ergänzt den getesteten Runtime-Stand:

```text
STEP209 / LWG-5.1 – Loyalty Safety Layer + Gamble vorbereitet
STEP210 / LWG-5.2 – API-/Status-Cleanup
```

## Relevante Loyalty-Module

```text
backend/modules/loyalty.js
backend/modules/loyalty_games.js
backend/modules/loyalty_games/gamble.js
backend/modules/loyalty_giveaways.js
```

## Verbindliche Regeln für weitere Loyalty-Arbeit

```text
- Keine Funktionalität entfernen.
- Module bleiben aktiv/online; Chat-Commands werden separat aktiviert/deaktiviert.
- Datenbank-first: SQLite aktuell, MySQL/MariaDB-portabel mitdenken.
- Keine JSON-only-Fachlogik für editierbare Settings/Texte.
- Multitexte über DB/Helper im CGN-/Altersheim-/Heimleitung-/Rentner-Stil.
- Punktebuchungen nur über zentrale Safety-Funktionen.
- Keine negativen verfügbaren Kekskrümel durch Spiele/Commands.
- Zufallsergebnisse backendseitig und nicht vorhersagbar, bevorzugt crypto.randomInt.
- EventBus/Communication Bus und Heartbeats weiter nutzen.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
```

## Modul-Dokus

```text
docs/modules/loyalty.md
docs/modules/loyalty_games.md
docs/modules/loyalty_giveaways.md
```

## Nächste technische Arbeit

```text
STEP212 / LWG-5.4 – Points Command Runtime kontrolliert testen/freigeben
```

Zuerst weiterhin nur kleine, gezielte PowerShell-Ausgaben nutzen.


## STEP212a / LWG-5.4a – Points Runtime Testscript Parserfix

```text
Stand: 2026-06-11
Typ: Testscript-/Doku-Hotfix
Runtime: unverändert
Grund: PowerShell-Parserfehler bei String mit $Enabled: behoben durch $($Enabled):
```
