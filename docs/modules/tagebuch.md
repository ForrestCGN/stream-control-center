# Tagebuch-Modul

Stand: 2026-06-22  
Modul: `tagebuch`  
Version: `0.1.1`  
Build: `STEP_HT2_8_TAGEBUCH_STREAM_STATE_ENTRIES`

## Zweck

Das Tagebuch verwaltet Stream-/Systemeinträge und kann Einträge an Discord weiterleiten. Für HypeTrain-Enden wird das Tagebuch als gewünschter Standardweg genutzt.

## HT2.8 – Stream-State für Eintragsfreigabe

Das Tagebuch nutzt für `requireActiveStreamForEntries` nun zusätzlich den zentralen Stream-State aus `twitch_events.getStreamState()`.

Wenn der zentrale Stream-State `live` meldet, dürfen Tagebuch-Einträge geschrieben werden, auch wenn der alte Tagebuch-interne `active_stream`-Wert noch `false` ist.

Falls der zentrale Stream-State nicht verfügbar ist, bleibt der bisherige Tagebuch-State als Fallback erhalten.

Damit kann der Stream-State-Override für kontrollierte Tests genutzt werden, ohne die Tagebuch-Schutzregel abzuschalten.

## Bestätigter Teststand

```text
effectiveActiveStreamForEntries = true
entryStreamSource = twitch_events_stream_state
HypeTrain produktiver Tagebuch-Test wurde gespeichert
Tagebuch-Webhook hat gepostet
diary ok
```

## API-/Statusprüfung

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status"
$r.state | Select-Object effectiveActiveStreamForEntries,entryStreamSource
```

Erwartung bei aktivem zentralem Stream-State/Override:

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
- Kein separater Direkt-Discord-Post vom HypeTrain-Modul.
- Kein Rekord-Sound aktuell aktiv.

## Schutzregeln

- Tagebuch-Schutzregel nicht abschalten, nur um Tests zu erzwingen.
- Effektiven Stream-State über `twitch_events` nutzen.
- Produktive DB nicht ersetzen, löschen oder überschreiben.
- Bestehenden Tagebuch-Fallback nicht entfernen.
- Keine Funktionalität entfernen.
