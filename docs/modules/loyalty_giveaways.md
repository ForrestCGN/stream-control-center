# Loyalty Giveaways Modul

Stand: 2026-06-08  
STEP: LWG-4K.1

## Neu

Inaktive Chat-Command-Definitionen und Chat-Multi-Texte.

## Commands

```text
!ticket
!ticket <anzahl>
!wheel
!rad
```

`!join` wird nicht verwendet.

## Aktivität

Die Commands sind eingetragen, aber nicht aktiv. Es gibt keine Twitch-Command-Ausführung in diesem Step.

## API

```text
GET  /api/loyalty/giveaways/commands
GET  /api/loyalty/giveaways/texts
POST /api/loyalty/giveaways/texts
```

## Textvarianten

CGN-/Altersheim-/Rentner-Texte werden über `helper_texts` in `module_text_variants` gesät und sind dashboardfähig.
