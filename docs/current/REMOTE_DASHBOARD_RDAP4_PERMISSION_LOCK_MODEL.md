# RDAP4 / Permission- und Edit-Session-/Lock-Datenmodell

Stand: RDAP4.DOC1 / Permission- und Lock-Modell geplant  
Datum: 2026-06-23  
Projekt: ForrestCGN / stream-control-center

## Zweck

Diese Datei plant das technische Grundmodell für Rollen, Permissions, Modulfreigaben, zentrale Edit-Sessions und Locks im späteren Remote-Modboard.

RDAP4 ist ein reiner Planungs-/Doku-Step.

Nicht umgesetzt durch diesen Step:

- kein Backend-Code
- kein Dashboard-Code
- kein Frontend-Code
- kein Agent-Code
- keine Datenbankmigration
- keine produktive SQLite-Änderung
- keine Projekt-Config-Änderung
- keine OBS-Änderung
- kein Node-Neustart

## Ausgangslage

Führende Grundlage:

- Remote-Modboard-Ziel: `https://mods.forrestcgn.de`
- Webserver ist öffentliche Dashboard-/Modboard-Zentrale.
- Stream-PC-Agent ist sichere Brücke zum lokalen System.
- Stream-PC bleibt produktive Runtime / Ausführer.
- Lokales Backend bleibt auf `http://127.0.0.1:8080`.
- Webserver verwaltet Login, User, Rollen, Permissions und Modulfreigaben.
- Agent wird nicht für grundsätzliche Login-/Rechteentscheidungen abgefragt.
- Texte und Configs bleiben produktiv führend auf dem Stream-PC.
- Produktive SQLite bleibt unangetastet.
- Lokales Dashboard und Remote-Modboard sollen langfristig denselben Edit-Session-/Lock-Mechanismus verwenden.

## Grundprinzipien

### 1. Backend entscheidet, Frontend zeigt nur an

Das Frontend darf Rechte sichtbar machen oder Buttons ausblenden, aber niemals Sicherheitsentscheidungen treffen.

Verbindlich:

- Frontend enthält keine Secrets.
- Frontend darf Permissions nicht als Wahrheit behandeln.
- Webserver prüft Login, Rollen und Permissions.
- Agent prüft lokal zusätzlich Allowlist, Aktionstyp und Payload.
- Produktive Aktionen brauchen Request-ID, Permission-Prüfung, Agent-Status und Audit.

### 2. Rollen sind bequem, Permissions sind entscheidend

Rollen sind Bündel von Permissions. Die konkrete Prüfung passiert über Permissions.

Beispiel:

- Rolle: `sound_profi`
- Permission: `media.sound.upload`
- Permission: `sound.command.edit`
- Permission: `channelpoints.sound.edit`

Dadurch können später Sonderfreigaben pro User oder Modul ergänzt werden, ohne starre Rollenlogik umzubauen.

### 3. Twitch-Rollen sind nicht führend

Twitch-Rollen können als Vorschlag oder Mapping dienen, aber nicht automatisch produktive Rechte garantieren.

Beispiele:

- Twitch-Mod kann lokal nur `mod` sein.
- Ein lokaler `sound_profi` muss nicht Twitch-Mod sein.
- Owner/Admin können unabhängig von Twitch verwaltet werden.

### 4. Produktive Bearbeitung nur mit Edit-Session und Lock

Für schreibende Bearbeitung an kritischen Ressourcen gilt:

- Resource laden
- `resourceVersion` prüfen
- Edit-Session starten
- Lock setzen
- Heartbeat senden
- Änderungen speichern
- `resourceVersion` erhöhen
- Audit schreiben
- Lock freigeben

Keine produktive Änderung ohne gültige Rechteprüfung und Audit.

## Rollenmodell

Geplante Rollen:

| Rolle | Zweck |
| --- | --- |
| `owner` | Vollzugriff, Sicherheits-/Systemhoheit, Rollenverwaltung, Notfallübernahme |
| `admin` | Administration ohne Owner-Sonderrechte, Module/Configs/Audit verwalten |
| `lead_mod` | erweiterte Mod-Rechte, Mod-Team-Funktionen, ausgewählte Modulverwaltung |
| `mod` | normale Stream-/Mod-Bedienung, Events starten/stoppen, einfache Aktionen |
| `sound_profi` | Sound-/Media-/Command-/Kanalpunkte-bezogene Pflege ohne Systemrechte |
| `media_manager` | optional getrennte Medienpflege, falls später nötig |
| `readonly` | lesender Zugriff, keine produktive Bearbeitung |

