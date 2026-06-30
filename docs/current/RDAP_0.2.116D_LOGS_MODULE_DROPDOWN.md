# RDAP 0.2.116D - Logs Module Dropdown

## Ziel

Audit-Ansicht als allgemeine Logs-Seite vorbereiten.

## Aenderung

```text
Seite: Logs
Dropdown: Log-Bereich
```

Aktuelle Bereiche:

```text
Alle Logs
Media-System
Admin-Notizen
System / RDAP
Locks / Schutz
Weitere Module spaeter
```

## Technik

```text
nur UI-Filter
kein Backend
keine neue DB-Route
keine Writes
```

Die Dropdown-Auswahl nutzt vorhandene Filter der bestehenden read-only API.

## Spaeter erweiterbar

```text
User-Verwaltung
OBS
Sounds
Overlays
Agent / Stream-PC
Auth / Login
```

## Grenzen

```text
keine Writes
keine Loeschung
keine Migration
keine Selbstbereinigung
keine Agent-Actions
```
