# Stream Events – EVS52.21 Ergänzung

EVS52.21 ergänzt die Dashboard-Bedienung für Gewinner-Finale/Replays.

## Finale-Buttons

Die Dashboard-Aktion wird je nach Finale-State angezeigt:

- `🏆 Auswertung starten`: Event ist beendet, Ranking vorhanden, kein Finale existiert.
- `⏹ Finale beenden`: Finale ist aktiv und Overlay bleibt sichtbar.
- `🔁 Auswertung erneut abspielen`: Finale existiert bereits, ist aber nicht aktiv.

Replay nutzt die vorhandene `finale/start?confirm=1` Route und erzeugt keine neue Auslosung.
