# STEP403 VIP Overlay Preview Show/Hide Test

## Zweck

STEP403 erweitert den bestätigten STEP402-Stand minimal: Das VIP-Overlay kann ein kontrolliertes Preview-Event über den Communication-Bus anzeigen und wieder ausblenden.

## Ausgangsstand

- STEP399: VIP-Overlay ist Communication-Bus-Client.
- STEP401: `vip.overlay` Shadow-Testevent wird empfangen und bestätigt.
- STEP402: dieser Shadow-Empfang ist stabil dokumentiert.

## Änderungen

### `htdocs/overlays/vip_sound_overlay_v2.html`

- unterstützt `vip.overlay.show` im Preview-Modus
- unterstützt `vip.overlay.hide`
- unterstützt `vip.overlay.update`
- `vip.overlay.test` bleibt Shadow-only wie in STEP401
- setzt `busPreviewActive`, damit `/api/sound/status` Polling die Preview nicht sofort wieder versteckt
- echte Sound-System-Items haben weiterhin Vorrang und beenden eine Preview

### `backend/modules/communication_bus.js`

Neue Diagnose-Route:

```text
/api/communication/test-vip-overlay-preview?action=show|hide|update
```

Die Route sendet ein Bus-Event an:

```text
channel: vip.overlay
target.module: vip_sound_overlay
capability: vip.overlay.<action>
previewOnly: true
step: 403
```

## Nicht geändert

- keine Änderung am produktiven VIP-/Sound-System-Flow
- kein Sound-System-Ersatz
- keine Streamer.bot-Änderung
- kein Dashboard-Umbau

## Erfolgskriterium

- VIP-Bus-Client online
- Show-Event delivered to `vip_sound_overlay_v2`
- Show-Event Ack >= 1
- Hide-Event delivered to `vip_sound_overlay_v2`
- Hide-Event Ack >= 1
- Sound-System current/queue unverändert
- Communication-Watchdog grün
