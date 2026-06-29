# TODO

## Aktiv

- [ ] `RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE` lokal einspielen.
- [ ] Pruefen: `START_HERE_FOR_NEW_CHAT.md` zeigt aktuellen Stand 0.2.32.
- [ ] Pruefen: `docs/current/RDAP_0.2.32_MEDIA_PERSISTENT_INDEX_FOUNDATION_PLAN_NO_CODE.md` vorhanden.
- [ ] Pruefen: `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `FILES.md`, `CHANGELOG.md` aktualisiert.
- [ ] Pruefen: keine Runtime-Dateien geaendert.
- [ ] Pruefen: keine neuen Runtime-Dateien enthalten.
- [ ] Pruefen: keine DB-Migration enthalten.
- [ ] Wenn sauber: `stepdone.cmd`.

## Ergebnis 0.2.32

- [x] Persistent-Index-Zielbild geplant.
- [x] Wahrscheinliche DB-Migration als eigener spaeterer Step markiert.
- [x] Bestehende Datei-Verantwortung fuer spaeteren Code beschrieben.
- [x] Neue Runtime-Dateien weiter blockiert.
- [x] UI-/i18n-Befund aus Screenshot aufgenommen.
- [x] Persistent-Index-Code weiter blockiert, bis eigener Migration-/Foundation-Step bestaetigt ist.

## Naechster No-Code-Plan

- [ ] Entscheiden: zuerst UI/i18n-Fix-Plan oder Persistent-Index-Migration-Plan.
- [ ] Fuer UI/i18n-Fix betroffene UI-/Language-Dateien aus GitHub/dev lesen.
- [ ] Falls Connector abgeschnitten ist: Source-Sammel-Script liefern.
- [ ] UI/i18n-Fix nicht mit DB-/Persistent-Index-Code vermischen.

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
