# Kanalpunkte-System Deep Dive

Stand: 2026-05-26 / STEP495

## Zweck

Kanalpunkte-System für lokale Twitch-Reward-Verwaltung, spätere Twitch-Synchronisierung und spätere Redemption-Verarbeitung.

## Backend

```text
backend/modules/channelpoints.js
```

Aktueller Backend-Stand bleibt `0.5.0` aus STEP493.

## Dashboard

```text
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
```

STEP495 baut das Dashboard nicht mehr als lange Einzelseite, sondern als Command-ähnliches Bedienmuster:

- Tabs: Übersicht, Rewards, Kategorien, Aktionen, Medien, Einlösungen, Twitch Sync
- Suche und Filter
- Reward-Liste links
- Detail-/Editorbereich rechts
- Editorbereiche: Basis, Aktion, Medien, Regeln

## Gemeinsames Muster mit Commands

Commands und Kanalpunkte sollen ähnlich funktionieren:

| Commands | Kanalpunkte |
|---|---|
| Trigger/Befehl | Reward/Button |
| Aliases | Twitch Reward ID später |
| Permission | Kosten/User Input/Limit |
| Cooldown | Cooldown/Max pro Stream |
| Action-Typ | Action-Typ |
| Medien | Medien |
| Logs | Redemptions/History |

## Medienregel

Kanalpunkte erzeugen kein eigenes Upload-System. Medien werden über `media.js`, `media_picker.js` und `media_field.js` ausgewählt.

## Nicht in STEP495

- Keine Backend-Änderung.
- Keine DB-Migration.
- Keine Twitch-Schreibaktion.
