# Project-State – Overlay-Monitoring nach STEP628D

## Aktueller bestätigter Stand

Der Overlay-Monitor ist bis STEP628D aufgebaut.

Funktionierende Kernpunkte:

- OBS-Inventar als Baumstruktur
- verschachtelte Szenen werden erkannt
- aktuelle Program-Szene wird berücksichtigt
- externe Quellen und Platzhalter werden korrekt klassifiziert
- CGN-Overlays werden Bus-/Heartbeat-basiert bewertet
- Warnstatus wurde final korrigiert
- Monitoring-Issues werden dedupliziert als active/resolved geführt
- manuelle Reparaturaktionen sind vorhanden
- Reparaturbuttons sind kompakt als Icons im Dashboard sichtbar
- Sichtbarkeitsbutton ist dynamisch

## Letzter Code-Step

`STEP628D_dynamic_visibility_button_v0.1.3.zip`

Geänderte Dateien:

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`
- `project-state/STEP628D_DYNAMIC_VISIBILITY_BUTTON.md`
- `docs/current/OVERLAY_MONITORING_STEP628D.md`
- `README_STEP628D_DYNAMIC_VISIBILITY_BUTTON.md`

## Bestätigtes Verhalten

- `Kurz aus/an` funktioniert bei verschachtelten Quellen.
- Dynamischer Sichtbarkeitsbutton soll je Zustand anzeigen:
  - `🙈 Ausblenden` bei sichtbarer Quelle
  - `👁️ Einblenden` bei ausgeblendeter Quelle
- Tooltips erklären die Icon-Aktionen.

## Wichtige Vorsicht

Keine automatische Reparatur einbauen, ohne dass Forrest das ausdrücklich freigibt.
Reparaturaktionen bleiben manuell.
