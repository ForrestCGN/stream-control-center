# CURRENT_STATUS

## STEP462 aktiv

Clip-Shoutout / VSO läuft im Reparaturstand:

- Modul: `clip_shoutout`
- Runtime-Version: `0.2.5`
- Test-Command bleibt: `!vso`
- Display-Queue aktiv
- Display-Cooldown: 120 Sekunden nach Ende der Anzeige
- Direkter Chat-Command-Bypass aktiv, damit `!vso` dieselbe Modulroute nutzt wie `/api/clip-shoutout/run`
- Event-Bus bleibt aktiv: `shoutout.system`

## Nächster Test

```text
!vso @urlug
!vso @bynexl
```

Erwartung:

- urlug startet
- bynexl wird direkt angenommen und wartet
- bynexl startet erst nach urlug-Ende + 120 Sekunden
