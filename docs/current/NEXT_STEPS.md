# NEXT_STEPS – CAN-44.21 Shoutout

## Nächster sinnvoller Schritt

Aktuellen Stand beobachten, nicht sofort weiter umbauen.

## Tests, sobald möglich

### 1. Statuscheck nach CAN-44.21.41

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,lastError,command
$s.effectiveCommandTriggers
```

Erwartung:

```text
moduleVersion : 0.2.40
command       : so
effectiveCommandTriggers:
so
vso
lastError     : leer
```

### 2. Dashboard Save-Test

Eine harmlose Shoutout-Setting-Option ändern, speichern, Dashboard hart neu laden und prüfen, ob der Wert erhalten bleibt.

Wichtig: Nicht Command/Alias im Shoutout-Dashboard erwarten. Commands werden im Commands-Dashboard gepflegt.

### 3. AutoShoutout-Minimum testen

Sobald ein kontrollierter Chat-Test möglich ist:

- Mindestnachrichten auf 3 stellen.
- Streamer schreibt normale Nachricht: zählt als 1, löst noch nicht aus.
- Zwei weitere Nachrichten: AutoShoutout darf auslösen.

### 4. AutoShoutout-Sofort-Auslöser testen

- Mindestnachrichten auf 2 oder 3 lassen.
- Streamer schreibt `!lurk`.
- Erwartung: AutoShoutout darf sofort prüfen/auslösen, wenn `instantTriggerMessagesEnabled` und `instantTriggerBypassMinMessages` aktiv sind.

### 5. OfficialQueue beobachten

Bei Twitch-/so-Block:

- Eintrag bleibt in OfficialQueue.
- manuelle Wiederholung darf erneut versuchen.
- Worker-Retrys dürfen nicht in den Chat spammen.

## Mögliche spätere Verbesserungen

- Settings-UI weiter visuell glätten, falls noch zu breit/leer.
- Hilfetexte/Tooltips weiter verfeinern, wenn Begriffe unklar bleiben.
- Optional: AutoShoutout-Trigger-Liste dashboardfähig mit Validierung und Beispielen erweitern.
- Optional: Settings-Änderungen mit Audit-Log verbinden, sobald das zentrale Rollen-/Audit-System dafür final vorgesehen ist.
