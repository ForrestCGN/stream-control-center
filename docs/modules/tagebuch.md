# Tagebuch-Modul

Stand: 2026-06-22  
Modul: `tagebuch`  
Version: `0.1.2`  
Build: `STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME`

## Zweck

Das Tagebuch verwaltet Stream-/Systemeinträge und kann Einträge an Discord weiterleiten. Für HypeTrain-Enden wird das Tagebuch als gewünschter Standardweg genutzt.

## HT2.9 – Systemeinträge und Webhook-Name

Systemeinträge ohne expliziten `systemUsername` setzen keinen eigenen Discord-Webhook-`username` mehr.

Dadurch nutzt Discord den normalen Webhook-Namen des Tagebuch-Webhooks. Für Forrests aktuelles Setup wurde sichtbar `CGN Posty` bestätigt.

Systemeinträge mit explizitem `systemUsername` bleiben weiterhin möglich, falls ein Modul bewusst einen anderen sichtbaren Namen setzen soll.

Bestätigter HypeTrain-Test:

```text
Discord sichtbarer Name = CGN Posty
diary.ok = true / status 200
posterName intern = hypetrain
```

`posterName=hypetrain` ist nur der interne Actor/Login aus dem API-Call und nicht der sichtbare Discord-Name.

## HT2.8 – Stream-State für Eintragsfreigabe

Das Tagebuch nutzt für `requireActiveStreamForEntries` zusätzlich den zentralen Stream-State aus `twitch_events.getStreamState()`.

Wenn der zentrale Stream-State `live` meldet, dürfen Tagebuch-Einträge geschrieben werden, auch wenn der alte Tagebuch-interne `active_stream`-Wert noch `false` ist.

Falls der zentrale Stream-State nicht verfügbar ist, bleibt der bisherige Tagebuch-State als Fallback erhalten.

Damit kann der Stream-State-Override für kontrollierte Tests genutzt werden, ohne die Tagebuch-Schutzregel abzuschalten.

Bestätigt:

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
```

## API-/Statusprüfung

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" |
  Select-Object moduleVersion,moduleBuild

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status"
$r.state | Select-Object effectiveActiveStreamForEntries,entryStreamSource
```

Erwartung:

```text
moduleVersion = 0.1.2
moduleBuild   = STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

Bei aktivem zentralem Stream-State/Override:

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
```

## Relevanz für HypeTrain

Aktueller HypeTrain-Standard:

```text
diaryEndEnabled = true
directDiscordEndEnabled = false
recordSoundEndEnabled = false
```

Bedeutung:

- HypeTrain-Ende schreibt ins Tagebuch.
- Discord läuft über das bestehende Tagebuch-System.
- Sichtbarer Discord-Name kommt vom Tagebuch-Webhook.
- Kein separater Direkt-Discord-Post vom HypeTrain-Modul.
- Kein Rekord-Sound aktuell aktiv.

## Schutzregeln

- Tagebuch-Schutzregel nicht abschalten, nur um Tests zu erzwingen.
- Effektiven Stream-State über `twitch_events` nutzen.
- Systemeinträge ohne gewünschten Sondernamen sollen den Tagebuch-Webhook-Namen nutzen.
- Produktive DB nicht ersetzen, löschen oder überschreiben.
- Bestehenden Tagebuch-Fallback nicht entfernen.
- Keine Funktionalität entfernen.
