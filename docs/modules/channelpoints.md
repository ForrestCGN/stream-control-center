# Modul: Channelpoints

Stand: STEP527 / 2026-05-27  
Aktuelle Zielversion: `0.9.13` / `create-save-twitch-inactive-default`

## Zweck

Das Channelpoints-Modul verwaltet Twitch Channel-Point-Rewards lokal im Control-Center und synchronisiert sie mit Twitch. Einlösungen werden über Twitch EventSub empfangen, über den EventBus an das Channelpoints-Modul weitergereicht, in der Historie gespeichert und bei vollständiger Aktion ausgeführt.

## Aktuelles Bedienkonzept

Der Editor besitzt kein normales lokales „Aktiv“-Häkchen mehr.

```text
Speichern:
- legt neuen Reward lokal an oder aktualisiert ihn
- erstellt/aktualisiert den passenden Twitch-Reward
- bei neuem Reward: Twitch-Reward standardmäßig INAKTIV
- bei bestehendem Reward: bisherigen Twitch-Aktivstatus beibehalten

Übersicht:
- Twitch Aktiv/Inaktiv steuert ausschließlich Twitch-Sichtbarkeit/Einlösbarkeit
```

`system_enabled` bleibt intern nur zur technischen Kompatibilität bestehen. UI-seitig soll es nicht mehr als eigenständige Bedienebene verstanden werden.

## Warum diese Änderung?

Frühere Zustände waren zu verwirrend:

```text
lokal aktiv
Twitch aktiv
Twitch verknüpft
Aktion vollständig
Sync-Status
```

Für die Bedienung reicht jetzt:

```text
Reward existiert lokal
Twitch: Aktiv / Inaktiv
Aktion vollständig / unvollständig
```

## Neue Rewards

Beim neuen Reward gelten die Defaultwerte:

```text
cooldown_seconds = 0
max_per_stream = 0
max_per_user_per_stream = 0
```

Speichern eines neuen Rewards:

```text
lokal anlegen
Twitch-Reward erstellen
Twitch-Reward standardmäßig deaktiviert lassen
```

Der Reward wird also erst durch den Übersichtsschalter auf Twitch sichtbar/einlösbar.

## Bestehende Rewards

Bearbeiten + Speichern:

```text
lokal aktualisieren
Twitch aktualisieren
bisherigen Twitch-Aktivstatus beibehalten
```

Beispiel:

```text
War Twitch aktiv  -> bleibt nach Speichern aktiv
War Twitch inaktiv -> bleibt nach Speichern inaktiv
```

## Twitch-Schalter in der Übersicht

Der Übersichtsschalter steuert nur Twitch:

```text
Twitch aktivieren:
- falls keine Twitch-ID vorhanden: erstellen
- falls alte/kaputte Twitch-ID: reparieren/neu erstellen
- Reward auf Twitch aktiv setzen

Twitch deaktivieren:
- Reward auf Twitch deaktivieren
- lokale Verknüpfung behalten
```

## Wichtige Twitch-Felder

Create/Update relevant:

```text
title
cost
prompt
is_enabled
background_color
is_user_input_required
is_max_per_stream_enabled
max_per_stream
is_max_per_user_per_stream_enabled
max_per_user_per_stream
is_global_cooldown_enabled
global_cooldown_seconds
should_redemptions_skip_request_queue
```

Update zusätzlich:

```text
is_paused
```

Nicht über diese API setzbar:

```text
image
default_image
is_in_stock
redemptions_redeemed_current_stream
cooldown_expires_at
```

## Streamgebundene Twitch-Meldung

Wenn ein Reward offline bei Twitch meldet:

```text
Du kannst diese Belohnung nur während eines Streams einlösen.
```

prüfen:

```text
max_per_stream > 0
```

Ein Wert größer 0 macht die Belohnung streamgebunden. Für normale Rewards soll `max_per_stream = 0` sein.

## EventSub-Redemption-Flow

Aktueller Zielablauf:

```text
Twitch EventSub
→ twitch.js Audit/Cache
→ channelpoints_eventsub_bus_bridge.js
→ EventBus: channelpoints.redemption / received
→ channelpoints.js Subscriber
→ Reward finden / mappen
→ Aktion prüfen
→ Aktion ausführen
→ Historie speichern
→ je nach Completion-Policy FULFILLED/CANCELED setzen
```

## Media-/Sound-Regeln

Channelpoints soll keine eigene Audio-Output-Entscheidung erzwingen.

```text
Sound/Audio:
- an Sound-System übergeben
- Sound-System entscheidet Device/Overlay/Discord

Video:
- Media-/Sound-Bridge nutzen
- Overlay nur wenn nötig/gewollt

Queue:
- Sound-System entscheidet
```

## Wichtige Diagnosebefehle

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/status" | ConvertTo-Json -Depth 6
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status" | ConvertTo-Json -Depth 6
```

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/rewards" |
  Select-Object -ExpandProperty rewards |
  Select-Object reward_key,title,twitch_is_enabled,twitch_reward_id,action_type,action_key,media_asset_id,cooldown_seconds,max_per_stream,max_per_user_per_stream |
  Format-Table -AutoSize
```

## Zurückgezogene / ersetzte Stände

Nicht benutzen:

```text
STEP525_CHANNELPOINTS_SAVE_ACTIVE_SYNCS_TWITCH_v0.9.11
STEP525_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_FLOW_v0.9.11
```

Durch STEP527 ersetzt:

```text
STEP526_CHANNELPOINTS_SIMPLIFIED_TWITCH_ACTIVATION_HOTFIX_v0.9.12
```
