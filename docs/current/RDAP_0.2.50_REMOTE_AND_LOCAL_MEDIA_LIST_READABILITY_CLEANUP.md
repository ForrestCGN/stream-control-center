# RDAP 0.2.50 - Remote and Local Media List Readability Cleanup

## Ziel

Medienliste fuer Mods lesbar machen.

## Geaendert

```text
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
```

## Ergebnis

```text
- Tabelle durch lesbare Karten-/Listenansicht ersetzt.
- Dateiname steht klar sichtbar.
- Relativer Pfad ist kleiner und dezent.
- Bereich, Groesse und Änderungsdatum stehen als Chips rechts.
- Lange Namen brechen sauber um.
- Mobile/enge Ansicht stapelt Meta-Chips unter den Namen.
- Filter und Neu laden bleiben erhalten.
```

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
