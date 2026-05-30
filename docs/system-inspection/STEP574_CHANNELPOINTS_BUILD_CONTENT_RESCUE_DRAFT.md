# STEP574 - Channelpoints Build Content Rescue Draft

Version: 0.1.0  
Stand: 2026-05-30

## Ziel

STEP574 sichert die relevanten Inhalte aus Batch E in einer aktiven Konsolidierungsdatei.

## Quellen

```text
project-state/STEP484_CHANNELPOINTS_REWARDS_READONLY_SYNC.md
project-state/STEP489_CHANNELPOINTS_BACKEND_SKELETON.md
project-state/STEP490_CHANNELPOINTS_MODEL_AND_MEDIA_PLAN.md
project-state/STEP491_CHANNELPOINTS_DB_SCHEMA_PREP.md
project-state/STEP492_CHANNELPOINTS_DB_MIGRATION_SAFE.md
project-state/STEP493_CHANNELPOINTS_LOCAL_REWARD_CRUD.md
project-state/STEP494_CHANNELPOINTS_DASHBOARD_BASE.md
```

## Neue aktive Datei

```text
docs/system-inspection/CHANNELPOINTS_BUILD_CONSOLIDATION.md
```

## Wichtigste Konsolidierung

```text
channelpoints.js ist zentrales Kanalpunkte-Hauptmodul.
channelpoints_twitch_readonly_sync.js ist additives Read-Only-Sync-Add-on.
Keine Twitch-Schreibaktionen.
Keine Twitch Reward Create/Update/Delete Calls.
Keine Redemption Status Updates.
DB nur additiv und sicher erweitern.
app.sqlite nie ersetzen.
Media ueber bestehendes Media-System.
Dashboard ueber vorhandene APIs.
Lokales Reward-CRUD ist lokal-only.
```

## Ergebnis

Die Channelpoints-Build-Regeln sind jetzt aktiv gesichert:

```text
- Hauptmodul / Add-on-Aufteilung
- Read-Only-Twitch-Sync
- DB-Regeln / Tabellen / sichere Migration
- Media-Regel
- Dashboard-Basis
- lokale Reward-Verwaltung
- Routen
- EventBus-Events
- Test-/Pruefregeln
```

## Nicht geändert

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
.env
secrets/**
Tokens
```

## Nächster Schritt

```text
STEP575 - Channelpoints Build Archive Dry-Run
```
