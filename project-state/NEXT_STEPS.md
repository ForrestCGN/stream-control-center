# NEXT STEPS – VIP30 / 30TageVIP

Stand: 2026-06-06 08:55 UTC

## Abgeschlossen

- [x] Keine Patch-Skripte weiterverwenden
- [x] `/api/_status` geprüft: Node läuft aus `D:\Streaming\stramAssets`
- [x] `backend/modules/twitch.js` Live vs Repo verglichen
- [x] `backend/modules/vip30.js` Live vs Repo verglichen
- [x] STEP8.7 EventSub VIP Remove Bus bestätigt
- [x] STEP8.7.1 Statusroute `/api/twitch/eventsub/status` korrigiert
- [x] `stepdone.cmd` vor Live-Test ausgeführt
- [x] Echten Twitch-Test mit manuellem VIP-Entzug durchgeführt
- [x] VIP30-Slot automatisch auf `external_removed` gesetzt
- [x] Logs geprüft

## Nächster Schritt: STEP8.8 planen

Thema:

```txt
VIP30-Alert bei erfolgreicher 30-Tage-VIP-Vergabe
```

Wichtig:
Vor Umsetzung zuerst planen, dann erst Code ändern.

## STEP8.8 Klärpunkte

- Soll VIP30 einen eigenen Alert-Typ im bestehenden Alert-System bekommen?
- Soll der Alert über das Sound-System laufen oder über eine eigene VIP30-Overlay-Route?
- Welche Route/Event-Struktur soll ausgelöst werden?
- Soll der Alert nur bei erfolgreichem Stage-B-Ergebnis laufen?
- Soll der Alert niemals bei externem VIP-Remove, Cleanup, Blocker oder Refund laufen?
- Welche Textvarianten sollen direkt als Seed vorbereitet werden?
- Welche Config-Felder müssen dashboardfähig vorbereitet werden?
- Welche Diagnose-/Statusfelder braucht VIP30 danach?

## Empfohlene technische Richtung

Vorsichtige erste Planung:

```txt
VIP30 löst nach erfolgreichem Stage-B-VIP-Grant ein internes Event aus.
Alert bleibt über Config steuerbar.
Noch keine automatische Aktivierung ohne Safety-Check.
```

Mögliche EventBus-Aktion:

```txt
channel: vip30.live
action: stage_b.success
```

Darauf aufbauend kann ein Alert-Bridge-Step geplant werden.

## Vor jedem neuen Test

Nach Dateiübernahme immer:

```powershell
cd /d D:\Git\stream-control-center
node -c backend\modules\<datei>.js
.\stepdone.cmd "PASSENDE STEP BESCHREIBUNG"
```

Danach Node neu starten und erst dann Live testen.
