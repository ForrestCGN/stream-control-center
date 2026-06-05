# VIP30 / 30 Tage VIP

Stand: **STEP8.1**  
Version: **0.8.1**  
Build: `step8.1-arm-preview-compact-live-check`

## Ziel

VIP30 ist weiterhin im sicheren Vorbereitungsmodus. STEP8.1 macht die Live-Schalter sichtbar/pruefbar und ergaenzt eine Armierungs-Vorschau.

## Neue/angepasste Routen

- `GET /api/vip30/live/check`
  - liefert weiterhin den Safety-Status
  - enthaelt zusaetzlich `compact` mit `status`, `armed`, `blockerCount`, `blockers`
- `GET /api/vip30/live/arm-preview`
  - zeigt fehlende Schalter mit Setting-Key, Zielwert und Beschreibung
  - gibt eine empfohlene Aktivierungsreihenfolge aus
  - schreibt nichts
- `POST /api/vip30/redeem/live-plan`
  - bleibt Plan-only

## Safety

STEP8.1 fuehrt keine echten Live-Aktionen aus:

- kein Twitch-Write
- kein VIP-Grant
- kein Slot-Write
- kein Fulfill/Cancel
- kein Alert

## Live-Gates

Die Live-Aktivierung bleibt durch mehrere Gates gesperrt:

- `live.enabled`
- `live.mode = live`
- `twitch.liveActionsEnabled`
- `bridge.decisionOnly = false`
- `live.allowVipGrant`
- `live.allowSlotWrite`
- `live.allowRedemptionFulfillCancel`
- `live.allowAlert`
- Twitch-Capability muss geprueft und bereit sein
- lokaler Reward muss `linked_in_sync` sein

## Minimaltest

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/live/check"
$r.compact

$a = Invoke-RestMethod "http://127.0.0.1:8080/api/vip30/live/arm-preview"
$a.blockerCount
$a.missing | Select-Object key,setting,requiredValue,label
```
