# NEXT_STEPS – stream-control-center

Stand: 2026-06-22

## Nächster sinnvoller Schritt nach HT2.8

HT2.8 ist als bestätigter Tagebuch-Stream-State-Stand dokumentiert.

Nächster technischer Schritt:

```text
HypeTrain Live-Event-Verhalten mit echtem Twitch-HypeTrain beobachten.
```

Prüfen beim nächsten echten HypeTrain:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild

$r = Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status"
$r.state | Select-Object effectiveActiveStreamForEntries,entryStreamSource
```

Erwartung:

```text
hypetrain moduleVersion = 0.1.5
hypetrain moduleBuild   = STEP_HT2_7_HYPETRAIN_DIARY_DISCORD_CLARITY

tagebuch moduleVersion = 0.1.1
build/stand = STEP_HT2_8_TAGEBUCH_STREAM_STATE_ENTRIES

effectiveActiveStreamForEntries = true, wenn Stream-State/Override live ist
entryStreamSource = twitch_events_stream_state
```

Wichtig:

- HypeTrain-Ende soll ins Tagebuch schreiben.
- Discord soll nur über das bestehende Tagebuch-System laufen.
- Direkt-Discord bleibt aus.
- Rekord-Sound bleibt aus, bis Media-/Sound-Konfiguration bewusst getestet wurde.

## Optionaler späterer Schritt

```text
HypeTrain Rekord-Sound über Media-/Sound-System konfigurieren und separat testen.
```

Dafür vorher prüfen:

- Media-ID oder Sound-ID existiert im Sound-/Media-System.
- Sound-System ist aktiv.
- Queue-/Prioritätsregeln sind passend.
- `recordSoundEndEnabled` wird nur bewusst aktiviert.

## Nicht als nächstes tun

```text
Keine direkte Discord-Ausgabe aktivieren.
Keine Rekord-Sound-Aktion ungeprüft aktivieren.
Keine Twitch/EventSub-Logik im hypetrain-Modul bauen.
Keine DB ersetzen oder löschen.
Keine Funktionalität entfernen.
```

---

## Ältere nächste Schritte / Historie

### Nach STEP_HT2_7_HYPETRAIN_DIARY_DISCORD_CLARITY

- `diary_only` bleibt Standard.
- Dashboard-/Profiltexte unterscheiden klar zwischen `Tagebuch/Discord` und `Direkt-Discord`.
- `discord_only` ist nur separater Zusatzweg: `Nur Direkt-Discord`.
- Keine produktive Aktion wurde durch HT2.7 ausgelöst.

### Nach STEP_HT2_6 Aktivierungsprofile

- `all_off` testen.
- `diary_only` setzen und prüfen.
- Produktiven Tagebuch-Einzeltest nur mit zusätzlichem Confirm durchführen.
- Danach optional `discord_only` oder `record_sound_only` nur einzeln und bewusst testen.
- Nach jedem Test Status, Logs und End-Actions-Counter prüfen.

### Nach STEP_HT2_5_HYPETRAIN_LIVE_READINESS

- Live-Readiness prüfen.
- Discord-Webhook/Channel nur aktivieren, wenn Readiness ok ist.
- Tagebuch nur produktiv aktivieren, wenn Streamstatus/Regeln passen.
- Rekord-Sound nur aktivieren, wenn Media-ID/Sound-ID vom Sound-System-Katalog gefunden wird.
- Produktiven manuellen Test erst nach Readiness ohne relevante Warnungen durchführen.

### Nach STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

- Beim nächsten echten Live-Stream final prüfen, ob `officialStatus=sent` / Twitch-204 nach Cooldown sauber erreicht wird.
- Keine Rückkehr zur alten Timer-Freigabe.
- Sound-System bleibt Playback-/Queue-Owner.
