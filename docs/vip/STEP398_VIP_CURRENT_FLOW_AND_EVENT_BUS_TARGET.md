# VIP System – aktueller Iststand vor Event-Bus-Anbindung

## Kurzfassung

Das VIP-System besteht aktuell aus vier Schichten:

1. Backend-Modul `vip_sound_overlay.js`
2. Sound-System-Integration über `/api/sound/play`
3. OBS Overlay `vip_sound_overlay_v2.html`
4. Dashboard-Modul `vip.js` + `vip.css`

## Bestehender Ablauf

```text
Trigger
→ VIP Backend
→ Sound-System Play Request
→ Sound-System Lifecycle
→ VIP Overlay reagiert auf Sound-System Event/Status
```

## Entscheidender Mechanismus

Das Overlay prüft Sound-System-Items auf:

```text
visual.module === "vip_sound_overlay"
```

Nur solche Items lösen die VIP-Anzeige aus.

## Warum nicht direkt umbauen?

Der bestehende Ablauf ist sinnvoll, weil der Sound-System-Start der tatsächliche Startpunkt ist. Dadurch erscheint das VIP-Overlay synchron zum echten Sound-Start und nicht bereits beim reinen Queueing.

## Saubere Event-Bus-Erweiterung

Die Event-Bus-Anbindung sollte daher nicht den Sound-System-Pfad ersetzen, sondern zusätzliche Sichtbarkeit/ACK/Diagnose liefern:

- Overlay meldet sich als `vip_sound_overlay` Bus-Client.
- Backend kann `vip.overlay` Events shadow-senden.
- Overlay bestätigt Empfang.
- Watchdog/Status kann prüfen, ob VIP-Overlay online ist.
- Sound-System bleibt führend für Playback-Lifecycle.

## Risiken

- Doppelte Anzeige, wenn Sound-System und Bus unabhängig `show` auslösen.
- Verfrühte Anzeige, wenn Bus-Event vor echtem Sound-Start kommt.
- Doppelte Hide-Events, wenn Sound-System und Bus beide beenden.

## Deshalb für STEP399

Shadow-Modus mit Dedup über `requestId`/`soundRequestId`, kein produktiver Wechsel.
