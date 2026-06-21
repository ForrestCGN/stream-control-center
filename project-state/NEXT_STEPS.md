## Nächste Schritte nach STEP_DOC_MEDIA_SYSTEM_UPLOAD_MODAL_RULE

1. ZIP einspielen.
2. Kein Node-Neustart nötig.
3. Master-Prompt auf neue Media-System-Regel prüfen.
4. TODO auf HypeTrain Alert-/Media-Erweiterung prüfen.
5. Danach bei erfolgreicher Kontrolle `stepdone.cmd` ausführen.

Für spätere HypeTrain-Umsetzung beachten:

```text
Start-/Ende-/Level-Up-Alerts nur vorbereiten, nicht nebenbei produktiv aktivieren.
Medienauswahl/Upload über vorhandenes Media-System-Fenster/Modal.
Playback über Sound-System / Media-System, nicht direkt aus HypeTrain.
```

---

## Nach STEP_DOC_MASTER_PROMPT_STEPDONE_DESCRIPTION_RULE

1. ZIP einspielen.
2. `stepdone.cmd` mit der unten gelieferten Beschreibung ausführen, wenn die Doku-Dateien korrekt übernommen wurden.
3. Ab dem nächsten Code-/Doku-ZIP prüfen, dass die Antwort immer enthält:
   - `installstep.cmd`
   - Node-/Neustart-Hinweis
   - Testbefehle
   - erwartete Versions-/Build-Werte
   - konkrete `stepdone.cmd`-Beschreibung
   - `stepundo.cmd`-Hinweis

Nächster fachlicher Schritt bleibt danach:

```text
HT2.2: HypeTrain Dashboard-Modul mit Übersicht, Config, Texte, Statistik und Tests planen/bauen.
```

---

## Nächste Schritte nach STEP_HT2_1_FIX1_HYPETRAIN_PREVIEW_LINEBREAK

1. ZIP einspielen/deployen.
2. Backend/Node neu starten.
3. Preview ohne Rekord testen.
4. Preview Raid + Rekord testen.
5. Prüfen, dass zwischen `GiftSubs` und `HypeTrain-Punkte` ein sauberer Zeilenumbruch steht.
6. Danach `stepdone.cmd` ausführen, wenn alles passt.

Prüfkommandos:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  Select-Object moduleVersion,moduleBuild

Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?level=2&points=2500&bits=1500&subs=1&resubs=1&giftSubs=1" |
  ConvertTo-Json -Depth 8

Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?raid=1&record=1&level=5&points=9600&bits=3500&subs=3&giftSubs=4" |
  ConvertTo-Json -Depth 8
```

Danach nächster sinnvoller Step:

```text
STEP_HT2_2_HYPETRAIN_DASHBOARD_OVERVIEW_CONFIG
```

---

## Naechste Schritte nach STEP_HT2_1_HYPETRAIN_BACKEND_DB_STATUS_PREVIEW

1. ZIP einspielen/deployen.
2. Backend/Node neu starten.
3. Status pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" |
  ConvertTo-Json -Depth 10
```

4. Preview ohne produktives Senden pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?level=2&points=2500&bits=1500&subs=1&resubs=1&giftSubs=1" |
  ConvertTo-Json -Depth 8
```

5. Raid+Rekord-Preview pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/preview?raid=1&record=1&level=5&points=9600&bits=3500&subs=3&giftSubs=4" |
  ConvertTo-Json -Depth 8
```

6. Optional synthetischen DB-Test ohne produktives Senden ausfuehren:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/hypetrain/test/synthetic?confirm=1" `
  -ContentType "application/json" `
  -Body '{"raid":true,"record":true,"level":5,"points":9600,"bits":3500,"subs":3,"giftSubs":4}' |
  ConvertTo-Json -Depth 10
```

7. Wenn Status/Preview/DB-Test passt: `stepdone.cmd` ausfuehren.
8. Danach naechster Step:

```text
STEP_HT2_2_HYPETRAIN_DASHBOARD_TABS
```

