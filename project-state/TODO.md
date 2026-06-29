# TODO

## Aktiv

- [ ] Naechsten Step `RDAP_0.2.27_MEDIA_AGENT_SLOW_SYNC_READONLY` planen.
- [ ] Vor 0.2.27 echte GitHub/dev-Dateien lesen.
- [ ] Media-Agent-Sync als Slow-Sync innerhalb des fachlichen Moduls `Media` bauen, nicht als neues Technikmodul.
- [ ] Fuer Media-Sync eigenes Protokoll verwenden, nicht OBS-Inventory-Protokoll missbrauchen.
- [ ] Online-Media-Status aus Webserver-Memory-Cache anzeigen, sobald Agent-Daten vorliegen.

## Immer beachten

- [ ] Eine UI, zwei Runtime-Profile beibehalten.
- [ ] Keine lokale UI-Fork bauen.
- [ ] Keine Online-Sonder-UI bauen.
- [ ] Module fachlich buendeln.
- [ ] Gleiche Funktionen im gleichen Modul lassen.
- [ ] Sync/Agent/Cache nicht als Navigationsmodule bauen.
- [ ] Jede neue Funktion mit User-/Rollen-/Permission-Modell planen.
- [ ] UI-Aktionen nur aktivieren, wenn Backend-Enforcement existiert.

## Tests fuer 0.2.27 vorbereiten

- [ ] Lokal Media-Inventar weiterhin aktiv pruefen.
- [ ] Agent-Verbindung online pruefen.
- [ ] Online Media-Inventar nach Slow-Sync pruefen.
- [ ] Counts lokal/online plausibel vergleichen.
- [ ] Pruefen: upload/edit/delete bleiben false.
- [ ] Pruefen: keine absoluten Pfade in Online-Response.
- [ ] Pruefen: Payload-Limit/Truncated bleibt stabil.
