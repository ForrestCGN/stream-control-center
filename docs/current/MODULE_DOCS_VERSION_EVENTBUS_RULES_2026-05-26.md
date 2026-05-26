# Modul-Doku-, Versions- und EventBus-Regeln

Stand: 2026-05-26  
STEP: 480  
Typ: Doku-/Regelwerks-Cleanup

## Zweck

Diese Datei ergänzt `project-state/GENERAL_PROJECT_PROMPT.md` und `docs/current/PROJECT_WORKING_RULES.md`.

Ziel ist, dass neue Chats und spätere STEPs die neu angelegten Modul-Dokus nicht ignorieren, sondern als Pflichtquelle verwenden und aktuell halten.

## Verbindliche Modul-Doku-Regel

Vor Arbeiten an einem Modul sind zu prüfen:

```text
docs/modules/README.md
docs/modules/<passende-modul-doku>.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md
```

Wenn eine passende Modul-Doku fehlt oder veraltet ist, muss sie im selben STEP ergänzt oder korrigiert werden.

## Pflichtinhalte einer Modul-Doku

```text
Zweck
Dateien
Version / moduleVersion
API-Routen
Exporte / Init-Funktionen
interne Hauptfunktionen
Config-Dateien / Env-Werte
Datenbanktabellen
Runtime-Dateien
WebSocket / EventBus / Events
Dashboard-Anbindung
Overlay-Anbindung
Abhängigkeiten
Status-/State-Felder
Risiken / Altlasten
Tests
offene Punkte
```

## Aktualisierungspflicht

Eine Moduländerung ist erst vollständig abgeschlossen, wenn die zugehörige Doku aktualisiert ist.

Das betrifft besonders:

```text
neue/geänderte Routen
neue/geänderte Configs
neue/geänderte Datenbanktabellen
neue/geänderte Statusfelder
neue/geänderte EventBus-Events
neue/geänderte Dashboard-Dateien
neue/geänderte Overlay-Dateien
neue/geänderte Runtime-Dateien
```

## Versionsnummern

Neue oder angefasste Module sollen eine klare technische Versionsnummer verwenden.

Bevorzugt:

```text
moduleVersion: "x.y.z"
```

oder:

```text
const MODULE_VERSION = "x.y.z";
```

STEP-Nummern bleiben nur für Projektverlauf, ZIPs und Doku. Sie sollen nicht als dauerhafte Runtime-Version verwendet werden.

## EventBus-Zielbild

Der Communication Bus / EventBus soll schrittweise zur zentralen Kommunikations- und Überwachungsschicht werden.

Perspektivisch sollen Module:

```text
sich beim Start anmelden
sich beim Stop/Shutdown abmelden, soweit technisch möglich
Statusberichte senden
Health-/Heartbeat-/Diagnose-Daten melden
Fehler/Warnungen zentral sichtbar machen
Queue-/Runtime-Zustände melden
```

Der Bus darf bestehende produktive Flows nicht ungeprüft ersetzen. Erst ergänzen, beobachten, testen und dokumentieren; danach kann über produktive Umstellung entschieden werden.

## Doku bei EventBus-Anbindung

Jede Bus-Anbindung muss in der passenden Modul-Doku enthalten:

```text
Channel / Action
Payload-Felder
Auslöser
Verbraucher / Empfänger
Fehlerverhalten
Status-/Health-Felder
Tests
```

## Offene Folgearbeit

Die bestehenden Modul-Dokus sind eine gute Basis, müssen aber bei echten Moduländerungen weiter verfeinert werden. Besonders wichtig sind später:

```text
konkrete EventBus-Konventionen
einheitliche moduleVersion-Ausgabe in Status-Routen
zentrale Bus-/Health-Übersicht im Dashboard
saubere Trennung von Legacy-Status und Bus-Status
```
