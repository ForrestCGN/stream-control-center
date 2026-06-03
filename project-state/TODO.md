# TODO

## CAN-42

- [x] CAN-42.0 Zentrale Admin-Diagnose konzipieren.
- [x] CAN-42.1 Admin Diagnose Grundseite bauen.
- [x] CAN-42.1b Admin Diagnose Routenliste aus Detailansicht entfernen.
- [x] CAN-42.2 Diagnose-Standard definieren.
- [x] CAN-42.3 Modul-Diagnose-/Hinweis-Inventar erstellen.
- [x] CAN-42.4 Todo-Diagnosewerte zentral in Admin > Diagnose abbilden.
- [x] CAN-42.4b Admin Diagnose Ampelübersicht bauen.
- [x] CAN-42.4c Admin Diagnose Statusmapping korrigieren.
- [x] CAN-42.4d Todo Integration-Mapping final korrigieren.
- [x] CAN-42.4e Modultabelle an Ampelstatus angleichen.
- [x] CAN-42.5 Todo-Diagnose-Tab aus Todo-Modul entfernen/deaktivieren.
- [x] CAN-42.5b Todo Detailwerte in Admin-Diagnose korrekt mappen.
- [x] CAN-42.5c Todo integration-check Rohdaten und Counts korrekt anzeigen.
- [x] CAN-42.6 Todo /status um diagnostics-Block erweitern.
- [ ] CAN-42.7 Admin-Diagnose liest Todo diagnostics-Block bevorzugt.

## Diagnose-Standard für alle Module

- [ ] Alle Module prüfen, ob sie einen standardisierten `diagnostics`-Block liefern.
- [ ] Alle Module nach und nach an den Diagnose-Standard angleichen.
- [ ] Pro Modul prüfen, welche alten Diagnose-/Hinweis-Extensions noch direkt in Modul-Seiten eingebunden sind.
- [ ] Alte Diagnose-Module/-Extensions aus den Modul-Seiten entfernen/deaktivieren, sobald die zentrale Diagnose die Informationen abbildet.
- [ ] Keine Modul-Funktionalität entfernen; nur Diagnose-/Hinweis-Doppelungen bereinigen.
- [ ] Status-Endpunkte nur ergänzen/standardisieren, keine bestehenden Routen brechen.
- [ ] Admin > Diagnose als zentrale Übersicht weiter ausbauen.

## Bereits begonnen

- [x] Todo liefert seit CAN-42.6 einen `diagnostics`-Block in `GET /api/todo/status`.
- [x] Todo-Diagnose-Tab wurde aus der Todo-Modulseite deaktiviert.
- [x] VIP-System als späteres ToDo markiert: `GET /api/vip/status` ergänzen.

## Nächste Module für Standardisierung

- [ ] Tagebuch: `/api/tagebuch/status` auf diagnostics-Standard prüfen/angleichen.
- [ ] Commands: `/api/commands/status` auf diagnostics-Standard prüfen/angleichen.
- [ ] Hug: `/api/hug/status` auf diagnostics-Standard prüfen/angleichen.
- [ ] Message-Rotator: `/api/message-rotator/status` auf diagnostics-Standard prüfen/angleichen.
- [ ] Overlay-Monitor: Status/Safety-Hinweise prüfen und zentralisieren.
- [ ] Bus-Diagnose: Sonderfall Admin; später in zentrale Diagnose integrieren oder sauber verlinken.
- [ ] VIP-System: `GET /api/vip/status` ergänzen.

## Weiterhin nicht machen ohne separaten Go-Schritt

- [ ] Keine produktiven Aktionen auslösen.
- [ ] Keine Backend-Routen entfernen.
- [ ] Keine DB-Migration.
- [ ] Keine Dashboard-Testbuttons für produktive Aktionen.
- [ ] Keine Funktionalität entfernen.
