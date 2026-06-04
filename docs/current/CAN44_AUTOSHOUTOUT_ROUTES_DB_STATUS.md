# CAN-44 AutoShoutout: Routen, Datenbank, Status

Stand: nach CAN-44.13.3 / geprüft am 2026-06-04

## Kurzstatus

- Modul: `clip_shoutout`
- aktuelle Modulversion im Live-Test: `0.2.24`
- AutoShoutout aktiv: ja
- `onlyWhenLive`: aktuell bewusst `false` für Streamtests
- Mindestnachrichten: `3`
- Zeitfenster: `1800000 ms` = 30 Minuten
- Begrüßung: aktiv
- Begrüßungs-Text-Key: `auto.greeting`
- Textvarianten: über `helper_texts` / `module_text_variants`
- Dry-Run für Test-Chat: standardmäßig aktiv
- FadJoe-Teststatus wurde per `clear-target` erfolgreich gelöscht

## Backend-Routen

Basis-Prefix:

```http
/api/clip-shoutout
```

### Allgemeine Shoutout-Routen

| Methode | Route | Zweck |
|---|---|---|
| `GET` | `/api/clip-shoutout/status` | Modulstatus, Config, Routenübersicht |
| `GET` | `/api/clip-shoutout/clips` | Clip-/Shoutout-Clipdaten listen |
| `GET/POST` | `/api/clip-shoutout/run` | manuellen Video-Shoutout auslösen |
| `GET/POST` | `/api/clip/shoutout` | Legacy-/Alias-Route für manuellen Shoutout |
| `GET` | `/api/clip-shoutout/settings` | globale ClipShoutout-Settings lesen |
| `POST` | `/api/clip-shoutout/settings` | globale ClipShoutout-Settings speichern |
| `GET` | `/api/clip-shoutout/queue` | DisplayQueue und OfficialQueue anzeigen |
| `GET` | `/api/clip-shoutout/timeline` | Shoutout-Timeline anzeigen |
| `GET` | `/api/clip-shoutout/stats` | Statistik |
| `GET` | `/api/clip-shoutout/stats/user` | Statistik pro User |
| `GET` | `/api/clip-shoutout/production-check` | Produktionscheck |
| `GET` | `/api/clip-shoutout/live-test` | Live-Test/Entscheidungsvorbereitung |
| `GET` | `/api/clip-shoutout/decision-prep` | Alias/Entscheidungsvorbereitung |

### AutoShoutout-Routen

| Methode | Route | Zweck |
|---|---|---|
| `GET` | `/api/clip-shoutout/auto` | kompletter AutoShoutout-Status inkl. Settings, Streamern, Events, Activity, TextEditor |
| `GET` | `/api/clip-shoutout/auto/settings` | AutoShoutout-Settings lesen |
| `POST` | `/api/clip-shoutout/auto/settings` | AutoShoutout-Settings speichern |
| `GET` | `/api/clip-shoutout/auto/texts` | Textvarianten für AutoShoutout lesen |
| `POST` | `/api/clip-shoutout/auto/texts` | Textvarianten speichern/ersetzen |
| `GET` | `/api/clip-shoutout/auto/streamers` | konfigurierte AutoSO-Streamer lesen |
| `POST` | `/api/clip-shoutout/auto/streamers` | Streamer hinzufügen/ändern |
| `POST` | `/api/clip-shoutout/auto/streamers/remove` | Streamer deaktivieren/entfernen |
| `POST` | `/api/clip-shoutout/auto/test-chat` | Chatnachricht simulieren; seit CAN-44.13.1 standardmäßig Dry-Run |
| `POST` | `/api/clip-shoutout/auto/clear-target` | gezielt AutoSO-/Queue-Teststatus für einzelnen Login zurücksetzen |
| `POST` | `/api/clip-shoutout/auto/reset-day` | AutoSO-Status für Tag/Scope zurücksetzen |

### Queue-Verwaltung

| Methode | Route | Zweck |
|---|---|---|
| `POST` | `/api/clip-shoutout/display-queue/remove` | DisplayQueue-Eintrag entfernen |
| `POST` | `/api/clip-shoutout/display-queue/retry` | DisplayQueue-Eintrag erneut versuchen |
| `POST` | `/api/clip-shoutout/queue/remove` | OfficialQueue-Eintrag entfernen |
| `POST` | `/api/clip-shoutout/queue/retry` | OfficialQueue-Eintrag erneut versuchen |

### Inbound-/Official-Routen

| Methode | Route | Zweck |
|---|---|---|
| `GET` | `/api/clip-shoutout/inbound` | eingehende Twitch-Shoutout-Events |
| `GET` | `/api/clip-shoutout/inbound/stats` | Inbound-Statistiken |
| `POST` | `/api/clip-shoutout/inbound/debug` | Inbound-Debug/Test |
| `GET` | `/api/clip-shoutout/official/auth-status` | Auth-Status offizieller Twitch-Shoutout |

## Datenbanktabellen

### `clip_shoutout_auto_settings`

Speichert AutoShoutout-Settings als JSON.

| Spalte | Zweck |
|---|---|
| `key` | Settings-Key |
| `value_json` | JSON-Wert |
| `updated_at` | letzte Änderung |

### `clip_shoutout_auto_streamers`

Konfigurierte Streamer, die AutoShoutouts auslösen können.