Nicht tun:

```text
Keine alte HypeTrain-Logik aus twitch_events entfernen.
Kein produktives Discord-/Tagebuch-Senden aktivieren.
Kein Sound-System umbauen.
Keine produktive DB ersetzen.
Keine Funktionalitaet entfernen.
```

---

## Nächste Schritte nach STEP_SO_SYNC_FINISH_EVENT_LISTENER_FIX_VERIFIED

1. Beim nächsten echten Live-Stream einen finalen SO-Sync-Test durchführen.
2. Einen laufenden Sound/Video im Sound-System haben oder die Queue bewusst beschäftigen.
3. `!so @user --force` auslösen.
4. Prüfen:
   - Clip läuft über Sound-System/Overlay.
   - OfficialQueue wird erst nach Clip-Ende befüllt.
   - Nach Twitch-Cooldown wird `officialStatus=sent` / `officialResult=sent` erreicht.
5. Danach nur dokumentieren, wenn der Live-Send bestätigt ist.

Nicht zurückbauen:

```text
Keine Rückkehr zur alten Timer-Freigabe.
Sound-System bleibt Playback-/Queue-Owner.
OfficialQueue bleibt an echtes Clip-Ende gekoppelt.
Keine Funktionalität entfernen.
```

Prüfkommandos:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/status" |
  Select-Object moduleVersion,moduleBuild

Invoke-RestMethod "http://127.0.0.1:8080/api/clip-shoutout/queue" |
  ConvertTo-Json -Depth 12

Invoke-RestMethod "http://127.0.0.1:8080/api/sound/recent-playback?limit=10" |
  ConvertTo-Json -Depth 12
