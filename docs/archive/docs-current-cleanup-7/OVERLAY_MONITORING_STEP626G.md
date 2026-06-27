# Overlay Monitoring – STEP626G

STEP626G korrigiert die finale Statusbewertung des OBS-Inventars.

## Regeln
- CGN-Overlay + Bus-Client + Heartbeat OK = OK.
- CGN-Overlay sichtbar + kein Bus oder kein Heartbeat = Warnung.
- Nicht aktive/nicht sichtbare CGN-Overlays = Inaktiv/Wartet.
- Externe Quellen = Extern, kein Bus nötig.
- Platzhalter/about:blank = Platzhalter, kein Bus nötig.

## Hinweis
Alte persistierte Inventarstände werden beim Lesen normalisiert, damit alte `warning`-Statuswerte nicht dauerhaft im Dashboard stehen bleiben.
