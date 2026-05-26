# TODO

Stand: 2026-05-26 / STEP490

## Kanalpunkte-System

- [x] `channelpoints.js` als neues Fachmodul erstellen.
- [x] Modulversion und Meta sauber setzen.
- [x] `/api/channelpoints/status` erstellen.
- [x] Bus-Registrierung über `registerModule` nutzen.
- [x] Status/Heartbeat über Bus veröffentlichen.
- [x] Datenmodell-Plan für Kategorien/Rewards/Redemptions ergänzen.
- [x] Media-Regel dokumentieren: bestehendes `media.js`/Upload-Maske nutzen.
- [ ] DB-Migration für Kategorien/Rewards/Redemptions vorbereiten.
- [ ] Reward-Liste lokal read-only aus DB/API darstellen.
- [ ] Dashboard-Skeleton für Kanalpunkte erstellen.
- [ ] Media-Picker aus bestehendem Medien-System im Dashboard anbinden.
- [ ] Twitch Custom Rewards später über API lesen/synchronisieren.
- [ ] Deaktivieren muss später Twitch `is_enabled:false` setzen.
- [ ] Produktive Redemption-Verarbeitung später planen.
- [ ] Audit-Logging für Dashboard-/Reward-Änderungen einbinden.

## Communication Bus

- [x] Modul-zu-Modul-Contract nicht dauerhaft als separaten Helper führen.
- [x] Contract-Funktionen direkt in `helper_communication.js` integrieren.
- [x] Bestehende Bus-Funktionen erhalten.
- [x] In-Prozess-Subscriptions ergänzen.
- [x] Modul-Registrierung/Abmeldung/Heartbeat/Status ergänzen.
- [x] Subscriber-Fehler über `trackIssue` sichtbar machen.
- [x] Alte Communication-Routen nach STEP488 lokal testen.
- [ ] Prüfen/entfernen, ob STEP487-Datei `helper_communication_contract.js` noch lokal/live vorhanden ist.
- [ ] `communication_bus.js` coreVersion-Anzeige von `0.3.0` auf Helper-Core `0.4.0` nachziehen.
- [ ] Später echte produktive Module schrittweise und dokumentiert an den Bus anbinden.

## Architektur-Regel

- [x] Vorhandene Module/Helper bevorzugen.
- [x] Keine neue dauerhafte Parallelstruktur für den Bus.
- [x] Neue Module dokumentieren.
- [ ] Neue Module nur erstellen, wenn es wirklich eine neue fachliche Zuständigkeit ist.
- [ ] Keine Funktionalität entfernen.
- [ ] Doku nach jedem Modul-STEP aktualisieren.
