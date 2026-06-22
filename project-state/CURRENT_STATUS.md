# CURRENT STATUS – stream-control-center

## HT3.1 – HypeTrain Overlay Registration & Heartbeat

Aktueller bestätigbarer Arbeitsstand nach HT3.1:

```text
HypeTrain: 0.2.1 / STEP_HT3_1_HYPETRAIN_OVERLAY_REGISTER_HEARTBEAT
Tagebuch:  0.1.2 / STEP_HT2_9_TAGEBUCH_SYSTEM_WEBHOOK_NAME
```

HT3.1 baut auf HT3.0 auf:

- HypeTrain-Event-Actions für Start, Stufenaufstieg, Ende und Rekord sind vorbereitet.
- Sound-Ausführung läuft ausschließlich über das bestehende `sound_system`.
- Overlay-Events werden technisch über den Communication-Bus vorbereitet.
- `htdocs/overlays/hypetrain/hypetrain_overlay.html` ist ein leeres/transparentes Overlay-Grundgerüst mit Debug-Ansicht.
- Neu in HT3.1: Overlay-Anmeldung, Heartbeat und Backend-Overlay-Status.
- Alle neuen Event-Sounds und Overlay-Events bleiben standardmäßig AUS.
- HT2.9 bleibt gültig: HypeTrain-Tagebucheinträge überschreiben den Tagebuch-Webhook-Namen nicht; Discord sichtbar: `CGN Posty`.

Neue Routen:

```text
POST /api/hypetrain/overlay/register
POST /api/hypetrain/overlay/heartbeat
GET  /api/hypetrain/overlay/status
```

Wichtige Tests:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/status" | Select-Object moduleVersion,moduleBuild
Invoke-RestMethod "http://127.0.0.1:8080/api/hypetrain/overlay/status" | ConvertTo-Json -Depth 5
```

Overlay-Testseite:

```text
http://127.0.0.1:8080/overlays/hypetrain/hypetrain_overlay.html?debug=1
```

Nächste sinnvolle Schritte:

1. HT3.1 testen: Overlay öffnen, Register/Heartbeat prüfen.
2. Danach Dashboard-Konfiguration für Start-/LevelUp-/End-/Record-Sounds über Media-System planen.
3. Später echtes HypeTrain-Overlay-Design/Animation bauen.
