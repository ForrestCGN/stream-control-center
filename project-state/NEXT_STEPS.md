# NEXT_STEPS

Stand: 2026-05-26

## Direkt nach STEP516 prüfen

1. Dashboard öffnen und prüfen, ob angezeigt wird:

```text
UI v1.0.3 · color-picker-presets-ui
```

2. Kanalpunkte-Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/eventsub/redemption/status"
```

Erwartung:

```text
moduleVersion : 0.9.4
moduleBuild   : redemption-completion-policy
lastError leer
```

3. Twitch-Management-Status prüfen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/channelpoints/twitch/manage/status"
```

Erwartung:

```text
moduleVersion : 0.9.3 oder neuer
moduleBuild   : twitch-delete-and-create-params oder neuer
```

4. Reward `Gewürzgurke` im Dashboard öffnen:

- Farbe per Picker/Preset setzen.
- `Sofort bei Twitch abschließen` bewusst prüfen.
- `Nach erfolgreicher Ausführung abschließen` bewusst prüfen.
- `Bei Fehler Punkte zurückgeben` bewusst prüfen.
- Speichern.
- Push zu Twitch testen.

## Nächster sinnvoller Arbeitsblock

### Option A: Completion Policy live gegen Twitch verifizieren

Ziel:

```text
UNFULFILLED → Aktion erfolgreich → FULFILLED
UNFULFILLED → Aktion Fehler/Blockierung → CANCELED
```

Dabei prüfen:

- Wird Twitch-Redemption nach erfolgreichem Sound wirklich `FULFILLED`?
- Werden Punkte bei Fehler wirklich zurückgegeben, wenn `CANCELED` gesetzt wird?
- Wird kein Fulfill/Cancel versucht, wenn Twitch die Redemption bereits sofort abgeschlossen hat?

### Option B: Dashboard-UX für Reward-Abschlussbegriffe finalisieren

Aktuelle Begriffe:

```text
Sofort bei Twitch abschließen
Nach erfolgreicher Ausführung abschließen
Bei Fehler Punkte zurückgeben
```

Diese Begriffe im realen Dashboard testen und ggf. Hilfetexte kürzen.

### Option C: Weitere Reward-Typen anbinden

Nach stabilem Gewürzgurke-End-to-End-Test weitere Typen planen:

- Sound/Musik-Rewards
- Overlay-/Animation-Rewards
- VIP-/Rollen-Rewards
- manuell prüfbare Rewards
- Rewards mit User-Input

## Nicht vergessen

- Keine neuen Modi/Allowlists einführen.
- Aktiv/Inaktiv bleibt die Ausführungsfreigabe.
- Bei neuen Moduländerungen Doku direkt mitpflegen.
- Bei Chatwechsel erneut „dokumentieren und aktualisieren“ ausführen.
