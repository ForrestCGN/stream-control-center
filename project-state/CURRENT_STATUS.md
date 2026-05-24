# CURRENT_STATUS

## STEP278B

Communication Bus Helper Core vorbereitet.

Neu:

- `backend/modules/helpers/helper_communication.js`
- `config/communication_bus.json`
- `docs/backend/COMMUNICATION_BUS_HELPER.md`
- `project-state/STEP278B_COMMUNICATION_HELPER_CORE.md`

Wichtig:

- Noch keine Migration bestehender Module.
- `broadcastWS` bleibt unverändert.
- Sound-/Alert-/TTS-/VIP-Systeme werden nicht verändert.
- Master-Overlay bleibt Test-/Vorbereitungsstand.

## STEP277A_FIX10

Clip-Shoutout hat jetzt eine reine Clip-Listen-Route:

```text
GET /api/clip-shoutout/clips?target=<login>
```

Die Route dient zur Kontrolle der gefundenen Clips und startet keinen Shoutout.
