# CURRENT_CHAT_HANDOFF_LWG_4M_4_DOCUMENTED

Aktualisiert: 2026-06-09 08:21:19 UTC

## Letzter bestätigter Stand

Der aktuelle bestätigte Stand ist:

```text
LWG-4M.4 – Giveaway-bound Wheel Foundation
```

Bestätigter Code:
```text
backend/modules/loyalty_giveaways.js
MODULE_BUILD = STEP_LWG_4M_4
```

## Erfolgreich bestätigte Live-Tests

### LWG-4M.2
- `moduleBuild = STEP_LWG_4M_2`
- Draw aus `open` wurde mit `giveaway_draw_requires_closed_entries` blockiert.
- `/close` setzte Status auf `closed_for_entries`.
- Draw nach Close funktionierte.

### LWG-4M.3
- `moduleBuild = STEP_LWG_4M_3`
- Twitch Presence war nicht verbunden.
- `/close` blieb erfolgreich.
- `chatDispatchAttempted=true`
- `chatSent=false`
- Fehler: `twitch_chat_not_connected`

### LWG-4M.4
Testdaten:
- Globales Preset:
  - `preset_1780938582009_ab6884df2558206a`
  - `Standard Glücksrad`
  - `status=active`
  - `presetType=standalone`
- Test-Giveaway:
  - `giveaway_1780993114250_0253672f53351642`
- Bound Wheel:
  - `giveawaywheel_1780993114250_6bb551442f9576c3`
  - `scope=giveaway`
  - `sourcePresetUid=preset_1780938582009_ab6884df2558206a`
  - `name=LWG-4M.4 Bound Wheel Test – Glücksrad`
- Bound Wheel wurde per PUT erfolgreich umbenannt.
- Nach `open` blieb Bound Wheel stabil.
- Cleanup per `cancel` erfolgreich.

## Verbindliche Architektur

### UI
Die Giveaway-Erstellung soll ein Dropdown für die Wheel-Basis nutzen:

```text
Neues Rad für dieses Giveaway erstellen
Vorlage kopieren: <Preset-Name>
```

Kein direktes Teilen eines globalen Presets mit dem Giveaway.

### Name
Das gebundene Wheel heißt standardmäßig:

```text
<Giveaway-Name> – Glücksrad
```

Im Draft darf der Name im Giveaway-Kontext angepasst werden.

### Scope-Trennung
- Global: normale Presets und normale Wheel-Nutzung.
- Giveaway: bound Wheel, exklusiv für das Giveaway.

## Nächster empfohlener Step

```text
LWG-4M.5 – Bound Wheel aktivieren und für Claim/Spin verwenden
```

Ziel:
- Bound-Wheel-Status sauber setzen.
- Draw/Permission muss `wheelSnapshotUid`/BoundWheel nutzen.
- `!wheel`/`!rad` für Giveaway-Gewinner muss das gebundene Wheel verwenden.
- Globale Wheel-Spins dürfen weiterhin keine Giveaway-bound Wheels direkt starten.
