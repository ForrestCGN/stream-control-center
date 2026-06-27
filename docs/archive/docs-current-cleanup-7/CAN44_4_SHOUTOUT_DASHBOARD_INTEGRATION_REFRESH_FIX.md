# CAN-44.4 – Shoutout-Dashboard Integration + Refresh-Fix

## Ziel

Auto-Shoutouts sind ab diesem Stand im bestehenden Shoutout-System verankert. Die separate Dashboard-Insel wird nicht mehr als eigener Navigationspunkt benötigt; stattdessen erscheint im Shoutout-System ein Tab **Auto-Shoutouts**.

## Änderungen

### Backend

Datei: `backend/modules/clip_shoutout.js`

- Version auf `0.2.17` erhöht.
- Auto-SO-Nachrichten werden robuster normalisiert.
- Meldungen, die eine Wartezeit brauchen, aber kein `{waitTime}` enthalten, fallen auf den sicheren Standardtext zurück.
- Korrigiert damit bestehende DB-Werte wie `Wartezeit:.` für `waitingStartScene` ohne Datenverlust.
- Start-Szene-Sperre bleibt aktiv:
  - DisplayQueue startet nicht während Start-Szene.
  - OfficialQueue sendet nicht während Start-Szene.
  - Wartende Einträge werden mit `waiting_start_scene` geparkt und nach `retryMs` erneut geprüft.

### Dashboard

Dateien:

- `htdocs/dashboard/index.html`
- `htdocs/dashboard/modules/auto_shoutout.js`
- `htdocs/dashboard/modules/auto_shoutout.css`

Änderungen:

- Auto-Shoutouts werden als Tab im vorhandenen Shoutout-System angezeigt.
- Der separate Dashboard-Panel-Eintrag wurde aus `index.html` entfernt.
- `auto_shoutout.js` arbeitet als Erweiterung des Shoutout-Moduls.
- Auto-Refresh überschreibt keine Eingaben mehr:
  - Bei fokussierten Formularfeldern wird der automatische Refresh pausiert.
  - Bei ungespeicherten Änderungen (`dirty`) wird kein Re-Render ausgelöst.
  - Nach dem Speichern wird neu geladen und der Dirty-Status zurückgesetzt.
- Dashboard zeigt klar, dass Start-Szene-Sperre Queues parkt und danach mit normalen Wartezeiten weiterläuft.

## Verhalten während Start-Szene

Wenn die aktuelle OBS-Szene in den konfigurierten Start-Szenen steht:

1. Auto-SO kann erkannt und vorgemerkt werden.
2. DisplayQueue startet keinen Clip-Shoutout.
3. OfficialQueue sendet keinen Twitch-Shoutout.
4. Queue-Einträge bleiben `waiting`.
5. Nach dem Szenenwechsel wird nicht alles gleichzeitig gestartet.
6. Die normalen Queue-Zeiten/Cooldowns bleiben gültig:
   - DisplayQueue-Abstand
   - Official global cooldown
   - Official target cooldown
   - Auto-SO cooldown

## Test

Nach dem Entpacken:

```powershell
cd D:\Git\stream-control-center
node -c backend\modules\clip_shoutout.js
node -c htdocs\dashboard\modules\auto_shoutout.js
.\stepdone.cmd "CAN-44.4 Shoutout-Dashboard Integration + Refresh-Fix"
```

Danach Node neu starten und Dashboard hart neu laden.

Prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/scene-gate" |
  ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/auto" |
  ConvertTo-Json -Depth 8
```

## Rollback

Rollback auf CAN-44.3 möglich durch Wiederherstellen der vorherigen Dateien aus `CAN44_3_auto_shoutout_ux_scene_gate.zip`.
