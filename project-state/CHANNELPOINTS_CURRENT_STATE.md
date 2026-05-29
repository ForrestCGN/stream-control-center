# CHANNELPOINTS_CURRENT_STATE

Version: 0.1.0  
Stand: 2026-05-29  
Quelle: Konsolidiert aus `project-state/CHANNELPOINTS_*.md` im Repo-Stand `dev`.

## Scope

Diese Datei fasst den aktiven Wissensstand zum Channelpoints-/Kanalpunkte-System zusammen.

Sie ersetzt noch keine Einzeldateien.  
Sie dient als aktive Sammelstatus-Datei fuer die weitere Arbeit.

## Aktueller Hauptstand

Aktuell hoechster dokumentierter Stand:

```text
Channelpoints v0.8.0
Build: twitch-auth-scope-check
```

Einordnung:

```text
Status: ACTIVE / VERIFY_AGAINST_CODE
```

Der Stand erweitert das lokale Kanalpunkte-System um einen Auth-/Scope-Check gegen den bestehenden Twitch-OAuth-Status im Backend.

## Sicherheitsgrundsatz

Fuer alle konsolidierten Stufen gilt:

```text
Keine Twitch-Schreibzugriffe.
Keine produktive DB ersetzen.
Keine Funktionalitaet entfernen.
```

Speziell fuer v0.8.0:

```text
Keine Reward-Erstellung, Aktualisierung, Deaktivierung oder Loeschung auf Twitch.
Twitch-Schreibaktionen bleiben deaktiviert.
```

## Backend / Versionen / Builds

Dokumentierte Versionen:

```text
0.6.0 media-execution-bridge
0.6.1 friendly-media-action-editor
0.7.0 safe modal editor
0.7.1 preserve modal draft state
0.7.2 redemption-execution-flow
0.7.3 text-reward-redemption-polish
0.7.4 twitch-sync-readiness
0.7.5 eventbus-docs-final-polish
0.8.0 twitch-auth-scope-check
```

Aktive Module laut Notizen:

```text
backend/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.js
htdocs/dashboard/modules/channelpoints.css
```

## Routen

### Lokale Reward-/Redemption-Routen

Dokumentierte Routen:

```text
GET  /api/channelpoints/redemptions?limit=25
POST /api/channelpoints/redemptions/test
GET  /api/channelpoints/redemptions/test?reward=<key>
POST /api/channelpoints/rewards/:idOrKey/execute
GET  /api/channelpoints/text-execution-check?reward=<key>
```

### Twitch-Readiness/Auth-Routen

Dokumentierte Routen:

```text
GET /api/channelpoints/twitch-status
GET /api/channelpoints/twitch/readiness
GET /api/channelpoints/twitch/auth-check
```

Die Auth-Check-Route nutzt lokal die vorhandene Twitch-Auth-Validierung:

```text
/api/twitch/auth/validate
```

### EventBus-/Diagnose-Routen

Dokumentierte Route:

```text
GET /api/channelpoints/bus-events
```

## Twitch Auth / Scope Check

`/api/channelpoints/twitch/auth-check` prueft laut Notizen:

```text
- ob ein gespeicherter User-OAuth-Token vorhanden/validierbar ist
- welche Scopes vorhanden sind
- ob channel:read:redemptions oder alternativ channel:manage:redemptions fuer Read-only Sync vorhanden ist
- ob channel:manage:redemptions fuer spaetere Schreibaktionen vorhanden ist
- ob Token-User-ID und Broadcaster-ID zusammenpassen, sofern beide bekannt sind
```

Das Dashboard zeigt dazu:

