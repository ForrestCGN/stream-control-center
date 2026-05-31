# STEP626D – Rahmen frame_overlay Mapping

## Ziel

Der OBS-Quellenstatus zeigte die sichtbare Quelle `Rahmen` weiterhin mit `Bus fehlt`, obwohl im Bus-Client-Tab der Client `overlay:frame_overlay` online war und Heartbeats sendete.

## Ursache

Technisch sendete `_rahmen.html` korrekt Heartbeats, aber das Dashboard konnte die OBS-Quelle `Rahmen` nicht robust genug dem Bus-Client `overlay:frame_overlay` zuordnen.

## Änderung

Geändert wurde nur:

- `htdocs/dashboard/modules/overlays.js`

Ergänzt wurde ein robuster Forced-Mapping-Schritt vor dem normalen Scoring:

- OBS-Quelle/URL/Dateiname mit `Rahmen` oder `frame_overlay`
- wird zuerst auf Bus-Clients mit `frameoverlay` oder `rahmenoverlay` geprüft
- erst danach greift das normale heuristische Matching

## Nicht geändert

- keine Backend-Änderung
- keine DB-Änderung
- keine OBS-Aktion
- keine Reparaturbuttons
- kein Rahmen-Design-Update
- keine Änderung an `_rahmen.html`

## Erwartung

Nach hartem Dashboard-Reload sollte die Quelle `Rahmen` im Quellenstatus mit Bus online und Heartbeat OK angezeigt werden, sofern `overlay:frame_overlay` weiter online ist.
