# Alerts – Twitch Sub-Tier-Filter

Stand: 2026-06-09

## Kurzfassung

Das Alert-System unterstützt technisch bereits Tier-Matching über Regel-Meta. Mit `STEP ALERT-TIERS.1` wurde die Dashboard-Bedienung ergänzt.

## Dashboard

Im Regel-Editor gibt es für Twitch-Sub-Typen eine Auswahl `Twitch-Tier`:

- Alle / kein Tier-Filter
- Prime
- Tier 1
- Tier 2
- Tier 3

Betroffene Typen:

```text
sub
resub
gift_sub
gifted_sub_received
gift_bomb
```

## Speicherung

Spezifische Auswahl:

```json
{
  "match": {
    "tierLabel": ["tier2"]
  }
}
```

Keine Auswahl / Alle:

```json
{}
```

Wenn `match` danach leer ist, wird `match` entfernt.

## Regelanlage

Dieser STEP legt keine neuen Regeln automatisch an. Tier2-/Tier3-Regeln sollen bewusst manuell im Dashboard erstellt oder aus vorhandenen Regeln kopiert werden.
