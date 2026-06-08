# Loyalty Games Modul

Stand: 2026-06-08  
STEP: LWG-4F.1

## Bus-Standard

`loyalty_games` nutzt direkt den vorhandenen Communication-/CanBus:

```text
require("./communication_bus").getBus()
```

Das Modul registriert sich als:

```text
module:loyalty_games
```

und sendet Heartbeats/Status ueber die vorhandenen Bus-Funktionen.
