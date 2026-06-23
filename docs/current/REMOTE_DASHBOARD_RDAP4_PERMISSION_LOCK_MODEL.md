# RDAP4A / Rechte-, Rollen-, Lock- und Audit-Modell

Stand: RDAP4A_PERMISSION_LOCK_AUDIT_MODEL_DOCS  
Datum: 2026-06-23  
Projekt: ForrestCGN / stream-control-center / Remote-Dashboard & Modboard

## Zweck

RDAP4A beschreibt das Sicherheits- und Arbeitsmodell für das spätere Remote-Modboard unter:

```text
https://mods.forrestcgn.de
```

Der Step ist bewusst **nur Doku/Planung**. Er legt fest, wie Rollen, Permissions, Modulfreigaben, Bearbeitungs-Locks, Audit und Agent-Allowlist später zusammenspielen sollen.

## Ergebnis dieses Steps

Dieser Step dokumentiert:

- lokale Dashboard-Rollen und konkrete Permissions
- Spezialrolle `sound_profi`
- Schutzstufen für Ressourcen
- Resource-Key- und Resource-Version-Modell
- Edit-Session-/Lock-Modell mit Heartbeat und Timeout
- Owner/Admin-Übernahme von Locks
- Audit-Grundmodell
- Agent-Sicherheitsgrenzen und Allowlist-Prinzip
- spätere API-/DB-Planung als nächster Schritt

## Nicht umgesetzt durch RDAP4A

RDAP4A ändert nichts Produktives.

Nicht enthalten:

- kein Backend-Code
- kein Frontend-Code
- keine React-Komponenten
- keine API-Routen
- keine DB-Migration
- keine SQLite-Änderung
- kein Agent-Code
- kein WSS-Code
- keine OBS-Steuerung
- keine Sound-Steuerung
- keine Overlay-Steuerung
- keine Commands-/Kanalpunkte-Steuerung
- keine produktiven Aktionen

## Aktueller technischer Ausgangsstand

Bekannter Stand vor RDAP4A:

- Dashboard-v2 läuft parallel zum bestehenden Dashboard unter `/dashboard-v2/`.
- Bestehendes Dashboard unter `/dashboard/` bleibt produktiv.
- Dashboard-v2 Build-Ausgabe liegt unter `htdocs/dashboard-v2/`.
- Deploy-Workflow synchronisiert `htdocs/dashboard-v2/` nach Live.
- RDAP3A liefert eine read-only Status-API unter `/api/remote-agent/status`.
- Die Dashboard-v2-Seite heißt sichtbar `Stream-PC Verbindung`.
- RDAP3A enthält noch keinen produktiven WSS-Agent.
- Aktueller Offline-Status der Stream-PC-Verbindung ist korrekt.

## Zielarchitektur

Das spätere System besteht aus drei klar getrennten Bereichen:

```text
[Browser / Modboard]
        |
        | HTTPS / WSS
        v
[Webserver / mods.forrestcgn.de]
        |
        | gesicherter Agent-Kanal, aktiv vom Stream-PC aufgebaut
        v
[Stream-PC / lokales stream-control-center]
```

Grundregeln:

- Der Stream-PC öffnet keine öffentlichen Ports.
- Der Stream-PC verbindet sich später aktiv per WSS zum Webserver.
- Der Webserver verwaltet Login, Benutzer, Rollen, Permissions, Locks und Audit.
- Der lokale Stream-PC bleibt Ausführer für lokale produktive Aktionen.
- Der Agent akzeptiert nur explizit erlaubte Action-Typen.
- Keine freie Shell.
- Keine freien Dateipfade.
- Keine freie Prozesssteuerung.
- Keine Offline-Queue für produktive Aktionen.

## Sicherheitsprinzipien

### 1. Backend entscheidet, Frontend zeigt nur an

Das Frontend darf Buttons ausblenden, Status anzeigen und Hinweise geben. Es darf aber niemals die Sicherheitsentscheidung treffen.

Verbindlich:

- Permissions werden serverseitig geprüft.
- Frontend enthält keine Secrets.
- Frontend-Permissions sind nur UI-Hinweise.
- Webserver prüft User, Rolle, Permission, Lock und Audit-Pflicht.
- Stream-PC-Agent prüft zusätzlich Allowlist und Payload.

### 2. Rollen bündeln, Permissions entscheiden

Rollen dienen nur als bequeme Bündel. Die eigentliche Prüfung erfolgt auf konkreten Permission-Keys.

Beispiel:

```text
Rolle: sound_profi
Permission: media.upload
Permission: media.edit
Permission: sound.test
Permission: sound.command.edit
Permission: channelpoints.edit
```

