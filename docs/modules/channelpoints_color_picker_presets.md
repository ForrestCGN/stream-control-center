# Channelpoints – Twitch Color Picker Presets

Stand: STEP516 / Dashboard UI v1.0.3

## Ziel

Der Reward-Editor nutzt fuer die Twitch-Reward-Farbe nicht mehr nur ein reines Hex-Textfeld. Stattdessen gibt es:

- ein Farbauswahlfeld (`input type="color"`),
- ein weiterhin sichtbares Hex-Feld,
- Preset-Buttons fuer Twitch-/CGN-/Standardfarben,
- eine Live-Vorschau.

## Technische Speicherung

Es wird weiterhin der normale Twitch-Hexwert gespeichert:

```json
{
  "twitch": {
    "background_color": "#9147FF"
  }
}
```

Speicherort bleibt `action_payload_json.twitch.background_color`.

## Presets

Aktuelle Presets:

- Twitch Lila `#9147FF`
- CGN Neon Lila `#B000FF`
- CGN Cyan `#00E5FF`
- Tuerkis `#00E5CB`
- Blau `#3B82F6`
- Gruen `#00FF7F`
- Gold `#FFD700`
- Orange `#FF7A00`
- Rot `#FF3030`
- Pink `#FF4FD8`

## Regeln

- Keine neue DB-Tabelle.
- Keine neue Route.
- Kein neuer Bedienmodus.
- Backend bleibt unverändert.
- Twitch erwartet weiterhin Hex-Farben im Format `#RRGGBB`.
- Button „Standard“ leert die Farbe, damit Twitch/Standardfarbe verwendet wird.
