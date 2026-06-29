# TODO

## Aktiv

- [ ] `RDAP_0.2.29_MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN` lokal einspielen.
- [ ] Pruefen: Doku-Datei `docs/current/MEDIA_PERSISTENT_INDEX_CACHE_READONLY_PLAN_0.2.29.md` vorhanden.
- [ ] Pruefen: `START_HERE_FOR_NEW_CHAT.md` zeigt aktuellen Stand 0.2.29.
- [ ] Pruefen: `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `FILES.md`, `CHANGELOG.md` aktualisiert.
- [ ] Pruefen: keine Runtime-Dateien geaendert.
- [ ] Pruefen: keine DB-Migration enthalten.
- [ ] Wenn sauber: `stepdone.cmd`.

## Naechster Code-Plan

- [ ] Fuer `0.2.30` echte DB-/Storage-/Service-Dateien aus GitHub/dev lesen.
- [ ] Vor Code entscheiden: vorhandene Projekt-DB/Helper bevorzugen oder Alternative sauber begruenden.
- [ ] Persistent Index nur metadata-only und read-only planen.
- [ ] Keine Datei-Inhalte und keine absoluten Pfade speichern.
- [ ] Lokal bleibt Master.

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
