# RDAP_USERMENU2_CLEAN_PROFILE_ACTIONS

Datum: 2026-06-24
Projekt: `stream-control-center` / Remote-Modboard / RDAP
Subdomain: `mods.forrestcgn.de`

## Ziel

Das Self-Profilpanel oben rechts wurde aufgeräumt. Die Buttons `Mein Login` und `Zugriff` wurden entfernt, weil die wichtigsten Informationen bereits direkt im Profilpanel sichtbar sind und die Seiten weiterhin über die Sidebar erreichbar bleiben.

## Geändert

```text
remote-modboard/backend/public/index.html
```

Im Profilpanel bleiben nur noch:

```text
Profil aktualisieren
Ausloggen
```

## Nicht geändert

```text
Backend
Auth-Logik
DB
Migrationen
Admin-Userverwaltung
Rollen-/Freigabe-Writes
Remote-Writes
Agent-Actions
OBS/Sound/Overlay/Command-Steuerung
```

## Warum

Das Usermenü oben rechts ist Self-Service und soll nicht wie eine zweite Navigation wirken. Benutzerverwaltung, Freigaben und Rollenänderungen gehören später in den Admin-Bereich.

## Test

- Oben rechts Avatar/Name anklicken.
- Profilpanel öffnet.
- Es sind nur noch `Profil aktualisieren` und `Ausloggen` sichtbar.
- `Profil aktualisieren` synchronisiert weiterhin eigene Twitch-Daten.
- `Ausloggen` funktioniert weiterhin.
- Sidebar-Seiten `Mein Login` und `Zugriff` bleiben erreichbar.
