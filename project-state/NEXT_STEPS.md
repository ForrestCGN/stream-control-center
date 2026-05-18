# Next Steps – stream-control-center

## Loyalty / Kekskrümel

Nächster Pflichttest nach STEP207:

- Backend/Node-Neustart während aktivem Stream-State simulieren.
- Prüfen, ob AutoRunner automatisch wieder startet.
- `runner_auto_started_on_boot_live_state` in `/api/loyalty/runner/events` prüfen.

Danach nächster fachlicher Fix-Kandidat:

- Sub/Resub-Dedupe:
  - Wenn Twitch für denselben User innerhalb weniger Sekunden erst `subscribe` und dann `resub` sendet, soll nur der Resub zählen.
  - Beispiel aus Mehrtage-Auswertung: `drudchen_cgn` bekam aktuell `+50 subscribe` und `+100 resub`; korrekt wäre nur der Resub.

## DeathCounter V2

Aktuell kein weiterer Pflicht-Umbau.

Empfohlene Prüfung:

- OBS Overlay show/hide prüfen.
- `!rip` / `!del` prüfen.
- Lange Namen prüfen.
- Zusatzspieler links/rechts prüfen.

Wenn visuell nötig: nur kleine CSS-Feinschliffe, keine Funktionsänderungen.
