# STEP409 – VIP EventBus Versioned Status Cleanup

Datum: 2026-05-25

## Ziel

Die VIP-EventBus-Statusausgaben wurden von dauerhaften STEP-Kennungen auf Versions-/Capability-Felder umgestellt.

STEPs bleiben weiterhin für Projektverlauf, Übergaben und Doku erlaubt. Produktive Runtime-Ausgaben sollen aber über Versionsnummern und sprechende Capability-Namen laufen.

## Geänderte Datei

- `backend/modules/vip_sound_overlay.js`

## Änderung

- Modulversion von `1.8.9` auf `1.8.10` erhöht.
- `/api/vip-sound/eventbus/status` und Alias-Route geben kein dauerhaftes `step`-Feld mehr aus.
- `feature` wurde durch klarere Runtime-Felder ersetzt:
  - `capability: "vip.sound.status_events"`
  - `statusApiVersion: "1.0.0"`
- Alte STEP-Notizen im produktiven Command-Response wurden neutralisiert:
  - `Override queued VIP sound via sound_system without daily usage.`
  - `Queued VIP sound via sound_system before writing daily usage.`

## Bewusst nicht geändert

- Kein Sound-System-Umbau.
- Keine Queue-Änderung.
- Keine Daily-Usage-Änderung.
- Keine Overlay-Änderung.
- Keine DB-Migration.
- Keine EventBus-Logikänderung.
- Keine neuen Routen.

## Test

Syntaxprüfung:

```cmd
node --check backend\modules\vip_sound_overlay.js
```

Erwartete API-Prüfung nach Backend-Neustart:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/vip-sound/eventbus/status" | ConvertTo-Json -Depth 10
```

Erwartung:

- `version` ist `1.8.10`
- `capability` ist `vip.sound.status_events`
- `statusApiVersion` ist `1.0.0`
- kein `step`-Feld in der Runtime-Statusausgabe
- EventBus-Zähler bleiben erhalten
- bestehender Sound-System-Flow bleibt unverändert

## Nächster sinnvoller Schritt

STEP410: VIP EventBus Status nach Live-Test in Doku als stabil markieren oder bei Bedarf Dashboard-/Debug-View-Auswertung für `vip.sound` planen.
