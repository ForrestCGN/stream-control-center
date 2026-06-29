# NEXT STEPS

## Naechster sinnvoller funktionaler Step

```text
RDAP_0.2.52_REMOTE_AND_LOCAL_MEDIA_SEARCH_SORT_PAGING
```

## Ziel

```text
Media-Inventar fuer Mods besser bedienbar machen.
```

## Moegliche Inhalte

```text
- Suche nach Dateiname.
- Sortierung nach Name.
- Sortierung nach Bereich.
- Sortierung nach Groesse.
- Sortierung nach Geaendert.
- Anzeige-Begrenzung oder Paging, z.B. 50 pro Seite.
- Filter beibehalten.
- Neu laden beibehalten.
```

## Zu pruefende Dateien

```text
remote-modboard/backend/public/assets/modules/media/library.js
htdocs/dashboard-v2/assets/modules/media/library.js
remote-modboard/backend/public/assets/modules/module-manifest.js
htdocs/dashboard-v2/assets/modules/module-manifest.js
```

## Grenzen

```text
Keine Backend-Write-Routen.
Keine neue API, wenn nicht noetig.
Kein neuer Endpoint, wenn nicht noetig.
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
