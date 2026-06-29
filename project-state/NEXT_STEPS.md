# NEXT STEPS

## Naechster sinnvoller Step nach 0.2.52

```text
0.2.53 Media Metadata Konzept / sprechende Namen planen
```

## Ziel

```text
Medien spaeter fuer Mods mit sprechenden Namen, Kategorien, Tags oder kurzen Beschreibungen anzeigen koennen.
```

## Wichtig

```text
Das ist nicht mehr nur UI, sobald Daten gespeichert oder bearbeitet werden.
Vor produktiven Media-Metadaten braucht es einen separaten Scope:
- Datenquelle/Speicherung klaeren
- Auth pruefen
- Permission pruefen
- Confirm-Write einbauen
- Audit einbauen
- Lock/Readback/Test klaeren
- Backup/Rollback-Konzept klaeren
```

## Weiterhin offen / moeglich

```text
- Detailfenster optisch feiner machen.
- Optional Vorschau fuer Bilder/Sounds/Videos vorbereiten, read-only.
- Admin-/Diagnoseansicht fuer technische Media-Rohdaten spaeter trennen.
```

## Grenzen bleiben

```text
Keine Backend-Write-Routen ohne eigenen Scope.
Keine neue API ohne ausdruecklichen Grund.
Kein neuer Endpoint ohne ausdruecklichen Grund.
Keine DB-Item-Reads ohne eigenen Scope.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Fallback bleibt aus.
Writes bleiben aus.
```
