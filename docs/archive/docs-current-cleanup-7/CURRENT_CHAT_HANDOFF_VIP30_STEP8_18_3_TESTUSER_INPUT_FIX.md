# CURRENT CHAT HANDOFF – VIP30 STEP8.18.3 Testuser Input Fix

Stand: 2026-06-06

## Problem

Im Dashboard-Tab `Aktionen` wurde beim manuellen VIP30-Alert-Test immer wieder `AkiGhosty` verwendet bzw. das Eingabefeld wurde durch Re-Render/Auto-Reload auf den Default zurückgesetzt.

## Fix

Der feste Default `AkiGhosty` wurde entfernt.

Das Eingabefeld wird jetzt in `state.alertTestUser` gehalten, damit Auto-Reload/Re-Render die aktuelle Eingabe nicht überschreibt.

## Geändert

```txt
htdocs/dashboard/modules/vip30.js
```

## Nicht geändert

```txt
backend/modules/vip30.js
htdocs/dashboard/modules/vip30.css
Sound-System
Media-System
Overlay
```

## Verhalten

```txt
Feld leer -> TestRentner als Fallback
Feld ausgefüllt -> exakt dieser Name/Login wird zum Auflösen verwendet
Auto-Reload -> Eingabe bleibt erhalten
```

## Test

```txt
Aktionen
-> anderes Login eintragen, z. B. ForrestCGN
-> 10+ Sekunden warten
-> prüfen, dass der Name nicht zurückspringt
-> VIP30 Alert testen
```
