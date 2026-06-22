# HT2.9 – HypeTrain/Tagebuch Poster-Name

Stand: 2026-06-22

## Ziel

Wenn das HypeTrain-Modul einen Eintrag über das Tagebuch-System schreibt, soll der sichtbare Discord-Webhook-Name vom Tagebuch-System kommen.

Gewünschter Standard:

```text
HypeTrain-Ende -> Tagebuch
Discord -> über Tagebuch-Webhook
Direkt-Discord -> aus
Rekord-Sound -> aus
Sichtbarer Discord-Name -> normaler Tagebuch-Webhook-Name, z. B. CGN Posty
```

## Geändert

```text
backend/modules/hypetrain.js
backend/modules/tagebuch.js
```

## Änderungen

### hypetrain

- `moduleVersion` auf `0.1.6` gesetzt.
- `moduleBuild` auf `STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME` gesetzt.
- `runDiaryEndAction()` sendet bei Tagebuch-Endaktionen keinen eigenen `authorDisplay` und keinen eigenen `systemUsername` mehr.
- Der Eintrag bleibt weiterhin ein Systemeintrag (`system: true`).
- Direkt-Discord und Rekord-Sound bleiben unverändert konfigurationsgesteuert.

### tagebuch

- `moduleVersion` auf `0.1.2` gesetzt.
- `moduleBuild` auf `STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME` gesetzt.
- Systemeinträge ohne `systemUsername` setzen keinen `username` mehr im Discord-Webhook-Payload.
- Dadurch nutzt Discord den normalen Webhook-Namen des Tagebuch-Webhooks.
- Systemeinträge mit explizitem `systemUsername` bleiben weiterhin möglich.

## Nicht geändert

```text
Keine Datenbankänderung
Kein Dashboard-Umbau
Kein Sound-System-Umbau
Keine direkte Discord-Aktivierung
Keine Rekord-Sound-Aktivierung
Keine Funktionalität entfernt
```

## Tests

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild

Invoke-RestMethod "http://127.0.0.1:8080/api/tagebuch/status" |
  Select-Object moduleVersion,moduleBuild
```

Erwartung:

```text
hypetrain: 0.1.6 / STEP_HT2_9_HYPETRAIN_TAGEBUCH_POSTER_NAME
tagebuch:  0.1.2 / STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

Produktiver Test nur bewusst mit bestehendem Confirm auslösen. Danach in `lastEndActions` prüfen:

```text
discord.skipped = true
diary.ok = true
recordSound.skipped = true
diary.result.posterName ist nicht mehr CGN-HypeTrain als Override
Discord sichtbarer Name kommt vom Tagebuch-Webhook
```