Wichtig:

- `sound_profi` darf keine System-/Security-/Owner-Rechte bekommen.
- `media_manager` bleibt optional, bis klar ist, ob er neben `sound_profi` gebraucht wird.
- Owner-Rechte nicht unnötig an Admins verteilen.

## Permission-Namensschema

Vorgeschlagenes Schema:

```text
bereich.modul.aktion
```

Beispiele:

```text
dashboard.read
admin.audit.read
admin.users.manage
admin.roles.manage
agent.status.read
agent.action.execute
locks.read
locks.takeover
texts.read
texts.edit
config.read
config.edit
media.read
media.upload
media.edit
media.delete
media.sound.assign
sound.test
sound.command.edit
channelpoints.edit
overlay.layout.read
overlay.layout.edit
loyalty.core.read
loyalty.core.edit
shot_alarm.read
shot_alarm.control
stream_events.read
stream_events.control
```

## Schutzstufen

Jede Ressource bekommt eine Schutzstufe.

| Schutzstufe | Beschreibung | Beispiele |
| --- | --- | --- |
| `public_read` | für eingeloggte User lesbar, keine produktive Auswirkung | Übersicht, Status |
| `mod_action` | normale Stream-/Mod-Aktion | Event starten, Shot-Alarm stoppen |
| `content_edit` | Texte/Configs/Layouts bearbeiten | Chattexte, Overlay-Layout |
| `media_edit` | Medien hochladen, bearbeiten, löschen | Sounds, Videos, Kategorien |
| `admin_config` | technische oder globale Einstellungen | Rollen, Modulfreigaben |
| `security` | Sicherheitsrelevant | Agent-Secret, Auth, Owner-Rechte |
| `dangerous` | potenziell zerstörerisch oder produktiv kritisch | Löschen, Massenänderungen, Migrationen |

Regel:

- `security` und `dangerous` brauchen separate Bestätigung und Audit.
- Keine Shell-/Datei-/Prozessaktionen über den Agent in dieser Planungsphase.

## Resource-Key-Modell

`resourceKey` ist die stabile eindeutige Kennung einer bearbeitbaren Ressource.

Format:

```text
<resourceType>:<scope>:<id-or-name>
```

Beispiele:

```text
texts:shot_alarm:chat_messages
config:loyalty:core
media:item:1234
media:category:sounds
overlay:layout:central_event
command:sound:example
channelpoints:vip30
```

Regeln:

- `resourceKey` muss stabil bleiben.
- Keine zufälligen Anzeigenamen als alleinige Resource-ID nutzen.
- Bei DB-Objekten möglichst echte IDs verwenden.
- Bei Config/Text-Dateien Modul + Bereich verwenden.
- `resourceKey` darf keine Secrets enthalten.

## Resource-Felder

Geplante Felder pro Ressource:

```json
{
  "resourceKey": "texts:shot_alarm:chat_messages",
  "resourceType": "texts",
  "module": "shot_alarm",
  "scope": "chat_messages",
  "resourceVersion": 12,
  "title": "Shot-Alarm Chattexte",
  "requiresAgent": true,
  "requiredReadPermission": "texts.read",
  "requiredEditPermission": "texts.edit",
  "protectionLevel": "content_edit",
  "updatedAt": "2026-06-23T00:00:00.000Z",
  "updatedBy": "user-id"
}
```

## Resource-Version-Konflikt

`resourceVersion` schützt vor Überschreiben fremder Änderungen.

Ablauf:

1. User lädt Ressource mit Version `12`.
2. User startet Bearbeitung mit Version `12`.
3. Jemand anderes speichert vorher Version `13`.
4. User versucht mit Version `12` zu speichern.
5. Backend blockiert mit `resource_version_conflict`.
6. Frontend zeigt Konflikt verständlich an.

Keine automatische stille Zusammenführung bei produktiven Configs/Texten.

## Edit-Session-Modell

Eine Edit-Session beschreibt eine aktive Bearbeitung durch einen User/Client.

Geplante Felder:

```json
{
  "editSessionId": "uuid",
  "resourceKey": "config:loyalty:core",
  "resourceVersion": 8,
  "clientId": "uuid",
  "userId": "user-id",
  "displayName": "ForrestCGN",
  "source": "remote_modboard",
  "status": "active",
  "startedAt": "2026-06-23T00:00:00.000Z",
  "lastHeartbeatAt": "2026-06-23T00:00:10.000Z",
  "expiresAt": "2026-06-23T00:01:10.000Z"
}
```

