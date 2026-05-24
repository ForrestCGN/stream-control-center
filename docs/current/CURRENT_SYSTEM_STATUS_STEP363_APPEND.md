# CURRENT SYSTEM STATUS - STEP363 Append

## Alert / SoundBus / Overlay-Reconnect

Status: bestätigt

STEP360 wurde durch zwei STEP362-Live-Watch-Logs erfolgreich validiert.

Bestätigter Ablauf:

- Laufender Alert aktiv
- OBS-Alert-Browserquelle währenddessen aktualisiert
- Overlay meldet `hello`
- Alert-System sendet laufenden Alert per `reconnect_resend` erneut an den reconnecteten Overlay-Client
- Sound/TTS wird nicht neu gestartet
- Queue bleibt unverändert
- Watchdog bleibt sauber

Damit ist der ursprüngliche Kernfehler "Sound läuft, Overlay kann nach Reload/reconnect verloren sein" für den geprüften Reconnect-Fall abgefangen.

## Beobachtung für nächsten Schritt

Bei einem Test war `currentStatus=playing` noch sichtbar, nachdem `currentSound` bereits leer war.
Das kann korrekt sein, wenn die visuelle Alert-Dauer länger ist als die Sound-Dauer.
Nächster Prüfschritt sollte daher der Alert-Lifecycle nach Ende sein.
