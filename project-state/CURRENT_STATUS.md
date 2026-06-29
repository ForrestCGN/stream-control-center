# CURRENT STATUS

Aktueller Arbeitsstand: `0.2.52 - Media Mod Usable List`.

## Kurzstatus

```text
0.2.52 ist ein reiner UI-/Read-only-Step fuer die Media-Liste.
Online- und lokale Media-Library bleiben synchron.
Die Media-Liste ist fuer Mods besser bedienbar:
- kompaktere Karten
- Typ/Bereich sichtbarer
- Suche
- Sortierung
- Paging mit 50 Eintraegen pro Seite
- Info-Fenster pro Medium fuer technische Details
```

## Bestaetigter Vorstand

```text
0.2.50 ist funktional abgeschlossen.
Online- und lokale Media-Library sind synchron.
Media-Mod-Ansicht ist enttechnisiert.
Medienliste ist als Karten-/Listenansicht umgesetzt.
Filter und Neu laden bleiben erhalten.
Upload/Edit/Delete bleiben deaktiviert.
Server-API /api/remote/media/status funktioniert weiterhin.
```

## Wichtige Pfadregel

```text
Online / Remote:
remote-modboard/backend/public/...

Offline / Lokal:
htdocs/dashboard-v2/...
```

Bei UI-Features, die lokal und online gelten sollen, beide Pfade pruefen und ggf. beide Dateien aendern.

## Sicherheitsgrenzen

```text
Keine Backend-Write-Routen.
Keine neue API.
Kein neuer Endpoint.
Keine DB-Item-Reads.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Fallback bleibt aus.
Writes bleiben aus.
```

## Bekannte Einschraenkung

```text
Es gibt aktuell keine echten sprechenden Media-Anzeigenamen.
Die UI muss deshalb weiterhin Dateiname/relativePath als Basis verwenden.
Sprechende Namen, Kategorien, Tags oder Beschreibungen brauchen spaeter einen eigenen Metadata-/Write-Scope mit Auth, Permission, Confirm-Write, Audit und Readback.
```
