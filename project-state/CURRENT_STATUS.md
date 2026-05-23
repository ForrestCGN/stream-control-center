# CURRENT_STATUS

Aktueller Stand: STEP277A_FIX1 Clip-Shoutout Command Target Fix.

STEP277A ist als neues Clip-Shoutout-Modul eingebunden. Der Video-Shoutout läuft über das Sound-System und nutzt dessen Queue/Bundles. Das bestehende Clip-Shoutout-Design bleibt im Sound-System-Overlay erhalten.

STEP277A_FIX1 behebt das Command-Target-Parsing:

- `!vso @user` nutzt jetzt den genannten Zielkanal aus `target`, `input0` oder `args[0]`.
- Actor-Felder wie `login`/`userLogin` werden nicht mehr fälschlich als Zielkanal genutzt.
- Erwartbare Fehler wie `no_clips_found` liefern JSON mit HTTP 200 statt HTTP 404, damit das Command-System nicht irreführend `target_http_404` meldet.
- `lastRunAt` und `lastRun` werden auch bei erwartbaren Fehlern gesetzt.

Keine bestehende Funktionalität wurde entfernt.
