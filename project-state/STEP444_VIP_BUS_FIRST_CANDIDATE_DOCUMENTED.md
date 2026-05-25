# STEP444 – VIP Bus-First Admin-Test als stabiler Kandidat dokumentieren

## Status
Dokumentations-/Status-STEP. Keine neue Funktionslogik.

## Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.26`
- `backend/modules/sound_system.js`: `0.1.19`
- Feature: `vip_bus_first_no_legacy_admin_test`

## Ausgangslage
STEP443 wurde erfolgreich getestet. Der explizite Admin-Testpfad kann einen VIP-Sound im Modus `bus_enabled` über den Bus-First-Play-Test starten, ohne Legacy-Fallback zu verwenden.

Bestätigte Testwerte aus STEP443:

```text
accepted: True
reason: accepted_vip
busFirstTest: True
busFirstTestApplied: True
noLegacyFallback: True
busFirstOnly: True
legacyFallbackAllowed: False
legacyFallbackUsed: False
legacyQueueSkippedForBusFirstTest: True
soundSystemQueued: True
soundSystemStarted: True
vipBusMode: bus_enabled
runtimeVipBusMode: bus_enabled
effectiveSoundEntryPoint: sound_system_play_test
dailyUsageWritten: False
```

Sound-Bus-Command-Auswertung:

```text
ok: True
accepted: True
playedOrQueued: True
started: True
queued: False
queueTouched: False
audioTouched: True
normalizedSoundId: adoredpenny
normalizedFile: vip/adoredpenny.mp3
noLegacyFallback: True
legacyFallbackAllowed: False
legacyFallbackUsed: False
```

Sound-System-Status:

```text
playTestOk: 1
playTestFailed: 0
lastAction: play.request.play_test
lastError:
lastSoundId: vip/adoredpenny.mp3
```

## Bewertung
Der Bus-First-Admin-Testpfad ist damit ein stabiler Kandidat für eine spätere, kontrollierte Produktiv-Umschaltung.

Wichtig: Diese Umschaltung ist in STEP444 nicht enthalten. Der normale Chat-Command bleibt unverändert auf dem bestehenden Legacy-Flow.

## Nicht geändert
- Kein produktiver Bus-Default.
- Kein normaler Twitch-Command-Umbau.
- Kein DailyUsage-Schreiben im Admin-Test mit `consumeDaily=false`.
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Änderung an Legacy `/api/sound/play`.
- Keine Änderung an `sound_system.js` oder `vip_sound_overlay.js` gegenüber STEP443.

## Tests

```powershell
cd D:\Git\stream-control-center
node --check backend\modules\vip_sound_overlay.js
node --check backend\modules\sound_system.js
```

## Abschluss

```powershell
.\stepdone.cmd "STEP444 VIP Bus-First Candidate Documented"
```

## Nächster sinnvoller Schritt
STEP445 sollte vor einer echten Produktiv-Umschaltung zunächst nur einen konfigurierbaren, standardmäßig deaktivierten Schalter oder einen Dashboard-Testschalter vorbereiten.

Empfohlene Sicherheitsvorgaben für STEP445:

- Default bleibt Legacy.
- Bus-First wird nicht automatisch produktiv.
- Guard bleibt aktiv.
- Rollback auf Legacy bleibt jederzeit möglich.
- DailyUsage bleibt unverändert, bis separat getestet.
