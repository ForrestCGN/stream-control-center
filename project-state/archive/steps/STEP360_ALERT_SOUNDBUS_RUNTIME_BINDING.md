# STEP360 – Alert SoundBus Runtime Binding

Stand: 2026-05-24

## Ziel

Alert-System an den fertigen SoundBus-/Sound-System-Stand anbinden, ohne neue Baustellen zu öffnen.

Konkret:

- Sound-System bleibt zuständig für Sound, Queue, Bundle und Playback.
- Alert-System bleibt zuständig für Alert-Inhalt und visuelle Ausgabe.
- Wenn ein Alert bereits läuft und das Alert-Overlay neu verbindet, bekommt genau dieses Overlay den laufenden Alert erneut.
- Sound/TTS wird dabei nicht neu gestartet.
- Queue wird dabei nicht verändert.

## Geänderte Datei

```text
backend/modules/alert_system.js
```

## Änderungen

### 1. MODULE_STEP

```text
350 -> 360
```

### 2. Overlay-Reconnect-Resend

Neue Runtime-Funktion:

```text
resendCurrentAlertToOverlayClient(ws, reason)
```

Verhalten:

- läuft nur, wenn `state.current` existiert und Status `playing` ist
- sendet den aktuellen Alert nur an den neu verbundenen WebSocket-Client
- setzt `recovery: true` und `replay: true`
- ändert Sound/TTS/Queue nicht
- schreibt eine kleine Runtime-Recovery-Info in den Event-Payload
- aktualisiert vorhandene Overlay-Delivery-Recovery-Felder, falls vorhanden

### 3. WebSocket `hello`

Wenn ein Alert-Overlay `hello` sendet:

1. Status-Antwort wie bisher
2. danach, falls ein Alert läuft, erneutes Senden des laufenden Alerts an genau dieses Overlay

### 4. Catch-Fixes

Zwei alte Catch-Blöcke haben undefinierte Variablen verwendet:

```text
bundleId
items
```

Betroffen:

- `playLiveAlertSound`
- `playAlertTtsSound`

Diese Fehler wurden ohne Ablaufänderung entfernt.

## Bewusst nicht geändert

- kein Dashboard
- kein Sound-System
- keine Sound-Queue
- kein activeBundleLock
- keine DB-Migration
- kein bus_only
- keine Legacy-Entfernung
- keine Alert-Regel-/Asset-Logik

## Syntaxcheck

```powershell
node --check backend\modules\alert_system.js
```

Erwartung: keine Ausgabe / Exitcode 0.

## Testidee

1. Backend mit STEP360 starten.
2. Alert starten, der lange genug läuft.
3. Während der Alert läuft, OBS-Browserquelle für das Alert-Overlay aktualisieren.
4. Erwartung:
   - Overlay bekommt den laufenden Alert erneut.
   - Sound/TTS startet nicht erneut.
   - Queue bleibt unverändert.
   - `/api/alerts/status` zeigt `step = 360`.

## Abschlussbefehl

```powershell
cd D:\Git\stream-control-center
.\stepdone.cmd "STEP360 Alert Overlay Reconnect Runtime Binding"
```
