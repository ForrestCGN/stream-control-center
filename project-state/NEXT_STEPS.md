# NEXT STEPS – nach STEP454

Empfohlen:

1. Einen normalen Dashboard-/Test-Alert auslösen und prüfen, ob der Alert sichtbar bleibt.
2. Danach einmal `/api/alerts/status` ansehen und prüfen, ob `alertOutput.mode` auf `bus_first` steht.
3. Falls Bus-First stabil läuft, kann später ein kleiner separater Cleanup-Schritt geplant werden.

Nicht empfohlen direkt nach STEP454:

- Noch nicht auf `bus_only` wechseln.
- Legacy-Fallback noch nicht entfernen.
- Sound-/TTS-/Queue-Logik nicht parallel umbauen.
