# CURRENT STATUS - stream-control-center

Stand: 2026-05-09

## Aktueller Hauptfokus - Loyalty / Kekskrümel

Vorhandene Referenzen:

- `project-state/STEP194_STREAMELEMENTS_LOYALTY_MIGRATION_ARCHITECTURE_2026-05-07.md`
- `project-state/STEP202_LOYALTY_CAPTURE_AND_MIGRATION_PREP_2026-05-09.md`
- `project-state/STEP202_1_LOYALTY_DB_FIRST_STANDARD_2026-05-09.md`
- `project-state/STEP202_2_LOYALTY_SHADOW_MODE_AND_BONUS_RULES_2026-05-09.md`
- `project-state/STEP203_LOYALTY_CORE_DB_API_SHADOW_MODE_2026-05-09.md`
- `project-state/STEP203_1_LOYALTY_WATCH_SHADOW_HOOK_2026-05-09.md`

Aktueller Stand:

- Loyalty-Core ist vorhanden.
- Modulversion: `0.1.1`.
- Schema-Version: `2`.
- Shadow Mode ist aktiv.
- StreamElements bleibt aktiv.
- User-Punkte-Import kommt später.
- Watch-Heartbeat mit 10-Minuten-Intervall-Schutz ist vorbereitet.

Neue Watch-Routen:

```text
GET  /api/loyalty/watch/heartbeat
POST /api/loyalty/watch/heartbeat
GET  /api/loyalty/watch/states
```

Neue DB-Struktur:

```text
loyalty_watch_state
```

Verhalten:

```text
erster Heartbeat im Intervall: Punkte werden vergeben
weiterer Heartbeat im selben Intervall: keine neue Transaktion
ignored users: keine User-/Transaktionsanlage
```

## Bewusst offen

- echten Twitch-/Presence-/Streamer.bot-Hook anbinden
- Dashboard-Modul für Loyalty
- Rewards / Store
- Giveaways
- Chat-Games
- StreamElements-Import später
