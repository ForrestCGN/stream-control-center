# FILES – STEP204.1 Twitch Sub/Gift Rule Cleanup

Stand: 2026-05-09

## Neue/aktualisierte Doku-Dateien im ZIP

```text
docs/current/STEP204_1_TWITCH_SUB_GIFT_RULE_CLEANUP.md
docs/handoffs/NEXT_CHAT_HANDOFF_STEP204_1_ALERTS_2026-05-09.md
project-state/STEP204_1_TWITCH_SUB_GIFT_RULE_CLEANUP_2026-05-09.md
project-state/FILES_STEP204_1_ALERTS_2026-05-09.md
project-state/NEXT_STEPS_STEP204_1_ALERTS_2026-05-09.md
tools/test_step204_1_twitch_sub_gift_final.ps1
```

## Live-DB-Regeln betroffen

Diese Regeln wurden per Alert-API/Dashboard angepasst, nicht als DB-Datei committed:

```text
alert_rules ID 55
alert_rules ID 56
alert_rules ID 54
alert_rules ID 39
alert_rules ID 40
alert_rules ID 61
```

## Nicht enthalten

```text
Keine app.sqlite
Keine Secrets
Keine .env
Keine Tokens
Keine Backups
Keine temporären JSON-Exports
```
