# VIP – STEP404 Preview Show/Hide Stable

## Zusammenfassung

Der VIP-Overlay-Event-Bus-Pfad wurde bis zur sichtbaren Preview bestätigt.

Das Overlay kann jetzt im Testmodus über den Communication-Bus angezeigt und ausgeblendet werden, ohne den produktiven Sound-System-Flow zu verändern.

## Bestätigter Flow

```text
/api/communication/test-vip-overlay-preview?action=show
→ Communication-Bus Event
→ vip_sound_overlay_v2
→ Overlay zeigt Preview sichtbar
→ bus_ack

/api/communication/test-vip-overlay-preview?action=hide
→ Communication-Bus Event
→ vip_sound_overlay_v2
→ Overlay blendet aus
→ bus_ack
```

## Sicherheitsgrenzen

STEP404 ist kein Produktionswechsel.

Weiterhin gilt:

- VIP-Sounds laufen über das Sound-System.
- Das VIP-Overlay reagiert produktiv auf `sound_system` Events und `/api/sound/status`.
- `vip.overlay.show/hide` ist aktuell Preview-/Testpfad.
- Keine bestehende Funktionalität darf entfernt werden.

## Relevante Clients

```text
vip_sound_overlay_v2:vip_sound_overlay:overlay:online
alert_overlay_v2_shadow:alert_system:overlay:online
```

## Relevante Checks

- VIP Overlay URL erreichbar: `/overlays/vip_sound_overlay_v2.html`
- VIP Bus Client online
- Show Ack vorhanden
- Hide Ack vorhanden
- Sound Queue bleibt 0
- Communication Watchdog issueCount 0
