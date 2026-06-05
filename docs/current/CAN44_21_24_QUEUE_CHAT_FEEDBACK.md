# CAN-44.21.24 - Queue Chat Feedback

## Ziel
Manuelle Shoutouts dürfen nicht still wirken oder ohne nachvollziehbare Rückmeldung in der Queue landen.

## Geändert
- `backend/modules/clip_shoutout.js`
- Modulversion auf `0.2.29` erhöht.
- Manuelle Display-Queue-Aufnahme berechnet jetzt eine Notice-Info:
  - Queue-Position
  - geschätzte Wartezeit
  - verbleibender Display-Cooldown
- Chatmeldung nutzt jetzt auch dann die Warteschlangenmeldung, wenn keine ältere Queue vor dem Eintrag liegt, aber der Display-Cooldown noch läuft.
- Warteschlangenmeldung enthält/fallbackt auf Wartezeit.
- `--force` bleibt ein StreamDay-/Duplikat-Override und entfernt nicht automatisch Display-Cooldowns.
- Response enthält unter `displayQueue.notice` zusätzliche Diagnosewerte.

## Nicht geändert
- Kein IFrame.
- Kein Twitch-Embed.
- Keine Player-/Overlay-Änderung.
- Keine Queue-/Cooldown-Regeln entfernt.
- Kein OBS-Direktsteuerungs-Rückfall.
- Keine Streamer.bot-Wait-Logik.

## Erwartetes Verhalten
- `!so @user` wird aufgenommen und meldet sich im Chat.
- Wenn der Shoutout warten muss, kommt eine Wartemeldung mit ungefährer Zeit.
- `!so @user --force` wird ebenfalls sauber aufgenommen und meldet sich im Chat.
- `--force` erlaubt Wiederholungen im StreamDay, umgeht aber nicht automatisch den Display-Cooldown.

## Test
```powershell
node -c backend\modules\clip_shoutout.js
.\stepdone.cmd "CAN-44.21.24 Queue Chat Feedback"
```

Danach mehrere manuelle Shoutouts nacheinander testen:

```text
!so @pretos1 --force
!so @together_not_alone --force
```

Erwartung: Beide Requests erzeugen eine Chatmeldung; der zweite steht sichtbar in der Queue, wenn Cooldown/Position ihn verzögert.
