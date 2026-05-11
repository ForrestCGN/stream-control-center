## STEP242 - DeathCounter Dashboard-Basis

Stand: 2026-05-11

- DeathCounter V2 ist im Dashboard als Community-Modul vorbereitet.
- `index.html` bindet das neue Modul ein.
- `deathcounter.js/css` liefern Status, Settings, Textvarianten, Diagnose und einfache Steuerung.
- Keine Backend- oder Datenhaltungsänderung.

Referenz:

```text
project-state/STEP242_DEATHCOUNTER_DASHBOARD_BASIS_2026-05-11.md
```

---

## STEP241 - DeathCounter DB-Textvarianten

Stand: 2026-05-11

- DeathCounter nutzt fuer Command-/Chatantworten jetzt `module_text_variants` ueber `helper_texts`.
- Neue Admin-Routen: `/api/deathcounter/v2/admin/texts` GET/POST.
- Textmodul: `deathcounter`.
- Betroffen sind zuerst Fehlertexte, DCOUNT-Hinweise und `!tode`-Ausgaben.
- Code-Defaults bleiben als Fallback aktiv.
- Keine Count-/State-/Overlay-/Dashboard-Aenderung.

Referenz:

```text
project-state/STEP241_DEATHCOUNTER_DB_TEXT_VARIANTS_2026-05-11.md
```

---

## STEP240 - DeathCounter DB-Settings

Stand: 2026-05-11

- DeathCounter V2 nutzt jetzt `deathcounter_settings` ueber `helper_settings`.
- Neue Admin-Routen: `GET/POST /api/deathcounter/v2/admin/settings`.
- `/api/deathcounter/v2/settings` zeigt DB-Settings plus Runtime-State.
- `requireMentionForPlayerCommands` ist als DB-Setting standardmaessig aktiv.
- Chat-Output-, Fallback-, AutoCreate-, TwitchLookup-, Default-Spieler-, Extra-Spieler- und Streamstart-Reset-Optionen sind als Settings vorbereitet.
- JSON-State bleibt produktive Count-/State-Quelle; keine Count-Migration.
- Keine Dashboard-, Overlay- oder Streamer.bot-Aenderung.

Referenz:

```text
project-state/STEP240_DEATHCOUNTER_DB_SETTINGS_2026-05-11.md
```

---

## STEP239 - DeathCounter Chat-Output-Anbindung

Stand: 2026-05-11

- DeathCounter Command-API sendet Chat-Antworten jetzt primaer selbst ueber `helper_chat_output`.
- `!tode`, `!tode @user` und Fehlermeldungen koennen damit ueber HeimaufsichtCGN/Bot direkt aus dem Backend in den Twitch-Chat gehen.
- Bei erfolgreichem Direktversand bleibt `streamerbot_send = "0"`; Streamer.bot muss dann nichts posten.
- Bei fehlgeschlagenem Direktversand bleibt der bestehende Fallback ueber `streamerbot_send = "1"` und `streamerbot_message` erhalten.
- Stille Aktionen wie `rip`, `del`, `dcount show/hide/toggle/reset/replace` bleiben ohne Chat-Ausgabe.
- Keine DB-, Dashboard-, Overlay- oder Streamer.bot-Aenderung.

---

## STEP238 - DeathCounter Command-API Bridge

Stand: 2026-05-11

- DeathCounter V2 hat eine zentrale Command-API erhalten: `GET/POST /api/deathcounter/v2/command`.
- Unterstuetzt werden `command=dcount`, `command=rip` und `command=tode`.
- Streamer.bot soll kuenftig nur noch Parameter uebergeben und `streamerbot_send` / `streamerbot_message` auswerten.
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

## STEP237 - Hug/Rehug Command-Flow verifiziert

Stand: 2026-05-11

- Hug/Rehug Command-Flow wurde per API getestet.
- `/api/hug/command?command=hug...` liefert `ok = true` und erzeugt eine Hug-Ausgabe.
- `/api/hug/command?command=rehug...` blockiert fachlich korrekt, wenn kein vorheriger Hug der Gegenseite existiert.
- `/api/hug/statscmd` funktioniert.
- `/api/hug/top`, `/api/hug/top?mode=received` und `/api/hug/top?mode=rehug` funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug wurden dokumentiert.
- Wichtig fuer Streamer.bot: `result.streamerbot_send` beachten und nicht doppelt senden.
- Keine Code-, Config-, Dashboard- oder DB-Aenderung in STEP237.

Referenz:

```text
project-state/STEP237_HUG_REHUG_COMMAND_FLOW_VERIFIED_2026-05-11.md
```

---

# CURRENT STATUS - stream-control-center

Stand: 2026-05-11

## Gesamtstand

Repo/dev und Live-System sind nach STEP237 sauber. Message-Rotator ist STABLE. Hug/Rehug ist vorlaeufig STABLE. DeathCounter V2 wird ab STEP238 schrittweise in das neue Systemmuster ueberfuehrt.

## Aktuell wichtig

- DeathCounter Command-API ist der erste Umbau-STEP.
- Naechster Schritt ist Settings/DB ueber vorhandene Helper, nicht direkt ein Komplettumbau.
- Vor neuen Umbauten immer echte Dateien/Repo-Stand pruefen.

## Aktuelle Referenzdateien

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_ACTIVE_SYSTEM_OVERVIEW_2026-05-11.md
docs/current/PROJECT_MODULE_AND_ROUTE_MAP_2026-05-11.md
docs/current/PROJECT_CONFIG_DATABASE_MAP_2026-05-11.md
docs/current/PROJECT_DASHBOARD_MAP_2026-05-11.md
```