Mögliche `source`-Werte:

```text
local_dashboard
remote_modboard
admin_tool
system
```

## Lock-Modell

Ein Lock verhindert parallele produktive Bearbeitung derselben Ressource.

Geplante Felder:

```json
{
  "lockId": "uuid",
  "resourceKey": "overlay:layout:central_event",
  "editSessionId": "uuid",
  "userId": "user-id",
  "displayName": "ForrestCGN",
  "clientId": "uuid",
  "source": "remote_modboard",
  "status": "active",
  "createdAt": "2026-06-23T00:00:00.000Z",
  "lastHeartbeatAt": "2026-06-23T00:00:10.000Z",
  "expiresAt": "2026-06-23T00:01:10.000Z",
  "takeoverAllowedAfter": "2026-06-23T00:02:10.000Z"
}
```

Lock-Status:

```text
active
released
expired
taken_over
cancelled
```

## Lock-Heartbeat

Während der Bearbeitung sendet der Client regelmäßig einen Heartbeat.

Vorschlag:

- Client-Heartbeat: alle 10 Sekunden
- Lock-Timeout: 60 Sekunden ohne Heartbeat
- Takeover frühestens nach Timeout + 60 Sekunden

Begründung:

- kurz genug, damit verlassene Locks nicht ewig blockieren
- lang genug, damit kurze Netzwerkprobleme nicht sofort stören

## Lock-Übernahme

Übernahme ist nur erlaubt, wenn:

- Lock abgelaufen ist oder Owner/Admin explizit übernimmt
- User die Permission `locks.takeover` besitzt
- Audit-Eintrag erstellt wird
- betroffener User im UI sichtbar genannt wird

Rollen-Vorschlag:

| Rolle | Darf Locks übernehmen? |
| --- | --- |
| owner | ja, immer |
| admin | ja, außer Security-Ressourcen |
| lead_mod | nur für freigegebene Modulbereiche |
| mod | nein |
| sound_profi | nur eigene Sound-/Media-Ressourcen, falls freigegeben |
| readonly | nein |

## Agent-Verlust während Bearbeitung

Wenn der Agent offline geht:

- bestehende Edit-Session bleibt sichtbar, aber speichernde produktive Aktionen werden blockiert
- Lock bleibt bis Timeout bestehen
- UI zeigt `Agent offline - Speichern aktuell gesperrt`
- keine Offline-Queue
- keine automatische spätere Ausführung
- nach Reconnect muss Status neu geprüft werden
- alter Save-Request darf nicht automatisch erneut ausgeführt werden

Lesende Ansicht bleibt möglich, sofern Webserver-Daten vorhanden sind.

## Lokales Dashboard und Remote-Modboard

Langfristiges Ziel:

- beide nutzen denselben `resourceKey`
- beide nutzen dieselbe `resourceVersion`
- beide nutzen denselben Lock-Mechanismus
- beide schreiben Audit in ein gemeinsames Schema

Wichtig:

- lokales Dashboard darf nicht heimlich Locks umgehen
- Remote-Modboard darf nicht produktiv speichern, wenn Agent offline ist
- lokale produktive Runtime auf dem Stream-PC bleibt führend

## Audit-Modell für Locks und Bearbeitung

Jede relevante Aktion bekommt `auditId` und `correlationId`.

Audit-Events:

```text
edit_session.started
edit_session.heartbeat
edit_session.saved
edit_session.cancelled
edit_session.expired
lock.created
lock.heartbeat
lock.released
lock.expired
lock.takeover_requested
lock.taken_over
resource.version_conflict
resource.save_blocked_agent_offline
permission.denied
```

Minimale Audit-Felder:

```json
{
  "auditId": "uuid",
  "correlationId": "uuid",
  "requestId": "uuid",
  "eventType": "lock.created",
  "resourceKey": "texts:shot_alarm:chat_messages",
  "resourceVersion": 12,
  "actorUserId": "user-id",
  "actorDisplayName": "ForrestCGN",
  "source": "remote_modboard",
  "status": "success",
  "createdAt": "2026-06-23T00:00:00.000Z",
  "payloadSummary": {
    "lockId": "uuid",
    "editSessionId": "uuid"
  }
}
```

