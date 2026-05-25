# Current System Status

## Aktueller Stand
STEP448 – VIP Bus-First kontrollierter Produktiv-Test.

## Relevante Versionen
- `backend/modules/vip_sound_overlay.js`: `1.8.30`
- `backend/modules/sound_system.js`: `0.1.20`
- VIP-Feature: `vip_bus_first_productive_test`
- Sound-Feature: `sound_bus_command_productive_play_layer`

## Ziel von STEP448
STEP448 beendet die reine Diagnose-Schleife und aktiviert einen kontrollierten produktiven VIP-Bus-Test.

Der normale VIP-Sound-Flow kann jetzt über den Sound-Bus laufen:

```text
normaler VIP-Command / VIP-Auslösung
→ VIP-Modul
→ sound_bus_command
→ Sound-System productive play route
→ Sound startet oder wird gequeued
```

## Produktiver Bus-Pfad
Neu im Sound-System:

```text
/api/sound/eventbus/command/play
```

Diese Route nimmt command-förmige Sound-Payloads entgegen und führt sie produktiv über den normalen Sound-System-Flow aus. Sie ist keine neue Admin-Test-Spielerei, sondern der produktive Bus-Consumer.

## Sicherheitsnetz
Legacy bleibt nicht mehr der Zielpfad, aber als Notausgang vorhanden:

```text
Wenn produktiver Bus fehlschlägt
→ fallback auf /api/sound/play
```

Dadurch kann live getestet werden, ohne dass VIP-Sounds komplett ausfallen, falls der Bus beim ersten Produktivtest ein Problem hat.

## Erwarteter Status
`/api/vip-sound/eventbus/sound-command/status` soll zeigen:

- `feature: vip_bus_first_productive_test`
- `productiveVipFlow: sound_bus_command`
- `normalChatCommandUsesBusFirst: true`
- `productiveSwitchEffectiveEnabled: true`
- `productiveSwitchSafetyLocked: false`
- `productiveEntryPointChanged: true`
- `legacyVipFlow: fallback_only`

## Bewusst nicht gemacht
- Kein Dashboard-Umbau.
- Keine DB-Migration.
- Keine Entfernung von Legacy-Code in diesem STEP.
- Keine Entfernung der bestehenden Admin-/Diagnosepfade in diesem STEP.
- Kein Umbau am DailyUsage-System außer normaler Nutzung nach erfolgreichem produktiven VIP-Flow.

## Nächster sinnvoller Schritt
Wenn STEP448 live stabil läuft, folgt ein Cleanup-STEP:

```text
Test-/Diagnoseballast reduzieren
Legacy-Fallback erst später entfernen
Bus als Standardpfad beibehalten
```
