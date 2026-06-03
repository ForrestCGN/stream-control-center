# CHANGELOG

## CAN-42.9

- `Admin > Diagnose > Tagebuch` liest bevorzugt den standardisierten `diagnostics`-Block aus `GET /api/tagebuch/status`.
- Tagebuch-Health, Version, Schema, Config/Textquelle, Counts, State und Webhook nutzen den Standardblock.
- Fallback auf `integration-check` bleibt vorerst erhalten.
- Keine Backend-Änderung.
- Keine API-POSTs.
- Keine produktive Aktion.
- Keine Funktionalität entfernt.

## CAN-42.8

- Tagebuch `/api/tagebuch/status` liefert zusätzlich `diagnostics`.
