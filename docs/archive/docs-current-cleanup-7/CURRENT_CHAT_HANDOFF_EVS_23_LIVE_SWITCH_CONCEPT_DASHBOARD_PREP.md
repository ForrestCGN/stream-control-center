# CURRENT CHAT HANDOFF – EVS-23 Live-Schalter-Konzept Dashboard Prep

Stand: 2026-06-13

## Modulstand

```text
MODULE_VERSION = 0.5.17
MODULE_BUILD   = STEP_EVS_23_LIVE_SWITCH_CONCEPT_DASHBOARD_PREP
```

## Ziel des Steps

EVS-23 bereitet das spätere Live-Schalter-Konzept im Dashboard sichtbar vor, ohne Live-Funktion zu aktivieren.

## Geändert

### Backend

Datei:

```text
backend/modules/stream_events.js
```

- Versionsnummer auf `0.5.17` gesetzt.
- Build auf `STEP_EVS_23_LIVE_SWITCH_CONCEPT_DASHBOARD_PREP` gesetzt.
- Modulbeschreibung um Live-Schalter-Dashboard-Vorbereitung ergänzt.
- Keine neue Sendefunktion.
- Keine neue Queue-Berührung.
- Keine DB-Migration.

### Dashboard JS

Datei:

```text
htdocs/dashboard/modules/stream_events.js
```

- Versionskonstanten ergänzt.
- Header/Kicker auf EVS-23 aktualisiert.
- Tab `Sicherheit` lädt beim Öffnen automatisch den ChatOutput-Sicherheitsstatus.
- Neuer Bereich `Live-Schalter Konzept` ergänzt.
- Aktuelle Schutzschalter werden als deaktivierte Checkboxen angezeigt.
- Geplante Freigabe-Kette wird streamerfreundlich erklärt.
- Lifecycle-Hinweis korrigiert: Löschen nutzt genau eine normale Bestätigung.

### Dashboard CSS

Datei:

```text
htdocs/dashboard/modules/stream_events.css
```

- Styles für Live-Schalter-Konzept ergänzt.
- Responsive Darstellung für den neuen Bereich ergänzt.

## Weiterhin bewusst NICHT aktiv

```text
keine Twitch-Ausgabe
kein Sound-Playback
keine Sound-System-Queue-Berührung
kein echter Live-Schalter
keine Config-Mutation über den neuen Bereich
```

## Nach dem Einspielen testen

```powershell
cd /d D:\Git\stream-control-center
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-23 Live Switch Concept Dashboard Prep"
```

Danach:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,moduleVersion,moduleBuild,lastError
```

Erwartung:

```text
moduleVersion : 0.5.17
moduleBuild   : STEP_EVS_23_LIVE_SWITCH_CONCEPT_DASHBOARD_PREP
lastError     :
```

Dashboard prüfen:

```text
Event-System → Sicherheit → Live-Schalter Konzept
```

Erwartung:

- Bereich sichtbar.
- Schutzschalter sind nur Anzeige/deaktiviert.
- Hinweis `EVS-23 bleibt Testmodus` sichtbar.
- Keine Live-Aktion ausführbar.

## Nächster möglicher Schritt

EVS-24:

- Option A: Rollen-/Audit-/Config-Endpoint für spätere Live-Schalter planen.
- Option B: ChatOutput-Dry-Run-Vorschau verbessern.

Vor echtem Live-Senden erneut explizite Entscheidung einholen.
