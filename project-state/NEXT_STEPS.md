# NEXT STEPS

Stand: EVS-3 / Stream Events Dashboard Skeleton
Datum: 2026-06-13

## Sofort nach Entpacken

Syntax pruefen:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Danach vor Dashboard-/Live-Test unbedingt:

```powershell
.\stepdone.cmd "EVS-3 Stream Events Dashboard Skeleton"
```

Erst danach Live-System/Dashboard testen.

## Dashboard-Test nach StepDone

```text
Dashboard -> Community -> Event-System
```

Testfolge:

1. Event-System oeffnen
2. Neues Event erstellen
3. Sound und/oder Text aktivieren
4. Gewaehlten Spieltyp konfigurieren
5. Speichern
6. Validierung ansehen
7. Start/Finish/Cancel nur mit Test-Event pruefen

## Naechster fachlicher Arbeitsblock

### EVS-4 – Sound-Spiel Backend / Rotation

Ziel:

- Sound-Snippet-Konfiguration sauberer als eigene Backend-Struktur vorbereiten
- Eventbezogene Snippet-Rotation
- korrekt erkannt -> aus aktueller Rotation entfernen / erkannt markieren
- nicht erkannt -> je nach Config erneut einreihen oder entfernen
- direkte Wiederholung vermeiden
- Statistikgrundlage vorbereiten

Noch nicht:

- kein automatisches Sound-Playback
- kein Video-Playback
- keine Twitch-Chat-Auswertung

## Danach

### EVS-5 – Text-Spiel Backend

- Phrase-Hunt-Konfiguration
- Hinweiswoerter/Tokens
- Loesungserkennung vorbereiten

### EVS-6 – Twitch-Chat Subscriber

- `twitch.chat.message` nur bei aktivem Event/Spiel konsumieren
- bestehende Command-/Twitch-Flows nicht stoeren

### EVS-7 – Overlay/Playback

- zentrales Event-Overlay
- Sound/Video ueber vorhandenes Sound-/Media-System, soweit moeglich

