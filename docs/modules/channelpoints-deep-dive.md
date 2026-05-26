# Modul-Doku — Kanalpunkte

Stand: 2026-05-26

## Version

```text
moduleVersion = 0.8.0
moduleBuild = twitch-auth-scope-check
UI_VERSION = 0.8.0
UI_BUILD = twitch-auth-scope-check
```

## Ziel

Das Kanalpunkte-System soll Twitch Channel-Points Rewards lokal verwalten, später mit echten Twitch Custom Rewards synchronisieren und Redemptions ausführen.

Aktuell ist der lokale Teil fertig genug für Tests. Die echte Twitch-Anbindung ist vorbereitet, aber Schreibzugriffe sind weiterhin deaktiviert.

## Lokale Funktionen

- Rewards erstellen.
- Rewards bearbeiten.
- Rewards lokal löschen.
- Rewards lokal aktivieren/deaktivieren.
- Rewards kopieren.
- Kategorien/Suche/Filter.
- Sound/Video/Text-Aktionen.
- Lokale Testeinlösung.
- Einlösungsverlauf.
- EventBus-Domain-Events.
- Twitch Auth-/Scope-Check.

## UI-Konzept

Analog zu Commands:

- Liste links oder gruppiert nach Kategorien.
- Modal zum Erstellen/Bearbeiten.
- Technische Felder unter `Erweitert`.
- Normale Aktionen:
  - Sound abspielen
  - Video anzeigen
  - Text anzeigen
  - Nur verwalten
  - Benutzerdefinierte Aktion

## Datenbank

Tabellen:

```text
channelpoints_categories
channelpoints_rewards
channelpoints_redemptions
```

Safety:

- Bestehende Datenbank nicht ersetzen.
- Keine destruktiven Migrationen.
- Twitch IDs lokal speichern, aber Twitch-Schreibaktionen erst später bewusst aktivieren.

## EventBus

Dokumentierte Events:

```text
channelpoints.reward.created
channelpoints.reward.updated
channelpoints.reward.deleted
channelpoints.reward.enabled
channelpoints.reward.disabled
channelpoints.redemption.created
channelpoints.redemption.executed
channelpoints.redemption.failed
channelpoints.twitch.readiness
```

Route:

```text
GET /api/channelpoints/bus-events
```

## Twitch-Readiness

Route:

```text
GET /api/channelpoints/twitch/auth-check
```

Geprüft:

- Token vorhanden.
- Token validierbar.
- Login/UserID/BroadcasterID.
- Scopes.
- Read-only Sync Bereitschaft.
- spätere Schreibbereitschaft.

## Nächster Schritt

`channelpoints v0.8.1 — Twitch Rewards Read-Only Sync`

Routen geplant:

```text
GET /api/channelpoints/twitch/rewards
GET /api/channelpoints/twitch/sync-preview
```

Keine Twitch-Schreibzugriffe.

