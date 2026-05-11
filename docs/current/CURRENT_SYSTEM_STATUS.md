# STEP241 - DeathCounter DB-Textvarianten

Stand: 2026-05-11

- DeathCounter-Command-/Chatantworten wurden an `helper_texts` und `module_text_variants` angebunden.
- Neue Admin-Routen: `/api/deathcounter/v2/admin/texts` GET/POST.
- `module_name = deathcounter`.
- `!tode`-Ausgaben und zentrale Fehler-/Hinweistexte werden jetzt ueber DB-Textvarianten gerendert.
- Code-Defaults bleiben als Fallback erhalten.
- Keine Count-/State-/Overlay-/Dashboard-Aenderung.

Referenz:

```text
project-state/STEP241_DEATHCOUNTER_DB_TEXT_VARIANTS_2026-05-11.md
```

---

# STEP240 - DeathCounter DB-Settings

Stand: 2026-05-11

- DeathCounter nutzt jetzt `deathcounter_settings` ueber den vorhandenen `helper_settings`.
- Neue Routen: `GET/POST /api/deathcounter/v2/admin/settings`.
- `/api/deathcounter/v2/settings` zeigt DB-Settings plus Runtime-State.
- `requireMentionForPlayerCommands` ist standardmaessig aktiv und kann spaeter im Dashboard gesteuert werden.
- Chat-Output-, Fallback-, AutoCreate-, TwitchLookup-, Default-Spieler-, Max-Extra-Spieler- und Streamstart-Reset-Optionen sind als DB-Settings vorbereitet.
- `stream-online-sync` nutzt die DB-Settings fuer Session-Reset und Overlay-Spieler-Reset.
- JSON-State bleibt produktive Count-/State-Quelle; keine Migration der DeathCounter-Counts.
- Keine Dashboard-, Overlay- oder Streamer.bot-Aenderung in STEP240.

Referenz:

```text
project-state/STEP240_DEATHCOUNTER_DB_SETTINGS_2026-05-11.md
```

---

# STEP239 - DeathCounter Chat-Output-Anbindung

Stand: 2026-05-11

- DeathCounter Command-API nutzt jetzt den vorhandenen `helper_chat_output`.
- Chat-Antworten wie `!tode` und Fehlermeldungen werden primaer vom Backend/Bot gesendet.
- Streamer.bot soll dadurch nur noch den API-Trigger ausloesen und nicht mehr selbst Chatlogik ausfuehren.
- `streamerbot_send` bleibt als Fallback erhalten, falls Backend-Chatversand nicht moeglich ist.
- Mit `sendChat=0` oder `chatOutput=0` kann Backend-Chatversand fuer manuelle Tests uebersprungen werden.
- Keine DB-, Config-, Dashboard-, Overlay- oder Streamer.bot-Aenderung in STEP239.

Referenz:

```text
project-state/STEP239_DEATHCOUNTER_CHAT_OUTPUT_2026-05-11.md
```

---

# STEP238 - DeathCounter Command-API Bridge

Stand: 2026-05-11

- DeathCounter V2 hat eine zentrale Command-API erhalten: `GET/POST /api/deathcounter/v2/command`.
- Unterstuetzt werden `command=dcount`, `command=rip` und `command=tode`.
- Streamer.bot soll kuenftig nur noch Parameter uebergeben und anhand `streamerbot_send` / `streamerbot_message` entscheiden, ob eine Chatnachricht gesendet wird.
- `dcount` verarbeitet serverseitig toggle/show/hide/reset/replace.
- `rip` verarbeitet serverseitig Spieler + optional `del`.
- `tode` verarbeitet serverseitig Gesamtuebersicht oder Einzelspieler-Statistik.
- `@`-Pflicht wurde technisch vorbereitet ueber `requireMention=1` oder `DEATHCOUNTER_REQUIRE_MENTION_FOR_PLAYER_COMMANDS`.
- Keine DB-Migration, keine Dashboard-Aenderung, kein Overlay-Umbau, keine alten Routen entfernt.

Referenz:

```text
project-state/STEP238_DEATHCOUNTER_COMMAND_API_2026-05-11.md
```

---

# STEP237 - Hug/Rehug Command-Flow verifiziert

Stand: 2026-05-11

- Hug/Rehug Command-Flow wurde per API getestet.
- `/api/hug/command?command=hug...` liefert `ok = true` und erzeugt eine Hug-Ausgabe.
- `/api/hug/command?command=rehug...` blockiert fachlich korrekt, wenn kein vorheriger Hug der Gegenseite existiert.
- `/api/hug/statscmd` funktioniert.
- `/api/hug/top`, `/api/hug/top?mode=received` und `/api/hug/top?mode=rehug` funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug wurden dokumentiert.
- Wichtig fuer Streamer.bot: `result.streamerbot_send` beachten und nicht doppelt senden.
- Keine Code-, Config-, Dashboard- oder DB-Aenderung in STEP237.

---

# CURRENT SYSTEM STATUS - stream-control-center

Stand: 2026-05-11

## Kurzstatus

Das Projekt ist auf GitHub/dev und Live-System `D:\Streaming\stramAssets` ausgerichtet. Message-Rotator ist STABLE. Hug/Rehug ist vorlaeufig STABLE. DeathCounter V2 wird ab STEP238 schrittweise in das neue Systemmuster ueberfuehrt.

## Aktuell stabil / abgenommen

### Message-Rotator

Status: **STABLE**

```text
Backend: backend/modules/message_rotator.js
Dashboard: htdocs/dashboard/modules/message_rotator.js
Settings: message_rotator_settings
Texte: module_text_variants / module = message_rotator
Fallback: config/messages/*.json
Livetest: erfolgreich
```

### Hug/Rehug

Status: **vorlaeufig STABLE**

```text
Backend: backend/modules/hug.js
Command-Flow: /api/hug/command
Dashboard-Basis: vorhanden
DB-Quelle: app.sqlite
```

## DeathCounter naechste Schritte

```text
STEP239: deathcounter_settings ueber helper_settings + DB
STEP240: DeathCounter-Texte ueber module_text_variants
STEP241: Dashboard-Basis
STEP242: Statistiken im Dashboard
STEP243: Counts/Events vorsichtig Richtung DB migrieren
STEP244+: zentraler Node Chat-Command-Router
```

## DB-/Helper-Regeln

- SQLite bleibt produktiver Standard/Fallback.
- `backend/core/database.js` ist zentrale DB-Schicht fuer neue/refactorte Module.
- `helper_settings` fuer dashboardfaehige Settings nutzen.
- `helper_texts` / `module_text_variants` fuer variantenfaehige Texte nutzen.
- `sqlite_core.js` nicht neu in produktive Module einkoppeln.
- `app.sqlite` niemals ersetzen oder neu bauen.
