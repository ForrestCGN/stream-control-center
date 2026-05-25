# Current System Status – STEP430

STEP430 ergänzt im Sound-System eine explizite Play-Test-Route für Bus-förmige Sound-Commands.

Produktiv bleibt unverändert:
- VIP nutzt weiterhin den bestehenden Legacy-Sound-System-API-Flow.
- Alert nutzt weiterhin den bestehenden Alert-/Sound-Bundle-/Overlay-Flow.
- Der Communication Bus steuert weiterhin nicht automatisch produktiv.

Neue Test-Route:
- `/api/sound/eventbus/command/play-test`

Diese Route ist bewusst explizit und dient nur zum manuellen Funktionstest des Command-Consumers.
