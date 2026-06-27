# CURRENT_CHAT_HANDOFF – LC-CORE-LIVE-CLEANUP-2

Stand: 2026-06-16

## Kontext

Projekt: `ForrestCGN/stream-control-center`
Branch: `dev`
Live-Ziel: `D:\Streaming\stramAssets`
Lokales Repo: `D:\Git\stream-control-center`
Backend: `http://127.0.0.1:8080`
Produktive DB: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Wichtigste Regeln

```text
Keine produktive SQLite ersetzen/löschen/neu bauen.
Keine Funktionalität entfernen.
Bestehende Helper/Bus/DB-Patterns verwenden.
Keine parallelen Systeme bauen.
Bei größeren Schritten ZIP mit echten Zielpfaden liefern.
```

## Abgeschlossener Stand

```text
LC-CORE-LIVE-CLEANUP-2 – Live-only geprüft
```

Bestätigt:

```text
/api/loyalty/status:
  version = 0.1.24
  mode = live
  enabled = true
  shadowMode = false

/api/loyalty/balance/urlug:
  balanceShadow = 0
  balanceLive = 1006852
  activeBalance = 1006852

/api/loyalty/balance/tronic6:
  balanceShadow = 0
  balanceLive = 12536
  activeBalance = 12536

Migrationstool-Dry-Run:
  candidates=0 totalShadow=0
  excluded=0 excludedShadow=0
```

## Durchgeführte Migration

```text
Normale User: Shadow-Punkte nach Live migriert.
Test-/Bridge-/Diagnose-User: von Migration ausgeschlossen.
Ignored/System-Reste: nicht nach Live gebucht.
Rest-Shadow: gezielt auf 0 gesetzt.
```

Zahlen:

```text
migrated = 468
amount = 69116
failed_ignored_by_api = 4
Rest-Clear = 40 User / 10064 Kekskrümel
Abschluss = 0 Shadow-User / 0 Shadow-Summe
```

## Fachliche Betriebslogik ab jetzt

```text
Aktiv   = live
Inaktiv = off
Shadow  = beendet / nicht mehr produktiv genutzt
```

`shadowMode` bleibt vorerst als Kompatibilitätsfeld erhalten, ist aber `false`.

## Offene Tests

Raffle-Teilnahmekosten:

```text
entryCostAmount=0 -> kostenloser Join
entryCostAmount>0 + genug Punkte -> Abzug + Teilnahme
entryCostAmount>0 + zu wenig Punkte -> keine Teilnahme + Text
Doppeljoin -> keine zweite Abbuchung
Cancel -> Refund
normaler Abschluss -> Auszahlung ohne Refund
```

## Nächster empfohlener Step

```text
LC-MINIGAMES-2B Kosten-Live-Test abschließen
```

Danach:

```text
LC-CORE-LIVE-CLEANUP-3 planen:
- alte Shadow-/Import-Begriffe in Status/Dashboard/Doku prüfen
- streamElementsStillActive/importStatus fachlich bewerten
- API-Kompatibilität erhalten
- DB-Schema-Cleanup für Shadow-Spalten nur nach vollständiger Referenzprüfung
```

## Relevante Dateien

```text
backend/modules/loyalty.js
htdocs/dashboard/modules/loyalty.js
backend/modules/loyalty_giveaways.js
htdocs/dashboard/modules/loyalty_games.js
tools/loyalty_migrate_shadow_to_live_once.js
docs/current/CURRENT_STATUS.md
docs/current/TODO.md
docs/current/NEXT_STEPS.md
docs/current/CHANGELOG.md
docs/current/FILES.md
docs/modules/loyalty.md
```
