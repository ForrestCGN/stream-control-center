# Current Status – Loyalty Glücksrad / Giveaways

Aktueller Step: LWG-4N.1b – Giveaway Setup-Readiness und Open-Guard.

## Bestätigte Linie

- Presets-Tab bleibt vorerst Presets.
- Es soll einen gemeinsamen Preset-Editor geben.
- Dieser Editor wird im Presets-Tab und im Giveaway-Kontext wiederverwendet.
- Giveaways können als Entwurf gespeichert werden, auch wenn noch Pflichtdaten fehlen.
- Öffnen/Aktivieren ist nur erlaubt, wenn das Setup vollständig ist.

## LWG-4N.1b

Backend und Dashboard berechnen/zeigen jetzt einen dynamischen Setup-Status:

- `setupComplete`
- `setupState`
- `canOpen`
- `setupIssues`

Wheel-Giveaways ohne Glücksrad bleiben speicherbar, werden aber als unvollständig markiert und können nicht geöffnet werden.
