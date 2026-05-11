# NEXT STEP - Nach STEP245 DeathCounter Streamer.bot Minimal-Bridge

## Direkt in Streamer.bot umsetzen

Neue Minimal-Actions für:

```text
!rip
!tode
!dcount
```

Dabei jeweils nur FetchURL auf:

```text
/api/deathcounter/v2/command
```

Siehe:

```text
project-state/STEP245_DEATHCOUNTER_STREAMERBOT_MINIMAL_BRIDGE_2026-05-11.md
```

## Nach Streamer.bot-Umbau testen

```text
!tode
!tode @ForrestCGN
!rip ForrestCGN
!rip @ForrestCGN
!rip @ForrestCGN del
!dcount
!dcount show
!dcount hide
!dcount reset
!dcount replace @EngelCGN @RoxxyFoxxyCGN
!dcount replace @RoxxyFoxxyCGN @EngelCGN
```

## Nächster sinnvoller Bau-Step danach

```text
STEP246: DeathCounter Dashboard Spieler-Detailansicht
```

Mögliche Inhalte:

```text
- Spieler auswählen
- alle Spiele des Spielers anzeigen
- Session / Spiel gesamt / AllTime pro Spiel
- schnelle manuelle Korrekturen sauberer bedienen
```

Noch nicht empfohlen, bis Streamer.bot-Minimal-Bridge live getestet ist:

```text
- Count-/Event-DB-Migration
- Overlay-Design-Refresh
- Node-Chat-Router
```
