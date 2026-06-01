# CAN-10.1 - Manual Diagnostics Refresh Contract Plan

## Zweck

CAN-10.1 plant den Vertrag fuer die erste harmlose manuelle Aktion im Recovery-Bereich:

```text
manual_diagnostics_refresh
```

Dieser Step ist reine Planung. Es wird noch kein Code geaendert.

## Ziel der spaeteren Aktion

Die spaetere Aktion soll nur die Diagnose-Anzeige aktualisieren.

Erlaubt:

- Status neu laden
- Recovery-Preflight neu laden
- Dashboard-Daten neu rendern
- Zeitpunkt der letzten Aktualisierung sichtbar machen

Nicht erlaubt:

- Recovery vorbereiten
- Recovery ausfuehren
- Queue veraendern
- Sound-System veraendern
- Alert-System veraendern
- Overlay-State veraendern
- Streamer.bot ausloesen
- OBS steuern
- DB schreiben
- Config schreiben

## Geplanter UI-Name

Spaeterer Button-Text:

```text
Preflight neu laden
```

Alternative interne Bezeichnung:

```text
manual_diagnostics_refresh
```

Wichtig: Der Button darf nicht wie eine Recovery-Aktion wirken. Er ist ein Diagnose-Refresh.

## Erlaubte Datenquellen

Die spaetere UI darf nur folgende GET-Endpunkte abrufen:

```text
GET /api/bus-diagnostics/status
GET /api/bus-diagnostics/recovery-preflight
```

Die dedizierte Preflight-Route soll bevorzugt genutzt werden:

```text
GET /api/bus-diagnostics/recovery-preflight
```

Fallback bleibt:

```text
GET /api/bus-diagnostics/status
```

## Verbotene Routen

Explizit verboten:

```text
POST /api/bus-diagnostics/recovery/*
POST /api/bus-diagnostics/recovery-preflight/*
POST /api/bus-diagnostics/prepare/*
POST /api/bus-diagnostics/execute/*
POST /api/bus-diagnostics/command/*
```

CAN-10.1 fuegt keine dieser Routen hinzu.

## Erwarteter UI-Ablauf spaeter

1. User klickt auf `Preflight neu laden`.
2. Dashboard setzt lokalen Ladezustand.
3. Dashboard ruft read-only Preflight-Route ab.
4. Dashboard aktualisiert Karten:
   - Recovery-Preflight
   - Preflight-Safety
   - Preflight-Route-Kontext
   - Preflight-Route-Safety
   - Preflight-Check-Matrix
   - Preflight-Scope
   - Preflight-Blocker
   - Preflight-Warnungen
   - Preflight-Checks
5. Dashboard zeigt Erfolg oder Fehler als reine UI-Meldung.
6. Keine produktive Aktion wird ausgefuehrt.

## Geplanter Result-Vertrag im Dashboard

Nur lokaler UI-State, kein Backend-Schreibvorgang:

```json
{
  "action": "manual_diagnostics_refresh",
  "ok": true,
  "readOnly": true,
  "route": "GET /api/bus-diagnostics/recovery-preflight",
  "updatedAt": "ISO timestamp",
  "productiveTouch": false
}
```

Bei Fehler:

```json
{
  "action": "manual_diagnostics_refresh",
  "ok": false,
  "readOnly": true,
  "error": "message",
  "productiveTouch": false
}
```

## Sicherheitsregeln

Die spaetere Umsetzung muss garantieren:

- Button ist kein Recovery-Button.
- Keine POST-Route wird verwendet.
- Keine Recovery wird vorbereitet.
- Keine Recovery wird ausgefuehrt.
- Keine produktiven Systeme werden veraendert.
- Keine Auto-Refresh-Schleife wird gestartet.
- Kein Timer wird angelegt.
- Keine Wiederholung bei Fehlern ausser einem einzelnen manuellen Klick.

## Audit / Logging

Fuer diese harmlose Aktion ist noch kein produktives Recovery-Audit erforderlich.

Erlaubt waere nur lokales Dashboard-Log oder Debug-Log:

```text
manual_diagnostics_refresh requested
manual_diagnostics_refresh completed
manual_diagnostics_refresh failed
```

Kein Recovery-Audit-Eintrag mit Ausfuehrungscharakter.

## CAN-10.2 Startgrenze

CAN-10.2 darf den Dashboard-Button `Preflight neu laden` additiv umsetzen.

Erlaubter technischer Scope fuer CAN-10.2:

- nur `htdocs/dashboard/modules/bus_diagnostics.js`
- additiver Button im Preflight-Bereich
- Button ruft nur bestehende GET-Daten neu ab
- kein Backend-Code
- keine neue Route
- keine Recovery-Ausfuehrung
- keine produktive Flow-Aenderung

## Nicht geaendert

- Keine Backend-Datei geaendert
- Keine Dashboard-Datei geaendert
- Keine API-Route hinzugefuegt
- Keine Config geaendert
- Keine DB geaendert
- Keine Recovery ausgefuehrt
- Keine produktive Flow-Aenderung
