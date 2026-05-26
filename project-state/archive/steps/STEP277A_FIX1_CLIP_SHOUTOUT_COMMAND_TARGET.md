# STEP277A_FIX1 Clip-Shoutout Command Target Fix

## Ziel

`!vso @user` soll den genannten Zielkanal verwenden und nicht den auslösenden Chat-User.

## Ursache

Das Command-System sendet im Payload auch Actor-Felder wie `login`/`userLogin` für den auslösenden User. STEP277A hat diese Felder zu früh als Zielkandidat gelesen. Dadurch wurde z. B. `!vso @urlug` als Ziel `forrestcgn` interpretiert.

Zusätzlich wurden erwartbare Modulfehler wie `no_clips_found` mit HTTP 404 beantwortet. Das Command-System protokollierte deshalb `target_http_404`, obwohl die Route technisch erreichbar war.

## Änderung

- `parseTarget()` priorisiert jetzt echte Zielwerte:
  - `target`
  - `targetLogin`
  - `shoutUser`
  - `channelTarget`
  - `input0`
  - `args[0]`
  - danach erst Raw-Input/Text/Message
- Actor-Felder wie `login`/`userLogin` werden nicht mehr als Ziel verwendet.
- `target_required`, `target_user_not_found` und `no_clips_found` werden als normale JSON-Antwort mit HTTP 200 zurückgegeben.
- `lastRunAt`/`lastRun` werden auch bei erwartbaren Fehlern gesetzt.
- `lastRun.input` zeigt Debug-Werte, um künftige Payload-Probleme schneller zu erkennen.

## Nicht geändert

- Keine Änderung am Sound-System.
- Keine Änderung am Overlay-Design.
- Keine Änderung an der TTS-Logik.
- Keine bestehende Funktionalität entfernt.

## Test

Syntax:

```cmd
node --check backend\modules\clip_shoutout.js
```

Erwartung nach Entpacken/Backend-Neustart:

```text
/api/clip-shoutout/status
→ step: STEP277A_FIX1
→ version: 2
```

Chat-Test:

```text
!vso @urlug
```

Danach prüfen:

```text
/api/clip-shoutout/status
```

`lastRun.target.login` oder `lastRun.targetLogin` muss `urlug` sein.
