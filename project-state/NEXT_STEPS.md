# NEXT STEPS - stream-control-center

Stand: 2026-05-11

## Prioritaet A - Naechste Entwicklungsarbeit

### 1. Hug/Rehug ins aktuelle Systemmuster ueberfuehren

Ziel:

```text
- bestehende Hug/Rehug-Funktion nicht brechen
- vorhandene Helper nutzen
- Dashboard-Modul pruefen/erweitern
- Texte/Varianten DB-basiert und dashboardfaehig machen
- Config/Settings zentral und editierbar halten
- keine Parallelstruktur bauen
```

Vor Start pruefen:

```text
backend/modules/hug_system.js oder aktueller Hug-Modulname
htdocs/dashboard/modules/hug.js
htdocs/dashboard/modules/hug.css
config/messages/hug.json
DB-Tabellen fuer Hug/Rehug
bestehende Routes und Statusausgaben
```

### 2. SoundAlerts / Sound-System weiter vereinheitlichen

Ziel:

```text
- aktuelle SoundAlerts/Sound-System-Struktur pruefen
- Settings-/Text-/DB-Muster angleichen
- Dashboard UX weiter vereinfachen
- keine Sound-/Queue-Funktion entfernen
```

### 3. Alert-Sonderfaelle planen

Noch nicht direkt bauen, erst planen:

```text
- Prime-Sub / Prime-Resub ueber channel.chat.notification
- GiftBomb 101+ Special-/Jackpot-Alert
- dynamische SubBomb-Zahl im Overlay
- HypeTrain-System
- Shoutout-/SO-Statistik
- TTS-Wortfilter / Moderation
```

## Prioritaet B - Doku/Struktur weiter aufraeumen

### 1. Historische Doku sortieren

Noch nicht gemacht. Separater STEP noetig.

Kandidaten:

```text
project-state/*APPEND*.md
project-state/*STATUS_NOTE*.md
docs/current/*STATUS_NOTE*.md
docs/handoffs/NEXT_CHAT_HANDOFF_*.md
```

Moegliches Ziel:

```text
project-state/archive/appends/
project-state/archive/status-notes/
docs/archive/handoffs/
docs/archive/old-current-notes/
```

Regel:

```text
Erst Liste erzeugen, dann verschieben. Nichts loeschen.
```

### 2. Modul-Doku aufbauen

Optional spaeter:

```text
docs/modules/message_rotator.md
docs/modules/alerts.md
docs/modules/twitch.md
docs/modules/loyalty.md
docs/modules/tagebuch_todo.md
docs/modules/sound_system.md
docs/modules/hug.md
```

### 3. Generated Docs aktualisieren

Nur wenn Generator/Quelle klar ist:

```text
docs/_generated/ROUTES.md
docs/_generated/DASHBOARD_MODULES.md
docs/_generated/CONFIGS_AND_DATA.md
docs/_generated/FUNCTIONS.md
docs/_generated/PROJECT_NAVIGATION.md
```

## Prioritaet C - Beobachtung im naechsten Stream

### Message-Rotator

Status: stable / abgenommen.

Nur beobachten:

```text
- Start/Stop mit Streamstart/-ende
- Chat-Ticks
- Next-Ausgabe nach Delay/Cooldown
- keine ungewollten Testvarianten
```

### Twitch/EventSub Audit

Bei echten Twitch-Events pruefen:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/audit/recent?limit=50" | ConvertTo-Json -Depth 100
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/alerts/status" | ConvertTo-Json -Depth 60
```

## Nicht jetzt machen

```text
- keine MariaDB/MySQL-Umschaltung
- keine historischen Dateien loeschen
- keine grossen Dashboard-Komplettumbauten
- keine Runtime-/Config-/DB-Dateien ohne konkrete Aufgabe anfassen
```


## Nach STEP233

1. ZIP entpacken.
2. Archiv-Script ausführen:

```powershell
cd D:\Git\stream-control-center
.\tools\archive_docs_step233.ps1
```

3. `git status --short` prüfen.
4. Commit/Deploy:

```powershell
.\stepdone.cmd "archive old project documentation fragments"
```

Danach nächster sinnvoller Block:

- Dashboard-/Backend-Modulmatrix aktualisieren
- oder nächstes Fachmodul auswählen: Hug/Rehug, SoundAlerts, Streamer.bot-Action-Doku