Dadurch können später einzelne User gezielt freigeschaltet werden, ohne starre Sonderlogik zu bauen.

### 3. Twitch-Rollen sind nicht automatisch Dashboard-Rechte

Twitch-Rollen können später als Mapping-Hilfe dienen, sind aber nicht führend.

Beispiele:

- Ein Twitch-Mod bekommt nicht automatisch Admin-Rechte.
- Ein lokaler `sound_profi` muss kein Twitch-Mod sein.
- Owner/Admin werden lokal im Dashboard-/Modboard-System verwaltet.
- Kritische Rechte müssen bewusst vergeben werden.

### 4. Jede produktive Änderung braucht Audit

Produktive Änderungen müssen später nachvollziehbar sein.

Jede relevante Aktion braucht mindestens:

- wer
- wann
- woher
- welche Ressource
- welche Permission
- alter/neuer Wert oder sichere Zusammenfassung
- Erfolg/Fehler
- Request-/Correlation-ID

### 5. Keine parallele Bearbeitung ohne Lock

Texte, Configs, Overlay-Layouts, Sound-Zuordnungen, Commands und Rollen dürfen nicht gleichzeitig unkoordiniert bearbeitet werden.

Darum gilt:

- Ressource laden
- Version merken
- Edit-Session starten
- Lock setzen
- Heartbeat senden
- Speichern nur mit gültigem Lock
- Version beim Speichern prüfen
- Audit schreiben
- Lock freigeben

## Rollenmodell

Geplante lokale Rollen:

| Rolle | Zweck | Kritische Grenzen |
| --- | --- | --- |
| `owner` | Vollzugriff, System-/Security-Hoheit, Notfallübernahme | nicht inflationär vergeben |
| `admin` | Verwaltung von Modulen, Configs, Usern je nach Freigabe | keine Owner-Sonderrechte ohne explizite Permission |
| `lead_mod` | erweiterte Mod-Team-Funktionen, ausgewählte Modulverwaltung | keine Security-/Systemrechte |
| `mod` | normale Stream-/Mod-Bedienung, Events starten/stoppen | keine globalen Config-/Security-Rechte |
| `sound_profi` | Sound-/Media-/Command-/Kanalpunkte-Pflege | keine System-/Security-/Owner-Rechte |
| `media_manager` | optionale Medienpflege, falls später getrennt nötig | keine Systemrechte |
| `readonly` | nur lesen | keine produktiven Aktionen |

### Spezialrolle `sound_profi`

`Sound-Profi` ist eine bewusst begrenzte Spezialrolle.

Darf später können:

- Media/Sounds hochladen
- Media/Sounds bearbeiten
- Media/Sounds löschen, sofern freigegeben
- Sounds testen
- Sounds zuordnen
- Sound-Commands bearbeiten
- Kanalpunkte-Aktionen für Sound-/Media-Funktionen bearbeiten
- zugehörige Texte/Configs lesen oder bearbeiten, wenn freigegeben

Darf **nicht** können:

- Owner-/Security-Rechte verwalten
- globale Rollen vergeben
- Agent-Secrets verwalten
- freie Shell-/Datei-/Prozessaktionen auslösen
- Datenbankmigrationen starten
- globale System-Konfiguration ändern
- alle Module automatisch bearbeiten

## Permission-Namensschema

Schema:

```text
bereich.modul.aktion
```

Bei globalen Bereichen kann `modul` entfallen oder als Bereich genutzt werden.

Beispiele:

