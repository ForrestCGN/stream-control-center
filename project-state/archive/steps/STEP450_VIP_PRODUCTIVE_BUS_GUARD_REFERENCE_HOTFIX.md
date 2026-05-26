# STEP450 – VIP Productive Bus Guard Reference Hotfix

## Ausgangslage

STEP449 war aktiv geladen, aber der direkte Backend-Test auf `/api/vip-sound/command` scheiterte mit:

```text
{"ok":false,"error":"guard is not defined"}
```

Damit war klar: Der Request erreicht das Backend, aber im VIP-Modul bricht der produktive Command-Flow durch eine fehlerhafte Guard-Referenz ab.

## Änderung

In `buildVipSoundBusCommandPayload(...)` wird jetzt lokal ein `guard` aufgebaut:

- bevorzugt aus `context.busModeGuard`
- sonst per `buildVipBusModeGuard(getRuntimeVipBusMode(), "payload")`

Damit kann die bestehende Schutz-/Diagnose-Struktur weiterhin `guard.productiveBusAllowed` nutzen, ohne einen Runtime-Fehler zu werfen.

## Bewusst nicht geändert

- keine neue Bus-Route
- kein neuer Admin-Testpfad
- kein neuer Diagnoseballast
- keine Änderung an `sound_system.js`
- keine DB-Migration
- kein Dashboard-Umbau

## Erwartung

Der direkte Backend-Test auf `/api/vip-sound/command` soll nicht mehr mit `guard is not defined` abbrechen. Danach muss geprüft werden, ob der produktive Bus-Consumer aufgerufen wird und `productivePlayChecks` steigt.
