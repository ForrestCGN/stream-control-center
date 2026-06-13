# NEXT_STEPS – EVS-8

Stand: EVS-8 / Config-Dashboard Vorbereitung

## Nach Entpacken

```powershell
node -c .\backend\modules\stream_events.js
node -c .\htdocs\dashboard\modules\stream_events.js
.\stepdone.cmd "EVS-8 Config Dashboard Prep"
```

Erst danach Dashboard testen.

## Dashboard-Test

- Tab Config öffnen.
- Allgemeine Defaults prüfen.
- Sound-Spiel Defaults ändern und speichern.
- Text-Spiel/Wortpunkte Defaults ändern und speichern.
- Seite neu laden und prüfen, ob Werte erhalten bleiben.
- Neues Event öffnen und prüfen, ob Default-Werte übernommen werden.

## Danach

- Config optisch/inhaltlich nach Test anpassen.
- Rechte/Freigaben für Config planen.
- Statistik pro Event im Statistik-Tab vorbereiten.
- Runtime für Chat-Auswertung planen.


## Naechste Schritte nach EVS-9

1. Dashboard/Backend kurz testen: `/api/stream-events/status`, `/api/stream-events/bus-status`, `/api/communication/status`.
2. Danach Runtime planen: Twitch-Chat-Auswertung fuer Sound/Text.
3. Sound-Rotation und Text-Rotation getrennt vorbereiten.
4. Worttreffer-/Wortpunkte-Logik mit Spam-Schutz umsetzen.
5. Statistik- und Overlay-Steps spaeter anbinden.

Naechste Schritte nach EVS-10: Test mit aktivem Text-Testevent, danach direkte Chat-Ausgabe/Message-Routing planen, Dashboard-Statistik fuer Texttreffer bauen oder Sound-Runtime vorbereiten.


## EVS-10b – Text Runtime Test Helpers

- Build: `STEP_EVS_10B_TEXT_RUNTIME_TEST_HELPERS`
- Backend-Version: `stream_events` 0.4.1
- Sichere Testhelfer fuer Text-Runtime hinzugefuegt.
- Neue Route: `GET /api/stream-events/text-runtime/report`
- Neue Route: `POST /api/stream-events/text-runtime/create-test-event?confirm=1`
- Keine direkte Chat-Ausgabe, kein Sound-Playback, kein Overlay.


## Nach EVS-11

- Testevent starten und Bus-Payloads fuer `chatOutput` pruefen.
- Danach entscheiden, welches bestehende Chat-/Bot-Ausgabesystem die vorbereiteten Texte senden soll.
- Direkte Twitch-Ausgabe erst nach ausdruecklichem Go.


## Nach EVS-11b

- Mit aktivem Testevent prüfen, ob `chatOutputs` die erwarteten Altersheim-/CGN-/Rentner-Texte liefert.
- Danach entscheiden, ob ein Chat-Ausgabemodul die vorbereiteten Payloads senden soll.


## EVS-11c – SafeJson Chat Output Fix

Der Fehler `safeJson is not defined` im vorbereiteten Text-Chat-Output wurde behoben. Direkte Twitch-Chat-Ausgabe bleibt weiterhin deaktiviert.
