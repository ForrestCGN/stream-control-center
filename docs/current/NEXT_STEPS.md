# NEXT_STEPS – CAN-44 Shoutout

## Nächster sinnvoller Schritt

Aktuellen Stand beobachten, nicht sofort weiter umbauen.

Der Shoutout-Overlay-Set-Editor ist nach CAN-44.31 optisch bereinigt und vom Nutzer grundsätzlich bestätigt. Als nächstes nur testen/beobachten und bei echtem Fehler gezielt nachziehen.

## Tests, sobald möglich

### 1. Statuscheck Backend

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status"
$s | Select-Object module,moduleVersion,enabled,lastError,command
$s.effectiveCommandTriggers
```

Erwartung:

```text
command       : so
effectiveCommandTriggers:
so
vso
lastError     : leer
```

### 2. Overlay-Sets prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/overlay-sets" | ConvertTo-Json -Depth 10
```

Erwartung:

- `ok: true`
- `mode: paired_sets`
- 10 aktive Sets, wenn die neue Liste eingespielt wurde
- Headline/Subline enthalten `{displayName}` als Platzhalter

### 3. Dashboard Overlay-Set-Editor prüfen

Pfad:

```text
Community -> Shoutout -> Texte
Kategorie: Shoutout Overlay
Textkey: shoutout.overlay.sets
```

Erwartung:

- Spezialeditor statt normalem Varianteneditor
- Set-Zeilen mit ID, aktiv, Gewichtung, Headline, Subline
- keine zusätzliche Vorschau-Zeile mehr
- `Set löschen` oben rechts in der Kopfzeile

### 4. Live-/Kontrolltest mit Shoutout

Einen frischen Shoutout mit bekanntem Ziel auslösen, idealerweise mit `--force` im kontrollierten Test.

Beobachten:

- Queue bleibt stabil
- Sound-System-Overlay zeigt H15-Layout
- Headline/Subline kommen paarweise aus einem Set
- `{displayName}` wird korrekt ersetzt
- Official Twitch Shoutout bleibt unverändert

### 5. AutoShoutout-Minimum testen

Sobald ein kontrollierter Chat-Test möglich ist:

- Mindestnachrichten auf 3 stellen.
- Streamer schreibt normale Nachricht: zählt als 1, löst noch nicht aus.
- Zwei weitere Nachrichten: AutoShoutout darf auslösen.

### 6. AutoShoutout-Sofort-Auslöser testen

- Mindestnachrichten auf 2 oder 3 lassen.
- Streamer schreibt `!lurk`.
- Erwartung: AutoShoutout darf sofort prüfen/auslösen, wenn `instantTriggerMessagesEnabled` und `instantTriggerBypassMinMessages` aktiv sind.

### 7. OfficialQueue beobachten

Bei Twitch-/so-Block:

- Eintrag bleibt in OfficialQueue.
- manuelle Wiederholung darf erneut versuchen.
- Worker-Retrys dürfen nicht in den Chat spammen.

## Mögliche spätere Verbesserungen

- Overlay-Set-Editor optisch weiter glätten, falls nach längerem Gebrauch etwas stört.
- Textpaar-Liste weiter ausbauen oder saisonale Sets ergänzen.
- Optional: Import/Export-Button für Overlay-Sets im Dashboard.
- Optional: Settings-Änderungen mit Audit-Log verbinden, sobald das zentrale Rollen-/Audit-System dafür final vorgesehen ist.
