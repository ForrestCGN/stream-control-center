# Commands – STEP220 / LWG-6.1

Die Command-Bridge aus STEP214 bleibt Grundlage:

- Modul-Command ausführen
- `result.message` auswerten
- zentrale Chat-Ausgabe über `twitch_presence.sendChatMessage(...)`
- Ergebnis als `chatReply` in `command_execution_log`

Für STEP220 wird `!gamble` nur temporär durch das Testscript aktiviert und anschließend wiederhergestellt. Eine dauerhafte Live-Freigabe erfolgt erst in einem späteren STEP.
