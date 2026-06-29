# TODO

## Aktiv

- [ ] `RDAP_0.2.30_STOP_AND_INVENTORY_NO_CODE` lokal einspielen.
- [ ] Pruefen: `START_HERE_FOR_NEW_CHAT.md` zeigt aktuellen Stand 0.2.30 Stop and Inventory No Code.
- [ ] Pruefen: `CURRENT_STATUS.md`, `NEXT_STEPS.md`, `FILES.md`, `CHANGELOG.md` aktualisiert.
- [ ] Pruefen: keine Runtime-Dateien geaendert.
- [ ] Pruefen: keine neuen Runtime-Dateien enthalten.
- [ ] Pruefen: keine DB-Migration enthalten.
- [ ] Wenn sauber: `stepdone.cmd`.

## Naechster No-Code-Plan

- [ ] Fuer den naechsten Step echte 8080-/3010-Dateien aus GitHub/dev oder Source-ZIP lesen.
- [ ] Datei-/Modulkarte erstellen: lokal 8080.
- [ ] Datei-/Modulkarte erstellen: Server/RDAP 3010.
- [ ] Doppelte Media-Logik markieren.
- [ ] Altlasten/Plan-Dateien markieren.
- [ ] Festlegen, welche bestehende Datei spaeter ueberhaupt geaendert werden darf.
- [ ] Neue Runtime-Dateien standardmaessig blockieren, ausser Forrest genehmigt sie ausdruecklich.

## Spaeterer Code-Plan, erst nach Inventory

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