```text
- Auth-/Scope-Status
- Token-Login/User-ID
- Broadcaster-Match
- vorhandene Scopes
- benoetigte Scopes
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Twitch Sync Readiness

v0.7.4 beschreibt ein Dashboard-Panel fuer Twitch-Sync-Vorbereitung.

Es zeigt:

```text
- lokale Reward-/Redemption-Zahlen
- Twitch-ID-Mapping
- geplante Scopes
- spaeteren Flow
```

Offene/naechste Punkte aus diesem Stand:

```text
1. Read-only Twitch Token-/Scope-Check anbinden
2. Read-only Reward-Sync vorbereiten
3. Twitch Reward-ID-Mapping im Dashboard anzeigen
4. EventSub-Redemption-Handler anbinden
5. Erst danach gezielt Schreibaktionen freischalten
```

Einordnung 2026-05-29:

```text
- Punkt 1 wurde durch v0.8.0 zumindest vorbereitet/umgesetzt.
- Punkte 2 bis 5 bleiben VERIFY/OPEN, bis Code und aktuelle Doku geprueft sind.
```

## Redemption Execution Flow

v0.7.2 beschreibt lokale Test-Einloesungen und Verlauf.

Dokumentiert:

```text
- Kanalpunkte koennen testweise lokal ausgefuehrt werden.
- Einloesungen werden im Verlauf gespeichert.
- Dashboard zeigt Reward, User, Zeitpunkt und Status.
- Buttons je Reward: Pruefen / Testen.
```

Sicherheitsnotiz:

```text
twitchWrite = false
bestehende SQLite-Datenbank wird nur erweitert/genutzt, nicht ersetzt
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Text Reward / Redemption Polish

v0.7.3 beschreibt lokale Text-Rewards.

Dokumentiert:

```text
- Text-Rewards sind lokal ausfuehrbar.
- Text-Einloesungen werden in channelpoints_redemptions.result_json gespeichert.
- Redemption-Verlauf zeigt eine kurze Ergebnisvorschau.
- Textgruppen sind vorbereitet.
```

Wichtig:

```text
Textgruppen sind noch nicht an eine zentrale Textverwaltung angebunden.
In diesem Stand wird kein Twitch-Chat automatisch beschrieben.
Twitch wird nicht veraendert.
```

Status:

```text
ACTIVE / OPEN: zentrale Textverwaltung anbinden
```

## Media Execution Bridge

v0.6.0 beschreibt die Medien-Ausfuehrungsbruecke.

Zielpattern:

```text
mediaId -> /api/sound/play Payload
```

Dokumentiert:

