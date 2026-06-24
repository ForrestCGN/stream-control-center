# NEXT STEPS - stream-control-center

Stand: RDAP16_HANDOFF_VISIBLE_NEXT
Datum: 2026-06-24

## Nächster sinnvoller Schritt

```text
RDAP_UI1_REMOTE_MODBOARD_FIRST_VISIBLE_PAGE
```

## Ziel

Eine erste sichtbare Remote-Modboard-Webseite bauen.

Fokus:

```text
sichtbarer Fortschritt
```

Nicht noch weitere Mini-Konzeptsteps.

## UI1 soll anzeigen

- Service-Status
- Read-only-/Write-Safety
- Login/OAuth disabled
- Agent-Actions disabled
- Routen-Status
- Lock-/Audit Schema-Adapter Diagnose
- Hinweisbox: read-only Diagnosemodus

## UI1 darf NICHT

- Login aktivieren
- OAuth aktivieren
- Cookies setzen
- Sessions erstellen
- POST/PUT/PATCH/DELETE bauen
- Agent-Actions auslösen
- OBS/Sound/Overlay/Command steuern
- Secrets anzeigen
- DB-Writes ausführen

## Vor Umsetzung

Im neuen Chat zuerst echte Dateien prüfen:

- vorhandene htdocs/dashboard-v2 Struktur
- vorhandene remote-modboard Struktur
- vorhandene Frontend-/Static-Serving-Struktur
- bestehende CSS/JS Patterns

Dann Scope nennen und auf go warten.
