# STEP174.4 - VIP Dashboard Header/Status Cleanup

Stand: 2026-05-05

## Ziel

VIP-Dashboard weiter an den Control-Center-Standard angleichen und die Twitch-Status-Anzeige vereinfachen.

## Änderungen

- Doppelten VIP-Modul-Hero entfernt.
  - Der globale Dashboard-Header enthält bereits Titel, Overlay-Link und Reload.
  - Das Modul zeigt darunter direkt Tabs und Inhalte.
- Twitch-Status-Badge priorisiert jetzt Mod vor VIP.
  - Wenn ein User Twitch-Mod ist, wird nur `Twitch Mod` angezeigt.
  - `Twitch VIP` wird nur angezeigt, wenn kein Mod-Status vorhanden ist.
- Quellenanzeige in der Userliste vereinfacht.
  - `Twitch-Cache` bleibt sichtbar.
  - alte Daily-/Event-/Override-Daten werden nur noch kompakt als `alte Daten` angezeigt.
- Veraltete Texte im Sounds-Tab angepasst.
  - Keine Hinweise mehr auf einen zukünftigen Twitch-Sync, weil dieser bereits aktiv ist.
  - Liste wird als Twitch-Cache erklärt.

## Betroffene Dateien

- `htdocs/dashboard/modules/vip.js`

## Bewusst unverändert

- Keine Backend-Änderung.
- Keine DB-Änderung.
- Keine Änderung an der Twitch-Sync-Logik.
- Keine Änderung an Upload-/Sound-Rechten.

## Test

```powershell
node -c .\htdocs\dashboard\modules\vip.js
```

Danach Live deployen und Dashboard mit Strg+F5 neu laden.
