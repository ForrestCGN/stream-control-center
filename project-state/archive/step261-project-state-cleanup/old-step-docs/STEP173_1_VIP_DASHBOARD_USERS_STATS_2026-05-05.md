# STEP173.1 - VIP Dashboard Users & Stats

Stand: 2026-05-05

## Zweck

Erweiterung des VIP-Dashboards nach dem ersten VIP-Sound-Upload-Stand.

## Änderungen

Betroffene Dateien:

- `htdocs/dashboard/modules/vip.js`
- `htdocs/dashboard/modules/vip.css`

Keine Backend-Codeänderung in diesem Mini-Step.

## Funktional

- Tab `Rollen` wurde im Dashboard zu `VIPs & Mods` umbenannt.
- `VIPs & Mods` zeigt nun bekannte VIP-/Mod-/User-Kandidaten aus der lokalen Backend-Liste.
- Tabelle zeigt:
  - User/Login
  - Rollen-/Soundtypen aus lokalen Daten
  - Quellen
  - Sound vorhanden/fehlt
  - Dauer
  - Dateiname
  - Aktion `Song hochladen` / `Song ändern`
- Lokale Fallbacks/Overrides bleiben erhalten, sind aber nun klar als `Lokale Fallbacks / Overrides` getrennt.
- Sounds-Tab zeigt zusätzliche Kennzahlen:
  - bekannte User
  - Sounds vorhanden
  - fehlende Sounds
  - Durchschnittslänge
  - längster Sound
- Filter im Tab `VIPs & Mods`:
  - Alle
  - Ohne Sound
  - Mit Sound
  - VIP
  - Mod
  - Lokale Overrides

## Bewusst offen

- Twitch VIP-/Mod-Sync ist weiter als eigener späterer STEP geplant.
- Dieser Step nutzt weiterhin die lokale User-Liste aus:
  - `vip_sound_role_overrides`
  - `vip_sound_daily_usage`
  - `vip_sound_events`
- Keine DB-Migration.
- Keine Änderung an Upload-Backend oder VIP-Command-Logik.

## Tests

Nach Einspielen prüfen:

```powershell
cd D:\Git\stream-control-center
node -c .\htdocs\dashboard\modules\vip.js
```

Browser-Test:

- Dashboard -> Community -> VIP-System -> Sounds
- Dashboard -> Community -> VIP-System -> VIPs & Mods
- Filter `Ohne Sound` testen
- Aktion `Song hochladen` / `Song ändern` öffnet Sounds-Tab mit gewähltem User
