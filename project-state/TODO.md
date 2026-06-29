# TODO

## Aktiv

- [ ] `RDAP_0.2.33_UI_I18N_MEDIA_LABELS_FIX_PLAN` lokal einspielen.
- [ ] Pruefen: `START_HERE_FOR_NEW_CHAT.md` zeigt aktuellen Stand 0.2.33.
- [ ] Pruefen: `docs/current/RDAP_0.2.33_UI_I18N_MEDIA_LABELS_FIX_PLAN.md` vorhanden.
- [ ] Pruefen: `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `FILES.md`, `CHANGELOG.md` aktualisiert.
- [ ] Pruefen: JS-Syntax der geaenderten UI-Dateien.
- [ ] Pruefen: lokale UI zeigt keine rohen Media-i18n-Keys.
- [ ] Pruefen: keine Backend-Routen geaendert.
- [ ] Pruefen: keine DB-Migration enthalten.
- [ ] Wenn sauber: `stepdone.cmd`.
- [ ] Danach Webserver-Deploy, weil Public-Assets betroffen sind.

## Ergebnis 0.2.33

- [x] Media-Sprachkeys in `de.js` ergaenzt.
- [x] Media-Sprachkeys in `en.js` ergaenzt.
- [x] Media-Modulregistrierung nutzt zentrale Keys plus Fallbacks.
- [x] Server-UI-Pfad und lokaler dashboard-v2-Pfad synchron gehalten.
- [x] Keine DB-/Persistent-Index-Aenderung.
- [x] Keine Agent-Aenderung.
- [x] Keine neue Runtime-Datei.

## Spaeterer Code-Plan, erst nach Plan + Go

- [ ] Fuer Persistent Index echte DB-/Storage-/Service-Dateien aus GitHub/dev lesen.
- [ ] Vor Code entscheiden: vorhandene Projekt-DB/Helper bevorzugen oder Alternative sauber begruenden.
- [ ] Persistent Index nur metadata-only und read-only planen.
- [ ] Keine Datei-Inhalte und keine absoluten Pfade speichern.
- [ ] Lokal bleibt Master.
- [ ] Migration nur als eigener ausdruecklich bestaetigter Foundation-Step.

## Immer beachten

- [ ] Eine UI, zwei Runtime-Profile beibehalten.
- [ ] Keine lokale UI-Fork bauen.
- [ ] Keine Online-Sonder-UI bauen.
- [ ] Module fachlich buendeln.
- [ ] Gleiche Funktionen im gleichen Modul lassen.
- [ ] Sync/Agent/Cache nicht als Navigationsmodule bauen.
- [ ] Jede neue Funktion mit User-/Rollen-/Permission-Modell planen.
- [ ] UI-Aktionen nur aktivieren, wenn Backend-Enforcement existiert.
- [ ] Keine neuen Runtime-Dateien ohne ausdrueckliche Freigabe.

## Standard-Arbeitsweise

- [ ] Wenn GitHub/dev ueber Connector unvollstaendig/abgeschnitten ist: Source-Sammel-Script liefern.
- [ ] Source-ZIP vom Nutzer als Quellmaterial nutzen.
- [ ] Source-ZIP nie als Install-ZIP behandeln.
- [ ] Echten Install-ZIP erst nach bestaetigtem Plan/Go und mit echten Zielpfaden bauen.
- [ ] Check-Ausgaben standardmaessig kurz halten; volles JSON nur bei Diagnose.
