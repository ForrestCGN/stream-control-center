# TODO

## Aktiv

- [ ] `RDAP_0.2.28_MEDIA_AGENT_SLOW_SYNC_STATUS_POLISH_READONLY` lokal einspielen.
- [ ] Lokale Syntaxchecks ausfuehren.
- [ ] Lokale Media-Seite Sichttest.
- [ ] Online Media-Seite Sichttest nach Deploy.
- [ ] Online Status pruefen: Agent-Sync aktiv, memoryOnly=true, serverPersistence=false.
- [ ] Pruefen: truncated=true wird verstaendlich angezeigt.
- [ ] Pruefen: upload/edit/delete bleiben false.
- [ ] Pruefen: keine absoluten Pfade in Online-Response.
- [ ] Wenn sauber: `stepdone.cmd`.

## Danach planen

- [ ] `RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN` vorbereiten.
- [ ] Persistenten Media-Index nur als Metadaten-Cache planen, keine Datei-Inhalte.
- [ ] Lokal bleibt Master/Wahrheit fuer produktive Media-Dateien.
- [ ] Bidirektionale Aenderungen nur spaeter mit Permission, Confirm, Audit, Conflict-Handling und Agent-Apply-Queue planen.

## Immer beachten

- [ ] Eine UI, zwei Runtime-Profile beibehalten.
- [ ] Keine lokale UI-Fork bauen.
- [ ] Keine Online-Sonder-UI bauen.
- [ ] Module fachlich buendeln.
- [ ] Gleiche Funktionen im gleichen Modul lassen.
- [ ] Sync/Agent/Cache nicht als Navigationsmodule bauen.
- [ ] Jede neue Funktion mit User-/Rollen-/Permission-Modell planen.
- [ ] UI-Aktionen nur aktivieren, wenn Backend-Enforcement existiert.

## Standard-Arbeitsweise

- [ ] Wenn GitHub/dev ueber Connector unvollstaendig/abgeschnitten ist: Source-Sammel-Script liefern.
- [ ] Source-ZIP vom Nutzer als Quellmaterial nutzen.
- [ ] Source-ZIP nie als Install-ZIP behandeln.
- [ ] Echten Install-ZIP erst nach bestaetigtem Plan/Go und mit echten Zielpfaden bauen.
- [ ] Check-Ausgaben standardmaessig kurz halten; volles JSON nur bei Diagnose.
