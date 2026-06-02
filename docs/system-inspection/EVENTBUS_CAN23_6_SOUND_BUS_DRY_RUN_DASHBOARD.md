# EVENTBUS CAN-23.6 - Sound Bus Dry-Run Dashboard

## Zweck

CAN-23.6 macht den Sound-Bus-Dry-Run im Dashboard manuell pruefbar.

## Geaendert

```text
htdocs/dashboard/modules/bus_diagnostics.js
htdocs/dashboard/modules/bus_diagnostics.css
```

## Genutzte Route

```text
POST /api/sound/eventbus/command/dry-run
```

## Sicherheitsgrenze

```text
dry-run only
kein Sound wird abgespielt
keine Queue wird veraendert
kein Play-Test wird ausgefuehrt
keine Recovery
```

Der Button liegt im Dashboard unter:

```text
Bus-Diagnostics -> Bus-Matrix -> Sound-Bus Dry-Run
```

## Tests

```bat
node -c htdocs\dashboard\modules\bus_diagnostics.js
```

Syntax-Check war erfolgreich.
