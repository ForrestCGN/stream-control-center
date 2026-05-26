# NEXT_STEPS — stream-control-center

## Priorität 1 — Kanalpunkte fertigstellen

### Nächster Schritt: `channelpoints v0.8.1 — Twitch Rewards Read-Only Sync`

Ziel:

- Echte Twitch Custom Rewards abrufen.
- Lokale Rewards gegen Twitch Rewards vergleichen.
- Noch keine Twitch-Schreibaktionen.

Geplante Routen:

```text
GET /api/channelpoints/twitch/rewards
GET /api/channelpoints/twitch/sync-preview
```

Dashboard:

- Twitch Rewards anzeigen.
- Lokale Rewards anzeigen.
- Sync-Vorschau anzeigen:
  - verknüpft
  - nur lokal
  - nur Twitch
  - Unterschiede bei Titel/Kosten/Prompt/Status

Safety:

- `noTwitchWrite = true`
- keine Create/Update/Delete Requests.
- keine Redemption-Status-Updates.

### Danach

#### `channelpoints v0.8.2 — Local/Twitch Link Preview`

- Manuelle Verknüpfung vorbereiten.
- Twitch Reward ID lokal speichern, aber nur bewusst per Button.
- Konflikte anzeigen.

#### `channelpoints v0.8.3 — Controlled Twitch Create/Update`

- Twitch-Schreibaktionen nur nach expliziter Rückfrage.
- Einzelreward, kein Massenupdate.
- Audit/EventBus.

#### `channelpoints v0.8.4 — Twitch Disable Flow`

- Lokal deaktivieren vs. Twitch deaktivieren klar trennen.
- Twitch `is_enabled=false` nur bewusst per Button.

#### `channelpoints v0.9.0 — EventSub Redemption Ingest`

- Echte Twitch-Redemptions empfangen.
- Einlösung in DB speichern.
- Reward-Aktion ausführen.
- Später Fulfill/Cancel sauber umsetzen.

## Parken

### Zentrale Textverwaltung

Aktuell bewusst zurückgestellt. Texte werden für Kanalpunkte vorerst nicht weiter vertieft, bis das Kanalpunkte-System fertig ist.

Später:

- zentrale Textgruppen.
- Varianten.
- Zufall/Rotation.
- Commands und Kanalpunkte nutzen dasselbe Textsystem.

