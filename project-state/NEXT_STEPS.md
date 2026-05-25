# NEXT STEPS – nach STEP453

Empfohlen:

1. Einen normalen Dashboard-/Test-Alert auslösen und prüfen, ob der Alert sichtbar bleibt.
2. Danach einmal `/api/alerts/status` ansehen und prüfen, ob `alertOutput.mode` auf `legacy_and_bus` steht.
3. Wenn der Parallelbetrieb stabil ist, kann später ein kleiner STEP auf `bus_first` wechseln.

Nicht empfohlen direkt nach STEP453:

- Noch nicht auf `bus_only` wechseln.
- Legacy-Ausgabe noch nicht entfernen.
- Sound-/TTS-/Queue-Logik nicht parallel umbauen.
