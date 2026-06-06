# TODO – VIP30 / 30TageVIP

Stand: 2026-06-06 08:55 UTC

## Erledigt in STEP8.7 / STEP8.7.1

- [x] Keine Patch-Skripte verwenden
- [x] `/api/_status` geprüft
- [x] Live-System `D:\Streaming\stramAssets` bestätigt
- [x] Repo `D:\Git\stream-control-center` bestätigt
- [x] Live vs Repo für `backend/modules/twitch.js` geprüft
- [x] Live vs Repo für `backend/modules/vip30.js` geprüft
- [x] Routing-Konflikt bei `/api/twitch/eventsub/status` gefunden
- [x] Routing-Konflikt per vollständiger Ersatzdatei behoben
- [x] `node -c backend\modules\twitch.js` geprüft
- [x] `stepdone.cmd` vor Live-Test ausgeführt
- [x] Node neu gestartet
- [x] EventSub-Status geprüft:
  - [x] `vipEventBus.configured = True`
  - [x] `knownRemove = True`
  - [x] `knownAdd = True`
  - [x] `channel.vip.add`
  - [x] `channel.vip.remove`
- [x] Echter Twitch-Test mit manuellem VIP-Entzug
- [x] `akighosty` wurde automatisch auf `external_removed` gesetzt
- [x] Log `external_vip_remove_slot_released` bestätigt

## Offen: STEP8.8

- [ ] VIP30-Alert-Konzept planen
- [ ] Entscheiden: bestehendes Alert-System vs. eigenes VIP30-Overlay
- [ ] Trigger-Bedingungen festlegen
- [ ] Config-Felder festlegen
- [ ] Textvarianten/Seed planen
- [ ] Dashboardfähigkeit berücksichtigen
- [ ] Diagnose-/Registry-Pflicht prüfen
- [ ] Betroffene Dateien erst nach Planung bestimmen
- [ ] Vor Umsetzung auf `go` warten

## Nicht vergessen

- Keine Apply-Skripte
- Keine Patch-Skripte
- Keine Regex-/Set-Content-Patches
- Dateien bei Bedarf exakt anfordern
- Keine Funktionalität entfernen
- Vor Live-Test immer `stepdone.cmd`