| Spalte | Zweck |
|---|---|
| `id` | Primärschlüssel |
| `login` | normalisierter Twitch-Login, unique |
| `display_name` | Anzeigename |
| `enabled` | aktiv/inaktiv |
| `official_shoutout` | offiziellen Twitch-Shoutout nach Video einplanen |
| `video_shoutout` | Video-/Clip-Shoutout einplanen |
| `note` | Notiz im Dashboard |
| `meta_json` | Zusatzdaten |
| `created_at` | erstellt am |
| `updated_at` | aktualisiert am |

Aktuell konfigurierte Streamer:

- `fadjoe81`
- `papselzockt_`
- `urlug`
- `ronnyp26cgn`
- `the_fatotter`

### `clip_shoutout_auto_events`

Historie der AutoShoutout-Trigger/Events.

| Spalte | Zweck |
|---|---|
| `id` | Primärschlüssel |
| `target_login` | Zielstreamer |
| `target_display` | Anzeigename Ziel |
| `trigger_login` | Auslöser-Login |
| `trigger_display` | Auslöser-Anzeigename |
| `stream_day_id` | Streamtag-ID |
| `status` | z. B. `triggered`, `skipped`, `removed` |
| `reason` | Grund, z. B. `queued`, `cooldown`, `already_received` |
| `display_queue_id` | Bezug auf DisplayQueue |
| `created_at` | Eventzeit |
| `meta_json` | Diagnose-/Kontextdaten |

### `clip_shoutout_auto_message_activity`

Zählung der Chatnachrichten für den Threshold.

| Spalte | Zweck |
|---|---|
| `id` | Primärschlüssel |
| `target_login` | Zielstreamer |
| `target_display` | Anzeigename |
| `stream_day_id` | Streamtag-ID |
| `window_started_at` | Beginn des Zählfensters |
| `last_message_at` | letzte gezählte Nachricht |
| `message_count` | aktuelle Anzahl Nachrichten im Fenster |
| `required_messages` | benötigte Anzahl, Standard 3 |
| `window_ms` | Fensterlänge, Standard 1800000 |
| `greeted_at` | Begrüßung gesendet |
| `triggered_at` | AutoShoutout ausgelöst |
| `updated_at` | aktualisiert am |
| `meta_json` | Diagnose-/Kontextdaten |

Unique-Key:

```text
(target_login, stream_day_id)
```

### Weitere relevante Tabellen des Shoutout-Systems

| Tabelle | Zweck |
|---|---|
| `clip_shoutout_display_queue` | Video-/Clip-Shoutout-Anzeigequeue |
| `clip_shoutout_official_queue` | Warteschlange für offizielle Twitch-Shoutouts |
| `clip_shoutout_official_history` | Historie gesendeter/fehlgeschlagener offizieller Shoutouts |
| `clip_shoutout_stream_days` | Streamtag-/Session-Verwaltung |
| `clip_shoutout_inbound_events` | eingehende Twitch-Shoutout-Events |
| `module_texts` | Legacy-/Single-Text-Verwaltung |
| `module_text_variants` | Textvarianten, Gewichte, Kategorien |

## Textvarianten

AutoShoutout nutzt den zentralen Texteditor:

- Tabelle: `module_text_variants`
- `module_name`: `clip_shoutout`
- `text_key`: `auto.greeting`
- `category`: `auto_shoutout`

Dashboard soll Textvarianten pro Zeile bearbeiten können. Die Auswahl erfolgt zufällig/gewichtet über `helper_texts`.

## Testbefehle

### Status prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 10
```

### Dry-Run-Test

Standardmäßig kein echter Shoutout:

```powershell
1..3 | ForEach-Object {
  Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
    -Method POST `
    -ContentType "application/json" `
    -Body '{"login":"fadjoe81","displayName":"fadjoe81","message":"Testnachricht"}' |
    ConvertTo-Json -Depth 8
}
```

### Echten Test bewusst ausführen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/test-chat" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","displayName":"fadjoe81","message":"Testnachricht","execute":true}' |
  ConvertTo-Json -Depth 8
```

### Zielstreamer freigeben

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto/clear-target" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"login":"fadjoe81","reason":"test_clear_before_stream"}' |
  ConvertTo-Json -Depth 8
```

Erwartung nach erfolgreichem Clear:

```text
ok: true
removedDisplay: 1 oder 0
deletedEvents: >= 0
deletedActivity: >= 0
runtimeReset: true
```

## Aktueller Teststand FadJoe

Der Testeintrag für `fadjoe81` wurde erfolgreich entfernt:

- DisplayQueue-ID `64` entfernt
- Auto-Event gelöscht
- Message-Activity gelöscht
- Runtime-State zurückgesetzt
- DisplayQueue danach `pending: 0`

Damit kann `fadjoe81` im Stream erneut nach 3 echten Chatnachrichten einen AutoShoutout erhalten.

## Offene Punkte

- Nach dem heutigen Stream `onlyWhenLive` wieder auf Aktivierung prüfen.
- Live-Status-Monitor weiter auswerten, bevor AutoShoutout dauerhaft nur bei Live-Status läuft.
- Dashboard-Button für `clear-target` optional ergänzen.
- Doku nach finalem Live-Test mit realer Chat-Auslösung aktualisieren.
- Prüfen, ob `triggerOnFirstMessageOnly` als Legacy-Feld im Dashboard deutlicher gekennzeichnet oder später sauber ersetzt werden soll.
