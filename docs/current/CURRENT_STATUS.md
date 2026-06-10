# CURRENT STATUS – stream-control-center

Stand: 2026-06-10

## Aktueller bestätigungsbereiter Stand

```text
STEP BUS-TWITCH.5b – User OAuth Force Verify + Scope Diagnostics
```

## Twitch Events / EventSub Chat

```text
- twitch_events bleibt Version 0.1.4
- Build bleibt BUS_TWITCH_5_LIVE_TOKEN_ID_READINESS
- Live-Readiness-Route bleibt aktiv
- Keine Subscription-Erstellung
- Kein EventSub-Takeover
- twitch.js bleibt EventSub-Besitzer
```

## Twitch OAuth

```text
- twitch.js Version 0.1.2
- Build BUS_TWITCH_5B_OAUTH_FORCE_VERIFY_DIAGNOSTICS
- normaler ForrestCGN OAuth-Login unterstützt optional force_verify
- neue sichere Scope-Diagnose ohne Token-Ausgabe
- Ziel: user:read:chat wirklich in den validierten User-Token bekommen
```

## Nicht geändert

```text
- Keine bestehende EventSub-Subscription aktiviert
- Keine bestehende EventSub-Logik entfernt
- Keine Commands-/Presence-/Alert-/VIP-/Loyalty-Flows umgebaut
- Keine SQLite-/DB-Datei ersetzt
```