```text
- lokale Execute-/Check-Routen vorhanden
- keine Twitch-Schreibzugriffe
- keine Funktionalitaet entfernt
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Dashboard / UI

Dokumentierte UI-Staende:

```text
v0.6.1 friendly-media-action-editor
v0.7.0 safe modal editor
v0.7.1 preserve modal draft state
v0.7.2 redemption-execution-flow
v0.7.3 text-reward-redemption-polish
v0.7.4 twitch-sync-readiness
v0.7.5 eventbus-docs-final-polish
v0.8.0 twitch-auth-scope-check
```

### Friendly Media Action Editor

v0.6.1 verbessert nur die Dashboard-Bedienung. Backend und DB bleiben unveraendert.

Testidee:

```text
Reward mit Video anzeigen oder Sound abspielen testen.
```

### Safe Modal Editor

v0.7.0 dokumentiert:

```text
- Safe Modal Editor
- Kategorien/Suche/Direkt-Auswahl
- Sound/Video/Text/Manual/Custom Aktionsmasken
- lokales Loeschen mit Backend-Route
- keine Twitch-Schreibzugriffe
```

### Preserve Modal Draft State

v0.7.1 dokumentiert:

```text
Wenn im offenen Modal ein Medium gewaehlt oder ein UI-Refresh ausgeloest wird,
bleiben eingegebene Entwurfsdaten erhalten.
```

Testidee:

```text
Neuen Reward oeffnen
Reward-Key und Titel eintragen
Sound abspielen waehlen
Medium auswaehlen
Pruefen, dass Reward-Key/Titel erhalten bleiben
```

Status:

```text
ACTIVE / VERIFY_MANUAL
```

## EventBus / Domain Events

v0.7.5 dokumentiert EventBus-Domain-Events:

```text
channelpoints.reward.created
channelpoints.reward.updated
channelpoints.reward.deleted
channelpoints.reward.enabled
channelpoints.reward.disabled
channelpoints.redemption.created
channelpoints.redemption.executed
channelpoints.redemption.failed
channelpoints.twitch.readiness
```

Zusatz:

```text
Status-/Bus-Payload enthaelt EventBus-Domain-Event-Stats.
GET /api/channelpoints/bus-events
```

Status:

```text
ACTIVE / VERIFY_AGAINST_CODE
```

## Bekannte Risiken / Schutzlinien

```text
- Twitch-Schreibzugriffe bleiben aus.
- Keine DB-Schemaaenderung ohne expliziten Migrationsstep.
- Produktive SQLite-Datenbank wird nicht ersetzt.
- Lokales Deaktivieren/Loeschen bleibt lokal.
- Erst nach Read-only Sync und EventSub-Redemption-Handler gezielt Schreibaktionen planen.
```

## Offene Punkte

```text
OPEN: Read-only Reward-Sync vorbereiten/pruefen.
OPEN: Twitch Reward-ID-Mapping im Dashboard anzeigen/pruefen.
OPEN: EventSub-Redemption-Handler anbinden/pruefen.
OPEN: Textgruppen an zentrale Textverwaltung anbinden.
VERIFY: aktuelle Code-Version gegen dokumentierte v0.8.0 pruefen.
VERIFY: EventBus-Domain-Event-Stats im Status-/Bus-Payload pruefen.
VERIFY: lokale Execute-/Check-Routen und Media-Payload pruefen.
VERIFY: Safe Modal Editor und Draft Preservation manuell testen.
```

## Historische Einzeldateien

Konsolidiert aus:

```text
project-state/CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md
project-state/CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md
project-state/CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md
project-state/CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md
project-state/CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md
project-state/CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md
project-state/CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md
project-state/CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md
project-state/CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md
```

## Review-Status je Quelle

```text
CHANNELPOINTS_MEDIA_EXECUTION_BRIDGE_v0.6.0.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: beschreibt zentrales Media-Payload-Pattern.

CHANNELPOINTS_FRIENDLY_MEDIA_ACTION_EDITOR_v0.6.1.md
Status: DONE / VERIFY_MANUAL
Grund: UI-Bedienverbesserung.

CHANNELPOINTS_SAFE_MODAL_EDITOR_v0.7.0.md
Status: ACTIVE / VERIFY_MANUAL
Grund: Editor-Pattern und lokale Aktionsmasken relevant.

CHANNELPOINTS_PRESERVE_MODAL_DRAFT_STATE_v0.7.1.md
Status: ACTIVE / VERIFY_MANUAL
Grund: Draft-Erhalt ist wichtige UI-Regel.

CHANNELPOINTS_REDEMPTION_EXECUTION_FLOW_v0.7.2.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: lokaler Redemption-Test/Verlauf relevant.

CHANNELPOINTS_TEXT_REWARD_REDEMPTION_POLISH_v0.7.3.md
Status: ACTIVE / OPEN
Grund: Text-Rewards lokal; zentrale Textverwaltung offen.

CHANNELPOINTS_TWITCH_SYNC_READINESS_v0.7.4.md
Status: ACTIVE / PARTLY_DONE / OPEN
Grund: Readiness vorhanden; Folgeschritte offen.

CHANNELPOINTS_EVENTBUS_DOCS_FINAL_POLISH_v0.7.5.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: EventBus-Domain-Events und bus-events Route relevant.

CHANNELPOINTS_TWITCH_AUTH_SCOPE_CHECK_v0.8.0.md
Status: ACTIVE / VERIFY_AGAINST_CODE
Grund: hoechster dokumentierter Stand.
```

## Naechster sinnvoller Schritt

```text
STEP548 - Commands State Consolidation Draft
```

Danach:

```text
STEP549 - Feature State Archive Plan
```