```

---

## Nächste Schritte nach STEP_HT1_FIX1_HYPETRAIN_MEDIA_SAVE

1. ZIP einspielen/deployen.
2. `stepdone.cmd` ausführen.
3. Dashboard öffnen: Twitch Events → Hype-Train Rekord.
4. Rekord-Sound auswählen oder hochladen.
5. Speichern.
6. Status prüfen: `recordSound.mediaId` muss größer als 0 sein.
7. Synthetischen Test mit neuer HypeTrain-ID ausführen.
8. Sound-System Recent Playback prüfen.

---

## Nach STEP CAN-5.8

Marker: STEP_CAN5_8_NEXT_STEPS

CAN-5.8 ist nur der Dashboard-Plan für Recovery-Diagnose.

Nächster sinnvoller Schritt:

~~~text
CAN-5.9: Read-only Recovery-Diagnose im Bus-Diagnostics-Dashboard anzeigen
~~~

Regeln für CAN-5.9:

~~~text
Nur Anzeige-Logik
Keine Simulation per Dashboard auslösen
Keine Recovery-Automatik
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

Vor Code prüfen:

~~~text
Wo wird recoveryStrategyState bereits im Dashboard sinnvoll angezeigt?
Soll es ein eigener Recovery-Tab werden oder Teil von Integrationen/Issues?
Welche Felder werden kompakt und verständlich angezeigt?
Wie wird eindeutig markiert, dass alles read-only ist?
~~~

## Nach STEP CAN-5.7

Marker: STEP_CAN5_7_NEXT_STEPS

CAN-5.5/5.6/5.7 bestätigen den read-only Simulation-Harness als stabilen Diagnose-Stand.

Nächster sinnvoller Schritt:

~~~text
CAN-5.8: Recovery-Diagnose ins Dashboard sichtbar machen oder Dashboard-Plan erstellen
~~~

Regeln bleiben:

~~~text
Keine automatische Recovery
Kein Auto-Retry
Kein Alert-Replay
Kein Sound-Replay
Keine produktive Flow-Änderung
~~~

Vor Code zuerst entscheiden:

~~~text
Nur Anzeige im bestehenden Bus-Diagnostics-Dashboard?
Oder erst Dashboard-Plan dokumentieren?
Welche Szenarien sollen im Dashboard sichtbar sein?
Wie wird klar markiert, dass alles synthetic/read-only ist?
~~~

## Nach STEP CAN-5.5

Marker: STEP_CAN5_5_NEXT_STEPS

Nächster sinnvoller Schritt:

~~~text
CAN-5.6: Simulation-Harness live testen
~~~

Zu prüfen:

~~~text
status route vorhanden
missingAck -> blocked_missing_visual_ack
noClient -> blocked_no_overlay_client
unmatched -> blocked_unmatched_alert_sound
automationEnabled bleibt false
productiveActions bleibt false
~~~


## Nach STEP CAN-5.4

Marker: STEP_CAN5_4_NEXT_STEPS

Nächster sinnvoller Schritt:

~~~text
CAN-5.5: Read-only Simulation Harness planen oder minimal ergänzen
~~~

Vor Code muss klar sein:

~~~text
Simulationen sind synthetisch
Simulationen lösen keine echten Alerts/Sounds/Overlays aus
automationEnabled bleibt false
blockedActions bleiben aktiv
Flow bleibt unverändert
~~~

## Nach STEP CAN-5.3

Marker: STEP_CAN5_3_NEXT_STEPS

CAN-5.1 und CAN-5.2 bestätigen den Recovery-Strategy-State als read-only Diagnose.

Nächster sinnvoller Schritt:

```text
CAN-5.4: Fehler-/Timeout-Simulation planen, weiterhin read-only
```

Vor jedem Test festlegen:

```text
Wie wird missingAck erzeugt, ohne Live-Alerts zu beschädigen?
Wie wird noClient geprüft, ohne OBS dauerhaft zu verändern?
Wie wird unmatched simuliert, ohne Sound/Alert doppelt auszulösen?
Welche Tests sind nur lokal/manuell erlaubt?
```

Regel bleibt: keine Recovery-Automatik ohne Schutzfenster, Tests und Rollback.

## Nach STEP CAN-5.1

Marker: STEP_CAN5_1_NEXT_STEPS

Nächster sinnvoller Schritt:

```text
CAN-5.2: Recovery Strategy Live-Test mit Normalfall und ggf. fehlendem ACK/noClient planen
```

Weiterhin keine automatische Recovery aktivieren, bevor Fehlerfälle bewusst simuliert und dokumentiert sind.

## Nach STEP CAN-5.0

Marker: STEP_CAN5_0_NEXT_STEPS

Nächster sinnvoller Schritt:

```text
CAN-5.1: Recovery-Strategy-Status read-only in Bus-Diagnostics ergänzen
```

Ziel: Im Diagnose-Status sichtbar machen, welche Recovery-Aktionen theoretisch erlaubt oder bewusst blockiert sind, ohne etwas automatisch auszuführen.

## Nach STEP CAN-4.3

Marker: STEP_CAN4_3_NEXT_STEPS

CAN-3 und CAN-4 sind als Diagnose-Zwischenstand stabil dokumentiert.

Nächster sinnvoller Schritt:

```text
CAN-5.0: Recovery-/Timeout-Strategie planen, read-only
```

Vor jeder Recovery-Automatik zuerst definieren:

```text
missingAck -> nur Diagnose oder manuelle Recovery?
noClient -> kein Auto-Retry ohne Schutz?
unmatched -> keine doppelte Sound-/Alert-Auslösung?
waiting zu lange -> Timeout sichtbar, aber Flow unverändert?
```

Regel bleibt: keine Funktionalität entfernen und keine produktiven Flows umbauen, bevor Tests und Rollback klar sind.

# NEXT STEPS – STEP278

<!-- CAN-3.7-NEXT-STEPS:START -->
## Nächste Schritte nach CAN-3.7

### Nächster sinnvoller Schritt

```text
CAN-4.0: Overlay ACK / Visual Delivery Diagnose konsolidieren
```

### Ziel

- Visual-Overlay-ACK/Finish sauber sichtbar machen.
- Prüfen, ob Sound/Bundle gematched ist, aber Overlay-Finish fehlt.
- Keine produktive Flow-Änderung ohne separaten Test.
- Keine Queue-, Sound-, Overlay-, TTS-, DB- oder Config-Logik entfernen.

### Prüfbasis

```text
alert_system 3.1.8
sound_system 0.1.20
bus_diagnostics 1.2.2
CAN-3.6 Live-Test: matched / warnings []
```
<!-- CAN-3.7-NEXT-STEPS:END -->


## Nicht sofort umbauen

Vor der Umsetzung erst Ist-Zustand prüfen:

- `backend/server.js`
- `backend/modules/alert_system.js`
- `backend/modules/sound_system.js`
- `backend/modules/clip_shoutout.js`
- `backend/modules/twitch.js`
- `backend/modules/twitch_presence.js`
- `htdocs/overlays/_overlay-alerts-v2.html`
- `htdocs/overlays/sound_system_overlay.html`
- `config/alert_system.json`
- `config/sound_system.json`
- `config/clip_system.json`

Falls vorhanden zusätzlich:

- `backend/modules/helpers/helper_state.js`
- `backend/modules/helpers/helper_routes.js`
- `backend/modules/helpers/helper_core.js`
- `backend/modules/helpers/helper_config.js`

## STEP278 Analyseziele

1. Welche Module senden welche Events?
2. Welche Module empfangen welche Events?
3. Wie werden Overlays per WebSocket registriert?
4. Wie wird Sound-System-Start/Ende an andere Module gemeldet?
5. Wie wird ein Clip-/Sound-Bundle abgeschlossen?
6. Wie erkennt Alert-System, dass Sound wirklich gestartet ist?
7. Was passiert bei OBS-Reload / Browser-Reconnect?
8. Was passiert bei Offline/Live-Wechsel?
9. Was passiert bei `active_bundle_lock`?
10. Warum existiert `Unknown named parameter 'trigger'`?
11. Warum ist `registeredCommand: false`, aber `directChatCommandBypassInstalled: true`?

## Zielarchitektur

Ein einheitlicher Kommunikationsvertrag für Queue- und Overlay-Systeme:

- accepted
- queued
- started
- running
- finished
- failed
- skipped
- blocked

Jedes Modul sollte im Status klar zeigen:

- aktueller Zustand
- letzter Event
- letzter Fehler
- nächste Prüfung
- Grund für Warten
- aktive Queue-ID / Bundle-ID
- beteiligtes Overlay / Sound-System

## CAN-4.0 Overlay ACK / Visual Delivery Diagnose

Status: geplant / naechster Diagnose-Step

Ziel:

```text
Erkennen, ob Alert + Sound sauber matchen, aber das visuelle Overlay kein Finish/ACK liefert.
```

Naechster Code-Step:

```text
CAN-4.1: Read-only visualDeliveryState in /api/alerts/eventbus/correlation/status
```

Nicht aendern:

```text
Keine Queue-Logik
Keine Sound-Playback-Logik
Keine Overlay-Ausgabe
Keine Recovery-Automatik
```

## Nach STEP_HT1_FIX2_HYPETRAIN_MEDIA_STATE_SAVE

1. ZIP einspielen/deployen.
2. `stepdone.cmd` ausfuehren.
3. Dashboard hart neu laden.
4. Hype-Train-Rekord-Sound erneut auswaehlen und speichern.
5. `/api/twitch/events/hypetrain/status` pruefen: `config.recordSound.mediaId` muss groesser 0 sein.
6. Synthetischen Hype-Train-Test mit neuer ID ausfuehren und Sound-Queue pruefen.


## Nach STEP_HT1_FIX3
1. Dashboard hart neu laden (STRG+F5).
2. Twitch Events -> Hype-Train Rekord öffnen.
3. Sound erneut auswählen und speichern.
4. `/api/twitch/events/hypetrain/status` prüfen: `recordSound.mediaId` muss > 0 sein.
5. Danach synthetischen Hype-Train-Test mit neuer ID ausführen.
