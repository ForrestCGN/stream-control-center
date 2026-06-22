# NEXT_STEPS – stream-control-center

Stand: 2026-06-22

## Nächster sinnvoller Schritt nach HT2.9

HT2.9 ist als bestätigter HypeTrain-/Tagebuch-PosterName-Stand dokumentiert.

Nächster technischer Schritt:

```text
HypeTrain Live-Event-Verhalten mit echtem Twitch-HypeTrain beobachten.
```

Prüfen beim nächsten echten HypeTrain:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild

Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" |
  Select-Object moduleVersion,moduleBuild

$h = Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status"
$h.runtime.lastEndActions | ConvertTo-Json -Depth 5
```

Erwartung:

```text
hypetrain moduleVersion = 0.1.6
hypetrain moduleBuild   = STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME

tagebuch moduleVersion = 0.1.2
tagebuch moduleBuild   = STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME

Discord sichtbar = CGN Posty
discord.skipped = true
diary.ok = true
recordSound.skipped = true
```

Wichtig:

- HypeTrain-Ende soll ins Tagebuch schreiben.
- Discord soll nur über das bestehende Tagebuch-System laufen.
- Der sichtbare Discord-Name soll der normale Tagebuch-Webhook-Name sein, nicht `CGN-HypeTrain`.
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
- Kein Sound am Sound-System vorbei.

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

### Nach HT2.8

- HypeTrain-Ende soll ins Tagebuch schreiben.
- Discord soll nur über das bestehende Tagebuch-System laufen.
- Direkt-Discord bleibt aus.
- Rekord-Sound bleibt aus, bis Media-/Sound-Konfiguration bewusst getestet wurde.

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
