# CAN-42.34 Loaded dashboard extensions review

## Ziel

Die nach CAN-42.30/31 noch aktiv geladenen Dashboard-Extensions wurden geprüft.

Dieser Schritt löscht nichts und verändert keinen Code.

## Grundlage

Aktuell werden diese Extension-Dateien weiterhin in `htdocs/dashboard/index.html` geladen:

- `overlay_monitor_safety_ext.css/js`
- `bus_diagnostics_readonly_summary.css/js`
- `bus_diagnostics_subpage_safety_ext.css/js`
- `message_rotator_diagnostics_ext.css/js`
- `hug_diagnostics_ext.css/js`
- `commands_readonly_diagnostics.css/js`

## Ergebnis

### 1. `commands_readonly_diagnostics.*`

Status: **behalten, aber später integrieren prüfen**

Begründung:

- Wird auf dem Commands-Modul im Diagnose-Tab aktiv.
- Nutzt ausschließlich Read-only-Endpunkte:
  - `/api/commands/status`
  - `/api/commands/list`
  - `/api/commands/catalog`
  - `/api/commands/logs`
  - `/api/commands/history`
  - `/api/commands/media-command-preview`
- Blockiert/markiert produktive Routen wie Upsert/Delete/Execute ausdrücklich als nicht genutzt.
- Registriert `window.CGNCommandsReadonlyDiagnostics`.

Bewertung:

- Aktuell sinnvoll als zusätzliche Sicherheits-/Read-only-Karte.
- Sollte später entweder in `commands.js` integriert oder als bewusst dokumentierte Extension behalten werden.

### 2. `hug_diagnostics_ext.*`

Status: **behalten, aber später integrieren prüfen**

Begründung:

- Wird nur im Hug-Diagnose-Tab aktiv.
- Ruft mehrere GET-/Read-only-Routen ab:
  - `/api/hug/status`
  - `/api/hug/routes`
  - `/api/hug/integration-check`
  - `/api/hug/admin/text-pairs`
  - `/api/hug/admin/hug-all-texts`
  - `/api/hug/admin/response-texts`
  - `/api/hug/admin/top-title-texts`
- Listet produktive Routen ausdrücklich als blockiert.
- Fügt eine erweiterte Read-only-Diagnosekarte ein.
- Registriert `window.CGNHugDiagnosticsExt`.

Bewertung:

- Fachlich noch nützlich, weil Hug viele Text-/DB-/Admin-Readonly-Infos hat.
- Später Integrationskandidat in `hug.js`, wenn die Hug-Seite stabil konsolidiert wird.

### 3. `message_rotator_diagnostics_ext.*`

Status: **behalten, aber später integrieren prüfen**

Begründung:

- Wird im Message-Rotator-Diagnose-Tab aktiv.
- Nutzt ausschließlich:
  - `/api/message-rotator/status`
  - `/api/message-rotator/routes`
  - `/api/message-rotator/integration-check`
- Markiert Start/Stop/Tick/Next/Manual/Reload/Admin-POST als blockiert.
- Registriert `window.CGNMessageRotatorDiagnosticsExt`.

Bewertung:

- Noch nützlich als Sicherheits-/Read-only-Erweiterung.
- Später guter Kandidat für Integration in `message_rotator.js`.

### 4. `bus_diagnostics_readonly_summary.*`

Status: **behalten**

Begründung:

- Sicherheitsrelevante Zusammenfassung direkt für die Bus-Diagnose.
- Lädt:
  - `/api/bus-diagnostics/status`
  - `/api/bus-diagnostics/recovery-preflight`
- Prüft sichtbar, ob Flow/Queue/Sound/Overlay/Recovery nicht produktiv berührt wurden.
- Registriert `window.CGNBusDiagnosticsReadonlySummary`.

Bewertung:

- Sollte vorerst separat bleiben.
- Diese Datei ist safety-relevant und nicht nur kosmetisch.

### 5. `bus_diagnostics_subpage_safety_ext.*`

Status: **behalten**

Begründung:

- Fügt Safety-Hinweise in Bus-Diagnose-Unterseiten ein.
- Markiert manuelle Diagnoseaktionen sichtbar.
- Fügt Hinweise zu Recovery und Sound-Bus-Dry-Run ein.
- Registriert `window.CGNBusDiagnosticsSubpageSafetyExt`.

Bewertung:

- Safety-relevant.
- Nicht löschen.
- Integration erst später und nur vorsichtig.

### 6. `overlay_monitor_safety_ext.*`

Status: **behalten**

Begründung:

- Fügt Safety-Hinweise im Overlay-Monitor ein.
- Markiert manuelle OBS-/Inventory-/Repair-Aktionen.
- Stellt klar, dass keine OBS-Reparatur oder Browser-Refresh automatisch ausgelöst wird.
- Registriert `window.CGNOverlayMonitorSafetyExt`.

Bewertung:

- Safety-relevant.
- Nicht löschen.
- Integration in `overlays.js` wäre möglich, aber nicht priorisiert.

## Gesamtbewertung

Aktuell kein weiterer Löschkandidat.

Die alten nicht mehr geladenen Diagnose-Dateien sind bereits entfernt. Die jetzt noch geladenen Extensions sind entweder:

- echte Read-only-Sicherheitskarten,
- Unterseiten-Safety-Hinweise,
- oder fachliche Diagnose-Erweiterungen für komplexe Module.

## Verbindliche Regel für neue Module

Neue Module sollen **keine neue `*_diagnostics_ext.js` oder `*_readonly_diagnostics.js` Datei** bekommen.

Standard für neue Module:

1. Modulstatusroute mit `diagnostics`-Block.
2. Eintrag in `/api/diagnostics/registry`.
3. Coverage-Test muss grün bleiben.
4. Zentrale Dashboard-Diagnose über `diagnostics.js`.
5. Modul-Unterseite darf eigene UI haben, aber Diagnose-/Readonly-Extensions nur nach expliziter Begründung.

## Empfohlener nächster Schritt

CAN-42.35: Dokumentation der bewusst behaltenen Extensions in einer dauerhaften Modul-/Dashboard-Doku.

Danach kann fachlich mit dem nächsten Backend-/Dashboard-Modul weitergemacht werden.
