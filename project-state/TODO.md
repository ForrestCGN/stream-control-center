# TODO

## Aktiv

- [ ] `RDAP_0.2.27B_MEDIA_SYNC_COMPACT_FRAME_FIX` lokal einspielen.
- [ ] Lokale Syntaxchecks ausfuehren.
- [ ] Lokal Media-Inventar weiterhin aktiv pruefen.
- [ ] Agent-Verbindung online pruefen.
- [ ] Pruefen, dass Agent nach Media-Sync verbunden bleibt.
- [ ] Online Media-Inventar nach Slow-Sync pruefen.
- [ ] Pruefen: kein `agent_payload_too_large_64bit_frame` mehr.
- [ ] Pruefen: upload/edit/delete bleiben false.
- [ ] Pruefen: keine absoluten Pfade in Online-Response.
- [ ] Wenn sauber: `stepdone.cmd`.

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