Nicht ins Audit:

- Secrets
- Tokens
- private Keys
- komplette Medieninhalte
- riesige Rohdaten
- vollständige sensible Payloads

## Permission-Prüfung bei produktiver Bearbeitung

Ablauf beim Starten einer Bearbeitung:

1. User ist eingeloggt.
2. Webserver prüft Leserecht.
3. Webserver prüft Edit-Recht für Ressource.
4. Webserver prüft Agent-Status, falls Ressource `requiresAgent: true` hat.
5. Webserver prüft bestehende Locks.
6. Webserver erstellt Edit-Session.
7. Webserver erstellt Lock.
8. Audit `edit_session.started` und `lock.created`.

Ablauf beim Speichern:

1. User ist eingeloggt.
2. Webserver prüft Edit-Recht erneut.
3. Webserver prüft gültige Edit-Session.
4. Webserver prüft aktiven Lock.
5. Webserver prüft `resourceVersion`.
6. Webserver prüft Agent online, falls produktive Stream-PC-Ressource.
7. Agent prüft Allowlist und Payload.
8. Änderung wird produktiv ausgeführt.
9. `resourceVersion` wird erhöht.
10. Audit `edit_session.saved`.
11. Lock wird freigegeben oder Session bleibt offen, je nach UI-Fluss.

## Bereiche, die Locks brauchen

Locks zwingend:

- Texte bearbeiten
- Configs bearbeiten
- Overlay-Layouts bearbeiten
- Commands bearbeiten
- Kanalpunkte-Aktionen bearbeiten
- Media-Metadaten bearbeiten
- Sound-Zuordnungen bearbeiten
- Rollen/Permissions bearbeiten
- Agent-Registry bearbeiten

Locks nicht zwingend:

- reine Statusseiten
- Logs lesen
- Audit lesen
- Dashboard-Übersichten
- Test-/Diagnose-Ausgaben lesen

## Modulfreigaben

Neben globalen Rollen braucht es Modulfreigaben.

Beispiel:

```json
{
  "userId": "user-id",
  "role": "sound_profi",
  "moduleGrants": [
    {
      "moduleKey": "sound",
      "permissions": [
        "media.read",
        "media.upload",
        "media.edit",
        "media.sound.assign",
        "sound.test",
        "sound.command.edit",
        "channelpoints.edit"
      ]
    }
  ]
}
```

Regel:

- Modulfreigabe erweitert nur innerhalb erlaubter Schutzstufen.
- Modulfreigabe darf keine Owner-/Security-Rechte erzeugen.
- Kritische globale Admin-Funktionen bleiben getrennt.

## UI-Verhalten

Wenn Ressource frei ist:

- Button: `Bearbeiten`
- beim Klick: Edit-Session + Lock erstellen

Wenn Ressource gelockt ist:

- Anzeige: `Wird bearbeitet von <Name>`
- anderer User darf lesend ansehen
- Bearbeiten gesperrt
- bei erlaubter Rolle: `Übernahme anfragen/übernehmen`

Wenn Lock abgelaufen ist:

- Anzeige: `Bearbeitung vermutlich verlassen`
- berechtigte User dürfen übernehmen

Wenn Version veraltet ist:

- Anzeige: `Diese Daten wurden inzwischen geändert. Bitte neu laden.`
- keine stille Überschreibung

Wenn Agent offline ist:

- Anzeige: `Agent offline - produktives Speichern gesperrt`
- kein Speichern-Button für produktive Ressourcen

## Noch nicht in RDAP4 umgesetzt

- keine konkrete DB-Tabelle
- keine Migration
- keine API-Routen
- keine React-Komponenten
- keine WebSocket-Clients
- kein Agent-Code
- kein Produktiv-Save
- kein Lock-Backend

## Nächster sinnvoller Schritt nach RDAP4

DASHUI2 / Frontend-Tech-Entscheidung konkretisieren.

Dabei planen:

- React + Vite final bestätigen
- Build-/Deploy-Ziel `htdocs/dashboard-v2/`
- lokale Nutzung unter `127.0.0.1:8080/dashboard-v2`
- Remote-Nutzung unter `mods.forrestcgn.de`
- AppShell / Sidebar / Topbar / ModuleTabs
- Modul-Registry
- Navigation-Registry
- API-/WebSocket-/Lock-Clients getrennt planen

Noch keinen produktiven Dashboard-v2-Code ohne separaten `go`.
