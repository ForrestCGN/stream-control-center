# CURRENT_STATUS — stream-control-center

Stand: 2026-05-26

## Aktueller Fokus

Aktuell wurden die Bereiche **Commands** und **Kanalpunkte** stark überarbeitet. Ziel war ein benutzerfreundlicher, sicherer Dashboard-Editor mit klarer Trennung zwischen normaler Bedienung und technischen Details.

## Commands — bestätigter Stand

### Backend

- `backend/modules/commands.js`
- Aktueller Backend-Stand: `moduleVersion = 0.1.5`
- Aktueller Backend-Build: `safe-edit-param-fix`

Wichtige Punkte:

- Safe-Edit-Logik eingeführt.
- Bestehende Commands werden per stabiler ID beziehungsweise ursprünglichem Trigger bearbeitet.
- Beim Bearbeiten darf nicht versehentlich ein neuer Command entstehen.
- Trigger-Umbenennung wird gegen vorhandene Trigger geprüft.
- Fix für `Unknown named parameter 'createdAt'` beim Bearbeiten wurde eingebaut.

### Dashboard

- `htdocs/dashboard/modules/commands.js`
- Aktueller Dashboard-Stand: `UI_VERSION = 0.1.9`
- Aktueller Dashboard-Build: `preserve-modal-draft-state`

Wichtige Punkte:

- Modal-Editor für neue und bestehende Commands.
- Neuer Command mit sinnvollen Standardwerten.
- Editieren zeigt gespeicherte Werte und passende Aktionsmaske.
- Löschen mit Rückfrage.
- Suche, Kategorie-Filter und direkte Auswahl.
- Commands werden nach Kategorien gruppiert.
- Normale Aktionsauswahl:
  - Song abspielen
  - Video abspielen
  - Text anzeigen
  - Modul-Befehl ausführen
  - Benutzerdefinierte Aktion
- Chat-Ausgabe wurde vom Aktionsblock getrennt.
- Sound/Video nutzen den bestehenden MediaPicker.
- Draft-State-Fix: Eingaben wie Trigger/Alias bleiben erhalten, wenn danach ein Medium ausgewählt wird.
- `Nur Live` ist nicht mehr Teil der normalen UI.

## Kanalpunkte — bestätigter Stand

### Backend

- `backend/modules/channelpoints.js`
- Aktueller Stand: `moduleVersion = 0.8.0`
- Aktueller Build: `twitch-auth-scope-check`

Wichtige Punkte:

- Lokale Reward-Verwaltung steht.
- Tabellen sind additiv und nutzen die bestehende SQLite-Datenbank:
  - `channelpoints_categories`
  - `channelpoints_rewards`
  - `channelpoints_redemptions`
- Keine bestehende Funktionalität entfernen.
- Produktive SQLite-Datenbank niemals überschreiben.
- Sound/Video/Text Rewards lokal ausführbar beziehungsweise testbar.
- Redemption-Test-Flow speichert Ergebnisse in `channelpoints_redemptions`.
- EventBus-Domain-Events sind vorbereitet und dokumentiert.
- Twitch-Sync-Readiness vorhanden.
- Twitch Auth-/Scope-Check vorhanden.
- Weiterhin keine Twitch-Schreibzugriffe.

### Dashboard

- `htdocs/dashboard/modules/channelpoints.js`
- Aktueller Dashboard-Stand: `UI_VERSION = 0.8.0`
- Aktueller Build: `twitch-auth-scope-check`

Wichtige Punkte:

- Modal-Editor analog zu Commands.
- Reward erstellen/bearbeiten/löschen/deaktivieren.
- Suche, Kategorie-Filter, Status-Filter.
- Sound/Video/Text-Aktionen.
- Draft-State stabil: Reward-Key/Titel bleiben erhalten, wenn ein Medium gewählt wird.
- Einlösungsverlauf/Testverlauf vorhanden.
- Twitch-Sync-Panel mit Auth-/Scope-Status.

## Aktueller Twitch-Auth-Check

Zuletzt erfolgreich getestet:

```text
GET /api/channelpoints/twitch/auth-check

ok = true
moduleVersion = 0.8.0
moduleBuild = twitch-auth-scope-check
status = twitch_auth_scope_check
login = forrestcgn
userId = 127709954
broadcasterId = 127709954
tokenUserMatchesBroadcaster = true
readyForReadOnlySync = true
readyForFutureWriteActions = false
noTwitchWrite = true
```

Interpretation:

- Twitch User-Token ist vorhanden und gültig.
- Token gehört zum richtigen Broadcaster.
- Read-only Sync ist möglich.
- Schreibaktionen sind noch nicht bereit beziehungsweise bewusst deaktiviert.

## Nächster sinnvoller Schritt

Der nächste Kanalpunkte-Schritt sollte sein:

```text
Kanalpunkte v0.8.1 — Twitch Rewards Read-Only Sync
```

Ziel:

- echte Twitch Custom Rewards lesen.
- lokale Rewards mit Twitch-Rewards vergleichen.
- Twitch Reward IDs erkennen/verknüpfen.
- Sync-Vorschau anzeigen:
  - lokal verknüpft
  - nur lokal
  - nur Twitch
  - Titel/Kosten unterschiedlich
- weiterhin keine Twitch-Schreibzugriffe.

