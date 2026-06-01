# CAN-12.5 - Manual Recovery Guard Display Dashboard UI Live-Test Acceptance

## Zweck

CAN-12.5 dokumentiert den Live-Test und die Abnahme der in CAN-12.4 umgesetzten Dashboard-Karte:

```text
Recovery Guards
```

Dieser Step ist reine Dokumentation. Es werden keine Code-Dateien geaendert.

## Getesteter Bereich

Dashboard:

```text
Event-Bus / Communication Bus -> Recovery -> Preflight
```

Karte:

```text
Recovery Guards
```

## Sichtpruefung

Die Karte ist sichtbar und zeigt im Ausgangszustand korrekt eine Fallback-Anzeige:

```text
Noch keine Guard-Daten geladen.
```

Nach Ausfuehrung einer lokalen read-only Aktion werden Guard-Daten angezeigt.

## Live-Test Ergebnis

Im Screenshot/Live-Test sichtbar:

```text
Guards: 16
OK: 16
Warnings: 0
Blocked: 0
Errors: 0
Blocking Failed: 0
```

Die Guard-Tabelle zeigt Guard-Zeilen fuer:

```text
manual_diagnostics_refresh
manual_status_resync_request
```

Sichtbare Eigenschaften:

```text
Status: OK
Blocking: blockierend
Severity: ok
lokale Guard-Anzeige / keine Recovery
```

## Abnahmekriterien

Bestanden:

- Karte `Recovery Guards` sichtbar
- Fallback ohne Klick funktioniert
- GuardSummary nach Aktion sichtbar
- Guard-Tabelle sichtbar
- 16 Guards / 16 OK
- 0 Warnings
- 0 Blocked
- 0 Errors
- 0 Blocking Failed
- keine Recovery-/Prepare-/Execute-/Simulation-Buttons sichtbar
- keine produktive Systemaenderung sichtbar

## Sicherheitsgrenze

Weiterhin nicht erlaubt und nicht vorhanden:

- keine POST-Route
- keine Command-Route
- keine Prepare-Route
- keine Execute-Route
- keine Recovery-Ausfuehrung
- keine Queue-Mutation
- keine Sound-Mutation
- keine Alert-Mutation
- keine Overlay-Mutation
- keine DB-Aenderung
- keine Config-Aenderung
- keine Streamer.bot-Aktion
- keine OBS-Aktion

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung
