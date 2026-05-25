# NEXT_STEPS – nach STEP405

## STEP406 – VIP EventBus Status Check / Dashboard-Readiness

Ziel: prüfen, ob die neuen `vip.sound` Status-Events sauber im Communication/EventBus auftauchen und ob sie später im Dashboard angezeigt werden sollen.

## Prüfen

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/communication/status"
```

## Testfälle

1. Berechtigter VIP löst Sound aus.
2. Berechtigter Mod löst Sound aus.
3. User ohne VIP/Mod versucht Sound.
4. Duplicate am selben Tag.
5. Fehlende Sounddatei.
6. EventBus temporär nicht verfügbar.

## Erwartung

- Sound-System-Verhalten bleibt unverändert.
- VIP-Sound wird weiterhin über `/api/sound/play` verarbeitet.
- `eventBus.emitted`, `eventBus.skipped` oder `eventBus.errors` ändern sich passend.
- Kein sichtbares Overlay-Verhalten ändert sich.

## Noch nicht umsetzen ohne neuen STEP

- Keine Dashboard-Seite bauen.
- Keine DB-Migration.
- Keine Bus-only-Steuerung.
- Keine Overlay-Produktivsteuerung per `vip.overlay.show`.
