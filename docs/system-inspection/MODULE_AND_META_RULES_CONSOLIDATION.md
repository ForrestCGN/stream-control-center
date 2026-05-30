# MODULE_AND_META_RULES_CONSOLIDATION

Version: 0.1.0  
Stand: 2026-05-29  
Quelle: STEP476-STEP482 aus `project-state/`

## Zweck

Diese Datei konsolidiert die fachlich wichtigen Informationen aus Batch B:

```text
project-state/STEP476_MODULE_DOCS_CORE_HELPERS_DEEP_DIVE.md
project-state/STEP477_MODULE_DOCS_STREAM_MODULES_DEEP_DIVE.md
project-state/STEP478_MODULE_DOCS_INTEGRATIONS_COMMUNITY_DEEP_DIVE.md
project-state/STEP479_MODULE_DOCS_SECONDARY_MODULES_DEEP_DIVE.md
project-state/STEP480_PROMPT_MODULE_DOCS_VERSION_EVENTBUS_RULES.md
project-state/STEP481_SERVER_LOG_MODULE_META_RULES.md
project-state/STEP482_HANDOFF_DOCUMENTATION_UPDATE_RULE.md
```

Nach dieser Konsolidierung duerfen die alten STEP476-STEP482-Dateien spaeter per Dry-Run/Apply in ein Archiv verschoben werden.

Diese Datei ist Dokumentation. Sie aendert keine produktive Funktionalitaet.

## Konsolidierte Modul-Doku-Wellen

### STEP476 - Core Helper / Core Module Deep Dive

Dokumentierte Schwerpunkte:

```text
communication_bus
stream_status
Datenbank-Core / SQLite
Security / Audit
Helper-Uebersicht
Helper-Gruppendokus
```

Betroffene Doku-Bereiche:

```text
docs/modules/
docs/current/
project-state/
```

Wichtig:

```text
Kein Backend-Code
Kein Dashboard-Code
Kein Overlay-Code
Keine Config-Dateien
Keine Datenbank
```

### STEP477 - Stream-/Media-Module Deep Dive

Dokumentierte Schwerpunkte:

```text
clip-shoutout-vso
alerts
sound-system
vip-sound-overlay
clips
tts-system
```

Konsolidierte Regel:

```text
Stream-/Media-Module brauchen technische Modul-Doku mit Routen, Hauptfunktionen, Runtime-Dateien, Config-Bezuegen, Tests und offenen Punkten.
```

Wichtig:

```text
Keine Backend-Dateien
Keine Dashboard-Dateien
Keine Overlays
Keine Configs
Keine Datenbank
Keine Shoutout-Fachumsetzung
```

### STEP478 - Integrations- und Community-Module Deep Dive

Dokumentierte Schwerpunkte:

```text
twitch
twitch-presence
discord
obs
scene-control
tagebuch
todo
message-rotator
hug
birthday
```

Konsolidierte Regel:

```text
Integrations- und Community-Module brauchen Doku mit Routen, Funktionen, Tabellen, Abhaengigkeiten, Risiken und Tests.
```

Wichtig:

```text
Kein Backend-Code
Kein Dashboard-Code
Kein Overlay-Code
Keine Config-Dateien
Keine Datenbankdateien
Keine Runtime-Dateien
Keine Shoutout-Funktionalitaet
```

### STEP479 - Sekundaere Module Deep Dive

Dokumentierte Schwerpunkte:

```text
kleinere, sekundaere und ergaenzende Backend-Module
docs/modules/secondary-modules-deep-dive-overview.md
docs/modules/README.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
```

Konsolidierte Regel:

```text
Auch kleinere Module duerfen nicht als Nebensache behandelt werden. Sie muessen im Doku-Index auffindbar sein und bei Aenderungen mitgepflegt werden.
```

## Konsolidierte Arbeitsregeln

### Modul-Doku zuerst pruefen

Vor Modul-Aenderungen gilt:

```text
1. realen Dateistand pruefen
2. passende docs/modules/*-Doku pruefen
3. keine erfundenen Helper/Module/Parallelstrukturen annehmen
4. bestehende Helper und Modulkontrakte bevorzugen
5. nach Aenderungen passende Doku aktualisieren
```

### Modul-Versionen und STEP-Nummern

Konsolidierte Regel:

```text
Neue/geaenderte Module sollen version/moduleVersion nutzen.
STEP-Nummern bleiben Projekt-/Doku-/ZIP-Kennzeichnung.
```

Das bedeutet:

```text
- Modulversion beschreibt technische Modul-/Feature-Version
- STEP-Nummer beschreibt Arbeits-/Uebergabe-/Doku-Schritt
- beide nicht vermischen
```

### EventBus-Zielbild

Der EventBus soll schrittweise Kommunikations- und Monitoring-Schicht werden.

Module sollen perspektivisch melden koennen:

```text
Start
Stop
Status
Health
Heartbeat
Fehler
Warnungen
Queue-Zustaende
Runtime-Zustaende
```

Wichtige Sicherheitsregel:

```text
Bestehende produktive Flows duerfen nicht ungeprueft ersetzt werden.
```

Der Bus ist Zielarchitektur und Diagnose-/Status-Layer, aber keine Ausrede fuer riskante Umbauten.

### Node-Server-Log / Modul-Meta-Regel

Der Node-Server soll beim Start pro Modul kompakt und nachvollziehbar loggen:

```text
[module] loading: <file>
[module] loaded: <name> v<version> routePrefix=<prefix> status=ok
[module] skipped: <file> reason=<reason>
[module] failed: <file> error=<message>
[server] modules loaded: <ok> ok, <skipped> skipped, <failed> failed
```

Vor einer Umsetzung zuerst pruefen:

```text
backend/server.js
backend/modules/communication_bus.js
vorhandene Modul-Exports
vorhandene Versionsmuster
```

### Handoff-Regel: „dokumentieren und aktualisieren"

Wenn Forrest vor einem Chatwechsel sagt:

```text
dokumentieren und aktualisieren
```

ist das ein verbindlicher Konsolidierungsauftrag.

Dann muessen geprueft/aktualisiert werden:

```text
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/GENERAL_PROJECT_PROMPT.md
betroffene docs/current/*.md
betroffene docs/modules/*.md
aktuellste MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

Ziel:

```text
keine veraltete Doku beim Chatwechsel
keine verlorenen offenen Punkte
keine Parallelstaende
naechster Chat kann sauber weiterarbeiten
```

## Archivierungsfreigabe nach Konsolidierung

STEP476-STEP482 duerfen erst archiviert werden, wenn:

```text
- diese Konsolidierungsdatei im Repo committed ist
- STEP559 committed ist
- Dry-Run fuer Archivierung 0 Fehler liefert
- Archivziel frei ist
- Core-/Current-Dateien unveraendert aktiv bleiben
```

Geplanter Archivordner:

```text
project-state/archive/2026-05-29-step558-module-meta-rules/
```

## Keine Funktionalitaet entfernen

Diese Konsolidierung betrifft nur Dokumentation.

Nicht geaendert:

```text
backend/**
htdocs/**
config/**
data/**
SQLite
Dashboard-Code
Overlay-Code
Runtime-Dateien
```
