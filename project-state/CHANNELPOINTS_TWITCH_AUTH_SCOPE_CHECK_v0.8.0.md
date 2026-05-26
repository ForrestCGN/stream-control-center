# Kanalpunkte v0.8.0 — Twitch Auth/Scope Check

## Stand

Version: `0.8.0`
Build: `twitch-auth-scope-check`

Dieser Stand erweitert das lokale Kanalpunkte-System um einen echten Auth-/Scope-Check gegen den bestehenden Twitch-OAuth-Status im Backend.

## Wichtig

- Keine Twitch-Schreibzugriffe.
- Keine DB-Schemaänderung.
- Keine Reward-Erstellung, Aktualisierung, Deaktivierung oder Löschung auf Twitch.
- Der Check nutzt lokal die bestehende Twitch-Auth-Validierung: `/api/twitch/auth/validate`.

## Neue Route

```text
GET /api/channelpoints/twitch/auth-check
```

Die Route prüft:

- ob ein gespeicherter User-OAuth-Token vorhanden/validierbar ist,
- welche Scopes vorhanden sind,
- ob `channel:read:redemptions` oder alternativ `channel:manage:redemptions` für Read-only Sync vorhanden ist,
- ob `channel:manage:redemptions` für spätere Schreibaktionen vorhanden ist,
- ob Token-User-ID und Broadcaster-ID zusammenpassen, sofern beide bekannt sind.

## Dashboard

Das Twitch-Sync-Panel zeigt jetzt zusätzlich:

- Auth-/Scope-Status,
- Token-Login/User-ID,
- Broadcaster-Match,
- vorhandene Scopes,
- benötigte Scopes.

## Sicherheit

Twitch-Schreibaktionen bleiben weiterhin deaktiviert. Dieser Schritt ist nur die Grundlage für den nächsten geplanten Schritt: Read-only Reward-Sync.
