# RDAP_USERMENU1_SELF_PROFILE_PANEL

Stand: 2026-06-24

## Zweck

Der eingeloggte User bekommt oben rechts am Avatar/Namen einen eigenen Profilbereich. Dieser Bereich betrifft nur das eigene Konto. Admin-Funktionen fuer andere User bleiben getrennt im Admin-Bereich.

## Geändert

```text
remote-modboard/backend/public/index.html
remote-modboard/backend/public/assets/remote-modboard.css
remote-modboard/backend/public/assets/remote-modboard.js
docs/current/RDAP_USERMENU1_SELF_PROFILE_PANEL.md
```

## Funktion

- Avatar/Name oben rechts ist klickbar.
- Ein Self-Profile-Panel zeigt Login, Zugriff, Rollen, Gruppen, Session und `remote.view` read-only.
- Logout ist im Panel enthalten.
- Oben rechts wird ein Avatar-Bild angezeigt, wenn die Auth-API ein Avatar-/Profilbild-Feld liefert.
- Ohne Avatar-URL bleibt ein Initialen-Fallback sichtbar.

## Bewusste Trennung

Oben rechts ist nur fuer den eigenen User gedacht:

```text
Mein Profil
Meine Session
Meine Rollen/Rechte read-only
Mein Logout
```

Admin bleibt spaeter fuer Verwaltung anderer User:

```text
User freigeben/sperren
Rollen vergeben/entziehen
Sound-Profi setzen
Sessions widerrufen
Audit-Verlauf
```

## Nicht geändert

- keine Backend-Routen
- keine DB-Writes
- keine Migration
- keine User-/Rollen-Verwaltung
- keine Allowlist-Änderung
- keine Remote-Writes
- keine Agent-Actions
- keine OBS-/Sound-/Overlay-/Command-Steuerung

## Test

```powershell
node --check .\remote-modboard\backend\public\assets\remote-modboard.js
```

Browser:

```text
https://mods.forrestcgn.de/
```

Prüfen:

```text
Avatar/Name oben rechts klickbar
Profilpanel öffnet/schließt
Eigenes Konto wird read-only angezeigt
Logout im Panel funktioniert
keine Admin-/Write-Funktion sichtbar
```
