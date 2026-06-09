# Loyalty Giveaways – LWG-4M.4

## Backend Bound Wheel Foundation

### Neue Tabelle
`loyalty_giveaway_bound_wheels`

Felder:
- `bound_wheel_uid`
- `giveaway_uid`
- `name`
- `description`
- `source_preset_uid`
- `scope = giveaway`
- `status`
- `locked`
- `metadata_json`

### Bedeutung
Ein globales Preset ist nur die Vorlage. Beim Erstellen eines Wheel-Giveaways wird eine giveaway-gebundene Konfiguration angelegt.

### Name
Der gebundene Name wird automatisch gebildet:

```text
<Giveaway-Name> – Glücksrad
```

### API
```text
GET /api/loyalty/giveaways/:giveawayUid/wheel/bound
PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound
```

`PUT` ist nur erlaubt, solange das Giveaway draft/editierbar ist.

### Kompatibilität
Bestehende Giveaway-/Ticket-/Draw-/Wheel-Claim-Flows werden nicht entfernt.
