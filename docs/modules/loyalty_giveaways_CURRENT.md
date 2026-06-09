# Module: loyalty_giveaways – Current LWG-4M.9

## Zweck
Das Modul verwaltet Loyalty-Giveaways inklusive Classic- und Wheel-Giveaways.

## Bound-Wheel Architektur
- Presets sind globale Vorlagen.
- Wheel-Giveaways bekommen ein eigenes Bound-Wheel.
- Bound-Wheel-Name folgt dem Giveaway: `<Giveaway-Titel> – Gluecksrad`.
- Quelle wird ueber `sourcePresetUid` und Metadaten gespeichert.

## LWG-4M.9 Erweiterung
Bound-Wheel-Felder werden nun in einer eigenen Tabelle gespeichert:

- `loyalty_giveaway_bound_wheel_fields`

Beim Erstellen/Binden eines Wheel-Giveaways mit Preset-Vorlage werden die Felder aus `loyalty_wheel_fields` kopiert.
Diese Kopie gehoert danach zum Giveaway und ist die Grundlage fuer den kommenden Editor und die spaetere Runtime-Umstellung.

## Neue Routen
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields`
- `POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields`
- `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid`
- `POST /api/loyalty/giveaways/:giveawayUid/wheel/bound/fields/:fieldUid/delete`

## Editierbarkeit
- Nur Draft-Giveaways koennen Bound-Wheel-Felder bearbeiten.
- Sobald das Bound-Wheel active/locked ist, sind Felder read-only.

## Offene Punkte
- Dashboard-Editor fehlt noch.
- Runtime-Spin muss noch auf Bound-Wheel-Felder umgestellt werden.
