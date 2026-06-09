# Loyalty Giveaways – Setup-Readiness und Statusanzeige

## Setup-Readiness

Giveaways dürfen als Entwurf gespeichert werden, auch wenn noch Pflichtdaten fehlen. Öffnen/Aktivieren ist nur möglich, wenn `setupComplete = true` ist.

Das Backend liefert dazu:

- `setupComplete`
- `setupState`
- `canOpen`
- `setupIssues`

## Dashboard-Anzeige

Ab LWG-4N.1c werden technische Statuswerte in der Oberfläche deutsch angezeigt.

Beispiele:

- `draft` → `Entwurf`
- `open` → `Offen`
- `closed_for_entries` → `Teilnahme geschlossen`
- `finished` → `Beendet`

Der Setup-Status `Unvollständig` wird orange dargestellt, damit Mods/Streamer sofort sehen, dass dieses Giveaway noch nicht geöffnet werden kann.

## Technische Werte

Die technischen API-Werte bleiben unverändert. Nur die sichtbare Darstellung im Dashboard wurde lokalisiert.
