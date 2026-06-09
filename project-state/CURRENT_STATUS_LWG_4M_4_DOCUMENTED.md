# CURRENT_STATUS – Loyalty Giveaways / Glücksrad

Stand: LWG-4M.4 dokumentiert
Aktualisiert: 2026-06-09 08:21:19 UTC

## Aktueller technischer Stand

### Letzter bestätigter Backend-Code-Step
- `backend/modules/loyalty_giveaways.js`
- `MODULE_BUILD = STEP_LWG_4M_4`

### Bestätigte Tests

#### LWG-4M.2 – Close + Draw Guard
Bestätigt:
- `/close` setzt ein geöffnetes Giveaway auf `closed_for_entries`.
- Draw aus `open` wird blockiert.
- Draw nach `closed_for_entries` funktioniert.
- Klassisches Test-Giveaway wurde danach korrekt `finished`.

#### LWG-4M.3 – Close-Chatdispatch
Bestätigt:
- `/close` liefert `giveaway.closed`.
- `shouldSendChat = true`.
- `chatDispatchAttempted = true`.
- Wenn Twitch Presence nicht verbunden ist, bleibt `/close` erfolgreich.
- Fehlerfall sauber: `chatSent=false`, `chatDispatch.error=twitch_chat_not_connected`.
- Kein paralleler Chatweg, kein Streamer.bot.

#### LWG-4M.4 – Giveaway-bound Wheel Foundation
Bestätigt:
- Wheel-Giveaway erzeugt ein eigenes gebundenes Wheel.
- `wheelPresetUid` bleibt die globale Vorlage.
- `wheelSnapshotUid` verweist auf das gebundene Giveaway-Wheel.
- Bound Wheel hat:
  - `scope = giveaway`
  - `sourcePresetUid = <globales Preset>`
  - `name = <Giveaway-Name> – Glücksrad`
- `GET /api/loyalty/giveaways/:giveawayUid/wheel/bound` funktioniert.
- `PUT /api/loyalty/giveaways/:giveawayUid/wheel/bound` funktioniert im Giveaway-Kontext.
- Nach `open` bleibt Bound Wheel stabil.
- Cleanup per `cancel` war erfolgreich.

## Architekturregeln

### Giveaways
Giveaway-Workflow:

```text
draft
→ open
→ closed_for_entries
→ draw
→ waiting_for_wheel oder finished
```

Regeln:
- Aktive Giveaways müssen zuerst geschlossen werden.
- Draw ist erst nach `closed_for_entries` erlaubt.
- Close darf nicht scheitern, nur weil Twitch Presence nicht verbunden ist.
- Close soll Chatmeldung vorbereiten/senden, wenn Chatweg verfügbar ist.

### Globales Wheel
Globales Glücksrad bleibt unabhängig von Giveaways nutzbar:
- Befehle
- Kanalpunkte
- Dashboard
- Events/Rewards

Es nutzt globale Presets:
- `presetType = standalone`
- global sichtbar
- global startbar
- global editierbar, solange es fachlich erlaubt ist

### Giveaway-bound Wheel
Wenn ein Giveaway mit Glücksrad erstellt wird:
- Ein globales Preset wird nur als Vorlage genutzt.
- Es wird eine eigene gebundene Giveaway-Wheel-Konfiguration erzeugt.
- Dieses Wheel gehört exklusiv zum Giveaway.
- Es darf nur im Giveaway-Kontext bearbeitet werden.
- Es darf nicht als normales/globales Preset gestartet werden.
- Es darf nur über die pending Wheel-Permission des Gewinners genutzt werden.

## Wichtiger offener Punkt

Das gebundene Wheel steht aktuell noch auf `status = draft`.
Nächster Backend-Step muss festlegen/umsetzen:
- wann Bound-Wheel auf nutzbar/aktiv gesetzt wird,
- wie Claim/Spin wirklich das Bound-Wheel nutzt,
- wie globale Spins weiterhin Giveaway-bound Wheels blockieren.
