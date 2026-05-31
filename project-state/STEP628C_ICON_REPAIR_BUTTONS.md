# STEP628C – Icon-Reparaturbuttons mit Tooltips

Status: bereitgestellt
Basis: STEP628B – Verschachtelte OBS-Reparaturaktionen

## Kurzfassung

Der Overlay-Monitor zeigt Reparaturaktionen nun kompakt als Icon-Buttons direkt im Quellenstatus und in den Overlay-Details. Dadurch bleiben die Karten auf kleineren Bildschirmen übersichtlicher und die Aktionen sind schneller erreichbar.

## UI

Icon | Aktion
--- | ---
↻ | Browserquelle neu laden
🧹 | Browsercache neu laden
⏻ | Quelle ein-/ausblenden
⚡ | Quelle kurz aus/an

Die Erklärung steht als Hover-Tooltip und zusätzlich als `aria-label` am Button.

## Regeln

- Platzhalter wie `about:blank` erhalten keine Reparaturbuttons.
- Aktionen bleiben vollständig manuell.
- Sichtbare Quellen nutzen weiter die Sicherheitsabfrage aus STEP628B.
- Nach der Aktion wird der Status neu geladen.

## Geänderte Dateien

- `htdocs/dashboard/modules/overlays.js`
- `htdocs/dashboard/modules/overlays.css`
