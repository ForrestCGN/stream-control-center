# CHANGELOG

## CAN-12.5

- Live-Test-Abnahme fuer Dashboard-Karte `Recovery Guards` dokumentiert.
- Sichtbarer Stand: 16 Guards / 16 OK / 0 Warnings / 0 Blocked / 0 Errors / 0 Blocking Failed.
- Keine Code-Aenderungen.

## CAN-12.6

- Recovery-/Preflight-/Guard-Framework-Strang read-only abgeschlossen.
- Next-Chat-Handoff dokumentiert.
- Projektstate-Dateien aktualisiert.
- Keine Recovery-Ausfuehrung.
- Keine produktive Flow-Aenderung.

## CAN-13.0

- Next Recovery Candidate Planning Start dokumentiert.
- CAN-13-Reihenfolge fuer Audit, Rollen/Rechte, Confirm, SafetyStop und Kandidatenmatrix festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.1

- Audit-Konzept fuer spaetere manuelle Recovery dokumentiert.
- Audit-Stufen Request / Decision / Result festgelegt.
- Pflichtfelder und harte Audit-Regeln beschrieben.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.2

- Rollen-/Rechte-Konzept fuer spaetere manuelle Recovery dokumentiert.
- Rollen Viewer / Moderator / Admin / Owner / System abgegrenzt.
- Serverseitige Rechtepruefung als Pflicht festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.3

- Confirm-/Bestaetigungs-Konzept fuer spaetere manuelle Recovery dokumentiert.
- Confirm-Arten Info / Risk / Destructive / Typed festgelegt.
- Confirm-Grenzen gegen Rechte, Audit, Guards und SafetyStop beschrieben.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.4

- SafetyStop-/Cancel-Konzept fuer spaetere manuelle Recovery dokumentiert.
- SafetyStop als Pflichtschutz und Cancel als auditpflichtiger Abbruchzustand definiert.
- SafetyStop Clear-Regeln und Dashboard-/Backend-Grenzen beschrieben.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.5

- Recovery-Kandidatenmatrix fuer spaetere manuelle Recovery dokumentiert.
- Kandidaten in read-only Diagnose, blockierte Sicherheitsstatus-Mutation und hart blockierte produktive Recovery-Mutation gruppiert.
- Niedrigrisiko-Kandidaten fuer spaetere read-only Planung identifiziert.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-13.6

- CAN-13 Sicherheitsplanung abgeschlossen.
- Audit, Rollen/Rechte, Confirm, SafetyStop/Cancel und Kandidatenmatrix zusammengefasst.
- CAN-14.0 als naechster read-only Safety Status View Planning Schritt festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-14.0

- Read-only Safety Status View Planning gestartet.
- Statusgruppen, Ampel-Logik und Grenzen fuer spaetere Safety-Status-Anzeige geplant.
- CAN-14.1 Safety Status Contract read-only als naechster Schritt festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-14.1

- Safety Status Contract read-only definiert.
- Root-Struktur, Summary, Statusgruppen, Level-Enum und HardBlockedAction Contract festgelegt.
- Bedeutung von false, unknown und blocked fuer spaetere Anzeige dokumentiert.
- CAN-14.2 Backend Status Shape read-only Planning als naechster Schritt festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-14.2

- Backend Status Shape read-only geplant.
- bus_diagnostics als spaeter naheliegender Modul-Kandidat dokumentiert.
- MutationCheck, Feldherkunft und unknown-Regeln geplant.
- CAN-14.3 Dashboard Safety Status Anzeige Planning als naechster Schritt festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-14.3

- Dashboard Safety Status Anzeige read-only geplant.
- Kartenstruktur, Level-Logik und False-/Unknown-/Blocked-Anzeige dokumentiert.
- Festgelegt: keine Buttons in der ersten Safety-Status-Anzeige.
- CAN-14.4 Dashboard Safety Status Anzeige Implementation read-only als naechster Schritt festgelegt.
- Keine Code-Aenderungen.
- Keine Recovery-Ausfuehrung.

## CAN-14.4

- Dashboard Safety Status Anzeige read-only umgesetzt.
- Neuer Recovery-Subtab `Safety Status` in `htdocs/dashboard/modules/bus_diagnostics.js`.
- Lokale Safety-Auswertung aus vorhandenen GET-Daten ergaenzt.
- Keine Backend-Aenderung.
- Keine neue API.
- Keine produktiven Buttons.
- Keine Recovery-Ausfuehrung.