```text
dashboard.read
admin.audit.read
admin.users.manage
admin.roles.manage
locks.read
locks.takeover
agent.status.read
agent.action.execute
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
channelpoints.read
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

| Schutzstufe | Bedeutung | Beispiele |
| --- | --- | --- |
| `public_read` | eingeloggte User dürfen lesen | Status, Übersicht |
| `mod_action` | normale Mod-/Stream-Aktion | Event starten, Shot-Alarm aktivieren/deaktivieren |
| `content_edit` | Inhalte bearbeiten | Chattexte, Textvarianten, Hinweise |
| `config_edit` | Konfiguration bearbeiten | Moduloptionen, Cooldowns, Limits |
| `media_edit` | Medien verwalten | Sounds, Videos, Kategorien |
| `layout_edit` | Layout/Overlay-Positionen bearbeiten | Event-Overlay-Layout |
| `admin_config` | globale Admin-Einstellungen | Modulfreigaben, Rollen |
| `security` | sicherheitsrelevant | Agent-Secret, Auth, Owner-Rechte |
| `dangerous` | potenziell zerstörerisch | Massenänderungen, Löschaktionen, Migrationen |

Regeln:

- `security` und `dangerous` brauchen extra Bestätigung.
- `security` und `dangerous` brauchen Audit.
- `dangerous` darf nicht über generische Agent-Actions laufen.
- Keine freie Shell-/Prozess-/Dateisteuerung über den Agent.

## Resource-Key-Modell

Jede bearbeitbare Ressource bekommt einen stabilen `resourceKey`.

Format:

```text
<resourceType>:<module-or-scope>:<id-or-name>
```

Beispiele:

```text
texts:shot_alarm:chat_messages
texts:stream_events:event_messages
config:loyalty:core
config:shot_alarm:rules
media:item:1234
media:category:sounds
overlay:layout:event_winner
command:sound:vip30
channelpoints:reward:vip_sound
roles:user:forrestcgn
agent:registry:stream-pc-main
```

Regeln:

- `resourceKey` muss stabil bleiben.
- Keine zufälligen Anzeigenamen als alleinige ID.
- Keine Secrets im Resource-Key.
- Bei DB-Objekten echte IDs nutzen.
- Bei Config/Text-Dateien Modul + Bereich nutzen.

## Resource-Version-Modell

Jede bearbeitbare Ressource bekommt eine `resourceVersion`.

Ablauf:

1. User lädt Ressource Version `12`.
2. User startet Bearbeitung mit Version `12`.
3. Ein anderer User speichert vorher Version `13`.
4. Erster User versucht mit Version `12` zu speichern.
5. Backend blockiert mit `resource_version_conflict`.
6. UI zeigt: `Diese Daten wurden inzwischen geändert. Bitte neu laden.`

Keine stille Überschreibung bei produktiven Texten/Configs.

## Edit-Session-Modell

Eine Edit-Session beschreibt eine aktive Bearbeitung.

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

Geplante `source`-Werte:

```text
local_dashboard
remote_modboard
admin_tool
system
```

Statuswerte:

```text
active
saved
cancelled
expired
taken_over
```

## Lock-Modell

Ein Lock verhindert parallele produktive Bearbeitung derselben Ressource.

Geplante Felder:

```json
{
  "lockId": "uuid",
  "resourceKey": "overlay:layout:event_winner",
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

## Heartbeat und Timeout

Vorschlag:

- Client-Heartbeat: alle 10 Sekunden
- Lock-Timeout: 60 Sekunden ohne Heartbeat
- Übernahme frühestens nach Timeout + 60 Sekunden

Verhalten:

- Verpasste Heartbeats blockieren nicht sofort.
- Abgelaufene Locks werden sichtbar.
- Owner/Admin dürfen abhängig von Permission übernehmen.
- Übernahme muss auditiert werden.

## Lock-Übernahme

Übernahme ist erlaubt, wenn:

- Lock abgelaufen ist oder Owner/Admin explizit übernimmt
- User Permission `locks.takeover` besitzt
- Ressource nicht `security` ist, außer User ist Owner
- Audit-Eintrag geschrieben wird
- UI sichtbar anzeigt, wer vorher bearbeitet hat

| Rolle | Lock-Übernahme |
| --- | --- |
| `owner` | ja, alle Bereiche |
| `admin` | ja, außer Security/Owner-Bereiche |
| `lead_mod` | nur freigegebene Modulbereiche |
| `mod` | nein |
| `sound_profi` | nur eigene/freigegebene Sound-/Media-Ressourcen, wenn erlaubt |
| `readonly` | nein |

## Agent-Offline-Verhalten

Wenn der Agent offline ist:

- Lesende Ansichten bleiben möglich, sofern Webserver-Daten vorhanden sind.
- Produktives Speichern an Stream-PC-Ressourcen wird blockiert.
- UI zeigt `Stream-PC nicht verbunden` oder `Agent offline - Speichern gesperrt`.
- Bestehende Locks laufen normal aus.
- Keine Offline-Queue.
- Keine spätere automatische Ausführung alter Requests.
- Nach Reconnect muss der Status neu geprüft werden.

## Agent-Allowlist-Modell

Der spätere Agent akzeptiert nur bekannte Action-Typen.

Beispiel-Struktur:

```json
{
  "actionType": "sound.test.play",
  "requestId": "uuid",
  "correlationId": "uuid",
  "resourceKey": "media:item:1234",
  "requiredPermission": "sound.test",
  "payload": {
    "mediaId": 1234,
    "target": "preview"
  }
}
```

Verbindliche Agent-Regeln:

- Action-Type muss in Allowlist stehen.
- Payload wird schematisch geprüft.
- Keine freien Pfade.
- Keine Shell.
- Keine Prozesssteuerung.
- Keine SQL-Rohbefehle.
- Keine beliebigen HTTP-Fetches.
- Keine Ausführung ohne `requestId` und `correlationId`.
- Erfolgs-/Fehlerstatus geht zurück an Webserver und Audit.

## Audit-Modell

Audit-Events:

```text
permission.denied
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
agent.action.requested
agent.action.accepted
agent.action.rejected
agent.action.finished
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
- volle sensible Payloads
- riesige Rohdaten

## Produktiver Bearbeitungsablauf

### Start Bearbeitung

1. User ist eingeloggt.
2. Webserver prüft Leserecht.
3. Webserver prüft Edit-Recht.
4. Webserver prüft Schutzstufe.
5. Webserver prüft Agent-Status, falls `requiresAgent: true`.
6. Webserver prüft bestehende Locks.
7. Webserver erstellt Edit-Session.
8. Webserver erstellt Lock.
9. Audit wird geschrieben.

### Speichern

1. Webserver prüft Login erneut.
2. Webserver prüft Permission erneut.
3. Webserver prüft aktive Edit-Session.
4. Webserver prüft aktiven Lock.
5. Webserver prüft `resourceVersion`.
6. Bei Stream-PC-Ressource: Agent online prüfen.
7. Agent prüft Allowlist und Payload.
8. Änderung wird produktiv ausgeführt.
9. `resourceVersion` wird erhöht.
10. Audit wird geschrieben.
11. Lock wird freigegeben oder Session bleibt offen, je nach UI-Fluss.

## Ressourcen, die Locks brauchen

Locks zwingend:

- Texte bearbeiten
- Textvarianten bearbeiten
- Configs bearbeiten
- Overlay-Layouts bearbeiten
- Commands bearbeiten
- Kanalpunkte-Aktionen bearbeiten
- Media-Metadaten bearbeiten
- Sound-Zuordnungen bearbeiten
- Rollen/Permissions bearbeiten
- Agent-Registry bearbeiten

Locks nicht zwingend:

- Statusseiten lesen
- Logs lesen
- Audit lesen
- Dashboard-Übersichten
- rein lesende Diagnose

## UI-Verhalten

Wenn Ressource frei ist:

- Button `Bearbeiten`
- Klick startet Edit-Session + Lock
- UI zeigt Lock-Status

Wenn Ressource gelockt ist:

- Anzeige `Wird bearbeitet von <Name>`
- andere User sehen lesend weiter
- Bearbeiten gesperrt
- berechtigte Rollen sehen Übernahme-Option

Wenn Lock abgelaufen ist:

- Anzeige `Bearbeitung vermutlich verlassen`
- berechtigte User dürfen übernehmen

Wenn Version veraltet ist:

- Anzeige `Diese Daten wurden inzwischen geändert. Bitte neu laden.`
- keine stille Überschreibung

Wenn Agent offline ist:

- Anzeige `Stream-PC nicht verbunden`
- Speichern produktiver Stream-PC-Ressourcen gesperrt

## Modulfreigaben

Neben Rollen braucht es Modulfreigaben.

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

Regeln:

- Modulfreigabe erweitert nur im freigegebenen Bereich.
- Modulfreigabe darf keine Owner-/Security-Rechte erzeugen.
- Kritische globale Admin-Funktionen bleiben getrennt.

## Nächster sinnvoller Schritt nach RDAP4A

Empfohlen:

```text
RDAP4B_PERMISSION_LOCK_SCHEMA_API_PLAN
```

Nur Planung, noch keine Produktivmigration.

RDAP4B sollte konkretisieren:

- Tabellenentwurf für User/Rollen/Permissions/Locks/Audit
- API-Kontrakte für Locks und Edit-Sessions
- API-Kontrakte für Agent-Action-Requests
- Permission-Checks als Backend-Helper-Konzept
- Dashboard-v2 Client-Struktur für `permissionClient`, `lockClient`, `auditClient`
- Migrationsstrategie ohne produktive SQLite zu gefährden

## Offene Punkte

- Exakte DB-Speicherung Webserver vs. Stream-PC festlegen.
- Login-/Session-System separat planen.
- Welche Rechte Mods automatisch aus Twitch-Mapping bekommen, später festlegen.
- Welche Module zuerst lockfähig werden, separat priorisieren.
- Ob `media_manager` wirklich benötigt wird oder `sound_profi` reicht, später entscheiden.
