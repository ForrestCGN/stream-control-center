# CURRENT_SYSTEM_STATUS – stream-control-center

Stand: 2026-05-26  
Arbeitsbereich: Kanalpunkte / Twitch Rewards / EventSub / EventBus / Dashboard

## Aktueller stabiler Stand

Das Kanalpunkte-System ist nach STEP516 in einem stabilen End-to-End-Stand.

Aktive Versionen:

```text
backend/modules/channelpoints.js              moduleVersion 0.9.4 · redemption-completion-policy
htdocs/dashboard/modules/channelpoints.js     UI v1.0.3 · color-picker-presets-ui
backend/modules/channelpoints_eventsub_bus_bridge.js  EventBus Bridge
```

Wichtigster Live-Test:

```text
Reward: Gewürzgurke
Twitch reward_id: 0e129f37-20bf-456e-ab87-06fa0d6e08fd
Reward-Key lokal: gewurzgurke
User im echten Test: EngelCGN / engelcgn
Status: executed
```

Die komplette Kette wurde erfolgreich getestet:

```text
Twitch Reward eingelöst
→ Twitch EventSub WebSocket
→ EventSub-Audit/Cache in twitch.js
→ channelpoints_eventsub_bus_bridge.js
→ Communication Bus / EventBus
→ channelpoints.js Subscriber
→ lokale Redemption gespeichert
→ Sound-System ausgeführt
→ Status executed
```

## Abgeschlossene Kanalpunkte-Schritte

### STEP484–490: ReadOnly Sync und Mapping

- Twitch Rewards wurden zunächst sicher read-only importiert.
- Tokenstore-Problem wurde behoben.
- Dashboard-Import-Tab wurde command-like in das bestehende Kanalpunkte-Modul integriert.
- Mapping-Ansicht und lokale Sync-/DryRun-Probleme wurden bereinigt.

### STEP491–497: Importierte Rewards sicher konfigurieren

- Importierte Rewards sind lokal standardmäßig inaktiv.
- Importierte Rewards ohne Aktion können nicht aktiviert oder ausgeführt werden.
- Backend- und Dashboard-Guards schützen vor leeren Aktionen.
- Reward `Gewürzgurke` wurde als erster echter Test-Reward konfiguriert.
- Sound-Test über Media-ID `1393` funktioniert.

### STEP498–508: Redemption-Vorbereitung und Vereinfachung

- EventSub-Redemption-Routen wurden vorbereitet.
- Frühere Shadow-/Live-/Allowlist-Bedienlogik wurde wieder aus dem normalen Bedienkonzept entfernt.
- Endgültige Regel:

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht aktivierbar / nicht ausführbar
```

- Einlösungen, Verlauf, Statistik und Filter wurden im Dashboard aufgeräumt.

### STEP509–513: Twitch Write / Create / Update / Delete

- Twitch Rewards können über die API erstellt/gepusht werden.
- Stale lokale Twitch-IDs werden erkannt; bei `not found` kann mit `createIfMissing` neu erstellt werden.
- `Gewürzgurke` wurde erfolgreich auf Twitch neu erstellt.
- Aktivieren/Deaktivieren auf Twitch ist vorhanden.
- Twitch-Delete ist vorhanden:

```text
POST   /api/channelpoints/twitch/rewards/:idOrKey/delete
DELETE /api/channelpoints/twitch/rewards/:idOrKey
```

Sicherheitsbestätigung:

```json
{"confirm":"delete_from_twitch"}
```

Optionen:

```text
localAction=disable  → Twitch löschen, lokalen Reward deaktivieren und Twitch-Link entfernen
localAction=keep     → Twitch löschen, lokalen Reward behalten und Twitch-Link entfernen
localAction=delete   → Twitch löschen, lokalen Reward lokal ebenfalls löschen
```

### STEP511–512: EventBus-End-to-End-Flow

- EventSub für Kanalpunkte ist aktiv:

```text
channel.channel_points_custom_reward_redemption.add
status: enabled
```

- Der produktive Flow läuft über den EventBus, nicht über eine interne HTTP-Brücke.
- `created_at` Bind-Fehler beim Redemption-Speichern wurde behoben.
- Status nach erfolgreichem Test:

```text
receivedFromBus > 0
acceptedFromBus > 0
stored > 0
executed > 0
failed = 0
lastError leer
```

### STEP515: Completion Policy

Pro Reward sind Twitch-Redemption-Abschlussregeln vorgesehen:

```text
Sofort bei Twitch abschließen
Nach erfolgreicher Ausführung abschließen
Bei Fehler Punkte zurückgeben
Twitch pausieren
```

Konzept:

```text
Sofort bei Twitch abschließen AN
→ Twitch setzt Redemption direkt auf FULFILLED.

