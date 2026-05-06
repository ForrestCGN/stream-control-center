# STEP188 - Alert Rule Sound Routing + SoundAlert Inbox Plan

Stand: 2026-05-06

## Zweck

Dieser STEP haelt die naechste fachliche Planung fuer Sound-Alerts fest. Es geht nicht nur um globale Alert-Typen, sondern um konfigurierbares Sound-Routing pro einzelner Alert-Regel und um einen sauberen SoundAlert-Inbox-/Import-Workflow.

Noch keine Code-/DB-Aenderung.

## Grundregel

Alert-Sound-Routing darf nicht pauschal nur am Alert-Typ haengen. Jede einzelne Alert-Regel soll perspektivisch eigene Sound-Einstellungen haben koennen:

- SoundAsset / Datei
- Ausgabeziel (`device`, `overlay`, ggf. spaeter `both`)
- Sound-System-Kategorie
- Sound-System-Prioritaet
- Lautstaerke
- Aktiv/Inaktiv

Die bestehende Alert-Regel-Prioritaet darf nicht blind mit der Sound-System-Prioritaet vermischt werden.

## Fachliche Prioritaeten

Geld-/Support-Alerts sollen hoeher gewichtet werden als Kanalpunkte-/Fun-SoundAlerts.

Empfohlene Defaults:

```text
Geld-/Support-Alerts:
- Bits
- Subs / Resubs / GiftSubs
- Ko-fi
- Tipeee / Donations
=> Kategorie: alert
=> Prioritaet: 80 bis 85

Grosse/kritische Alerts:
- grosse Raids
- grosse Donations
=> Kategorie: alert_critical
=> Prioritaet: 90

Kanalpunkte / Channel Rewards:
=> Kategorie: channel_reward
=> Prioritaet: 60 bis 70

Fun / Community:
=> Kategorie: fun
=> Prioritaet: 50

Admin / System:
=> Kategorie: admin oder system
=> Prioritaet: 100
```

Wichtig: Diese Werte sollen dashboardfaehig werden und nicht hart im Code bleiben.

## Regelbasierte Sound-Konfiguration

Beispiele:

```text
Bits 1-99             -> Sound A -> Kategorie alert          -> Prio 80 -> Device
Bits 100-249          -> Sound B -> Kategorie alert          -> Prio 85 -> Device
Bits 1000+            -> Sound C -> Kategorie alert_critical -> Prio 90 -> Device
Kanalpunkte Sound     -> Sound D -> Kategorie channel_reward -> Prio 60 -> Device/Overlay
Ko-fi 1-5 EUR         -> Sound E -> Kategorie alert          -> Prio 80 -> Device
Ko-fi 50+ EUR         -> Sound F -> Kategorie alert_critical -> Prio 90 -> Device
```

Moegliche Regel-Erweiterung:

```json
{
  "soundRouting": {
    "category": "alert",
    "priority": 85,
    "outputTarget": "device",
    "volume": 85
  }
}
```

Bei Videos gilt weiterhin:

```text
Videos -> immer Overlay
Audio-Dateien -> folgen der Regel-Konfiguration
```

## SoundAlert-Inbox-/Import-Workflow

Es gibt drei Erstellwege fuer SoundAlerts.

### 1. Trigger kommt, Datei ist vorhanden, Eintrag fehlt

Beispiel:

```text
Trigger/Chat/Event: soundalert = airhorn
Datei vorhanden: htdocs/assets/sounds/soundalerts/airhorn.mp3
Dashboard-Eintrag existiert noch nicht
```

Gewuenschtes Verhalten:

- Backend erkennt Datei.
- Backend erstellt automatisch oder per Inbox-Aktion einen SoundAlert-Eintrag.
- Eintrag erscheint im Dashboard.
- Eintrag ist verwaltbar und kann einer Regel/Zuordnung zugewiesen werden.

Status-Idee:

