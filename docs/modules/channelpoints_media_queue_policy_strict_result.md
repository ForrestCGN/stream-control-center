# Channelpoints STEP520 – Media Queue Policy + Strict Result

Stand: v0.9.8 / Dashboard UI v1.0.4

## Ziel

Sound- und Video-Rewards sollen nicht durch das Kanalpunkte-Modul verworfen werden, wenn das Sound-System gerade belegt ist. Die Queue-Entscheidung liegt beim zentralen Sound-System.

## Änderungen

- Media-Ausführung nutzt standardmäßig die Sound-System-Queue.
- `queueIfBusy` wird für Media-Rewards nicht mehr aus alten Payloads auf `false` übernommen, außer der Reward ist explizit als Drop-Queue-Modus konfiguriert.
- `playBehavior` fällt für Sound/Video auf `queue` zurück.
- Sound-System-Ergebnis wird strikt geprüft:
  - `started=true` oder `queued=true` = Erfolg
  - `dropped=true` = Fehler
  - `ok=false` = Fehler
- Gedroppte Media-Rewards werden nicht mehr als erfolgreiche Ausführung behandelt.
- Bei `cancel_on_failure=true` kann die Twitch-Redemption anschließend auf `CANCELED` gesetzt werden.

## Dashboard

Das Feld heißt nun sinngemäß:

- Bei belegtem Sound-System einreihen
- Sofort versuchen
- Nur wenn frei

Standard für Sound/Video ist: **Bei belegtem Sound-System einreihen**.
