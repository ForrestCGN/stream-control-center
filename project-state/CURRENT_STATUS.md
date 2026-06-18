# CURRENT_STATUS

## Shot-Alarm

Aktueller Stand: `SHOT-ALARM-2A Aggregated Draw Overlay Counter`

- Backend-Modul `shot_alarm` Version 0.2.0.
- Communication-Bus-Consumer für Twitch-Support-Events aktiv.
- Auslosung pro Support-Event wird gebündelt.
- 10 Sekunden Auslosungsphase vor Ergebnis.
- Ergebnis erhöht `shotsOpen` erst nach der Auslosung.
- Overlay oben: kleine Ergebnis-/Auslosungskarte.
- Overlay unten: dezente permanente Statusleiste mit offen/getrunken/gesamt.
- Chat-Texte im Altersheim-/Heimleitungsstil über Config-Textpools.
- Sound nur einmal pro Treffer-Ergebnis.

Ko-fi/Tipeee sind vorbereitet, aber noch nicht produktiv über Payment-Bus angebunden.