```text
neu_erkannt / datei_vorhanden / eintrag_erstellt
```

### 2. Trigger kommt, Datei fehlt

Beispiel:

```text
Trigger/Chat/Event: soundalert = trollsound
Datei fehlt
```

Gewuenschtes Verhalten:

- Backend erstellt keinen kaputten aktiven Regel-Eintrag.
- Backend schreibt einen Inbox-/Log-Eintrag.
- Dashboard zeigt diesen Eintrag unter „Fehlende SoundAlerts“.
- Von dort kann Forrest:
  - Datei hochladen
  - Eintrag erstellen
  - ignorieren/archivieren

Gespeicherte Infos:

- Key/Name
- Quelle
- Trigger-User
- Anzahl Ausloesungen
- letzter Zeitpunkt
- erwartete Datei / Suchpfad
- Status `missing_file`

### 3. SoundAlert komplett manuell erstellen

Im Dashboard:

- Neuer SoundAlert
- Name/Label
- Key / Command / Reward-Name
- Datei hochladen
- Kategorie
- Prioritaet
- Ausgabeziel
- Lautstaerke
- Aktiv/Inaktiv

## Dashboard-Zielbild

Moeglicher Bereich:

```text
SoundAlerts
- Alle Eintraege
- Neu erkannt
- Fehlende Dateien
- Neuer SoundAlert
```

Alternativ schlanker:

```text
SoundAlerts
Filter: Aktiv / Neu erkannt / Datei fehlt / Inaktiv
Button: Dateien scannen
Button: Neuer SoundAlert
```

Aktionen bei fehlender Datei:

```text
[Datei hochladen] [Eintrag erstellen] [Ignorieren]
```

Aktionen bei erkannter Datei ohne Eintrag:

```text
[Eintrag erstellen] [Automatisch aktivieren] [Ignorieren]
```

## Technische Leitplanken

Vor Code-Aenderungen pruefen:

- bestehende Alert-Asset-Tabellen
- bestehende Alert-Regel-Struktur
- bestehende Upload-/Scan-Routen
- vorhandene Helper (`helper_settings`, `helper_media`, `helper_config`, `helper_messages`)
- vorhandene Dashboard-Alert-Dateien

Keine neue Parallelstruktur bauen, wenn bestehende Alert-Assets/Rules sauber erweitert werden koennen.

SQLite-Regel:

- Keine DB neu bauen oder ersetzen.
- Nur sanfte Migrationen per `CREATE TABLE IF NOT EXISTS` / `ALTER TABLE`, falls noetig.

## Wahrscheinlich betroffene Dateien spaeter

Backend:

- `backend/modules/alert_system.js`
- ggf. vorhandene Helper fuer Media/Settings nutzen

Dashboard:

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`

Doku:

- `docs/current/CURRENT_SYSTEM_STATUS.md`
- `project-state/CURRENT_STATUS.md`
- `project-state/CHANGELOG.md`
- `project-state/FILES.md`
- `project-state/NEXT_STEPS.md`

## Naechster sinnvoller Arbeits-STEP

```text
STEP188.1 - Alert Rule Sound Routing Backend Audit
```

Ziel:

1. Reale aktuelle Tabellen/Routen/Funktionen im Alert-System pruefen.
2. Feststellen, ob Sound-Routing in bestehende `alert_rules`/Meta-Struktur passt.
3. Feststellen, ob SoundAlert-Inbox eigene Tabelle braucht oder ueber bestehende Asset-Struktur geloest werden kann.
4. Erst danach Code bauen.

## Bewusst offen

- Exakter Tabellenname fuer Inbox/Zuordnung.
- Ob automatische Erstellung direkt aktiv sein soll oder zuerst als Inbox-Vorschlag landet.
- Ob Kanalpunkte-SoundAlerts ueber Twitch Reward-ID, Reward-Name oder eigenen Key gemappt werden.
- UI-Details im Dashboard.