Sofort bei Twitch abschließen AUS
+ Nach erfolgreicher Ausführung abschließen AN
→ System setzt nach erfolgreicher Aktion FULFILLED.

Bei Fehler Punkte zurückgeben AN
→ System setzt bei Fehler/Blockierung CANCELED.
```

### STEP516: Farbauswahl im Dashboard

- Farbauswahlfeld für Twitch Reward-Farbe eingebaut.
- Hex-Feld bleibt sichtbar.
- Live-Vorschau und Preset-Buttons eingebaut.
- Jeder gültige Hex-Code im Format `#RRGGBB` kann genutzt werden.

Presets:

```text
Twitch Lila      #9147FF
CGN Neon Lila    #B000FF
CGN Cyan         #00E5FF
Türkis           #00E5CB
Blau             #3B82F6
Grün             #00FF7F
Gold             #FFD700
Orange           #FF7A00
Rot              #FF3030
Pink             #FF4FD8
```

## Aktuelle wichtige Routen

### Lokale Rewards

```text
GET    /api/channelpoints/rewards
POST   /api/channelpoints/rewards
POST   /api/channelpoints/rewards/:idOrKey/enable
POST   /api/channelpoints/rewards/:idOrKey/disable
POST   /api/channelpoints/rewards/:idOrKey/execute
DELETE /api/channelpoints/rewards/:idOrKey
POST   /api/channelpoints/rewards/:idOrKey/delete
```

### Twitch Reward Management

```text
GET  /api/channelpoints/twitch/manage/status
POST /api/channelpoints/twitch/rewards/:idOrKey/push
POST /api/channelpoints/twitch/rewards/:idOrKey/enable
POST /api/channelpoints/twitch/rewards/:idOrKey/disable
POST /api/channelpoints/twitch/rewards/:idOrKey/delete
DELETE /api/channelpoints/twitch/rewards/:idOrKey
```

### EventSub / Redemptions

```text
GET  /api/channelpoints/eventsub/redemption/status
POST /api/channelpoints/eventsub/redemption/preview
POST /api/channelpoints/eventsub/redemption
GET  /api/channelpoints/redemptions?limit=...
```

### Twitch EventSub Status

```text
GET /api/twitch/eventsub/status
GET /api/twitch/eventsub/subscriptions
GET /api/twitch/eventsub/reconcile
GET /api/twitch/eventsub/reconnect
GET /api/twitch/eventsub/cleanup-disconnected
```

## Wichtige Regeln, die aus dieser Arbeitsphase bestätigt wurden

```text
Keine Shadow-/Live-/Allowlist-Bedienlogik im Kanalpunkte-Dashboard.
Reward aktiv/inaktiv ist die zentrale Ausführungsfreigabe.
Reward ohne Aktion darf nicht aktiviert oder ausgeführt werden.
Twitch-Write braucht channel:manage:redemptions.
EventSub-Redemptions laufen über EventBus, nicht über HTTP-Modulbrücke.
Keine neue DB, keine Tabellen ersetzen, app.sqlite bleibt bestehen.
```

## Bekannte offene Punkte

- Completion-Policy nach STEP515 mit echten `FULFILLED`/`CANCELED` Twitch-Statuswechseln weiter testen.
- UI-Begriffe für Twitch-Abschlussoptionen im Live-Betrieb bewerten.
- Alte Dashboard-Test-Redemptions bleiben historische Einträge; optional später eine Admin-Bereinigung/Filterung bauen.
- Encoding-Anzeige bei Sound-Dateipfaden prüfen (`GewA_1_4rzGurke.mp3` / alte Umlautdarstellung).
- Weitere Reward-Typen nach dem stabilen Gewürzgurke-Test Schritt für Schritt anbinden.
