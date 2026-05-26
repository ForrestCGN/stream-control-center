# TODO

Stand: 2026-05-26 / STEP491

## Kanalpunkte-System

- [x] `channelpoints.js` als neues Fachmodul erstellen.
- [x] Modulversion und Meta sauber setzen.
- [x] `/api/channelpoints/status` erstellen.
- [x] Bus-Registrierung ueber `registerModule` nutzen.
- [x] Status/Heartbeat ueber Bus veroeffentlichen.
- [x] Datenmodell als Planroute bereitstellen.
- [x] Media-Plan ueber bestehendes Media-System festlegen.
- [x] Schema-Preview ohne DB-Schreibzugriff bereitstellen.
- [ ] Echte additive DB-Migration erst nach explizitem Go.
- [ ] Statusroute spaeter um echte DB-Counts erweitern.
- [ ] Twitch Custom Rewards spaeter lesen/synchronisieren.
- [ ] Deaktivieren muss spaeter Twitch `is_enabled:false` setzen.
- [ ] Dashboard mit Kategorien, Sortierung, Aktiv/Inaktiv, Sync und Test vorbereiten.

## Media-Regel

- [x] Keine zweite Upload-Struktur fuer Kanalpunkte.
- [x] Bestehendes `media.js` und bestehende Dashboard-Media-Picker/Upload-Maske nutzen.
- [ ] Spaeter Reward-Felder im Dashboard an Media-Picker anbinden.

## Communication Bus

- [x] Kanalpunkte-Modul am Bus registriert.
- [x] Selftest-Subscription funktioniert.
- [x] Capability `channelpoints.schema` ergaenzt.
- [ ] Spaeter Reward-Ausfuehrung bevorzugt ueber Bus-Events planen.

## Cleanup

- [ ] Live-Ueberbleibsel `helper_communication_contract.js` entfernen, falls noch vorhanden.
