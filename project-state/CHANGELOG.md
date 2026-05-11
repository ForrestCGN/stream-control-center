## 2026-05-11 - STEP242 DeathCounter Dashboard-Basis

- DeathCounter Dashboard-Modul hinzugefügt.
- `htdocs/dashboard/index.html` bindet DeathCounter-Panel, CSS und JS ein.
- Neues Modul: `htdocs/dashboard/modules/deathcounter.js`.
- Neues Styling: `htdocs/dashboard/modules/deathcounter.css`.
- Dashboard zeigt Status, Spieler/Counts, Settings, Textvarianten und Integration-Check.
- Dashboard kann Overlay show/hide/toggle/reset, Spieler ersetzen und manuell +1/-1 auslösen.
- Keine Backend-, DB-, Count-, Overlay-Design- oder Streamer.bot-Änderung.

---

## 2026-05-11 - STEP241 DeathCounter DB-Textvarianten

- DeathCounter an `helper_texts` / `module_text_variants` angebunden.
- Neue Routen `/api/deathcounter/v2/admin/texts` GET/POST ergaenzt.
- Textmoduleintrag `deathcounter` mit Defaults fuer Fehler-, DCOUNT- und Tode-Texte vorbereitet.
- `!tode`-Zusammenfassung und Einzelspieler-Ausgabe werden aus Textvarianten gerendert.
- Bestehende State-Datei/Counts, Overlay und Dashboard bleiben unveraendert.

---

## 2026-05-11 - STEP240 DeathCounter DB-Settings

- `deathcounter_settings` ueber vorhandenen `helper_settings` eingefuehrt.
- `GET/POST /api/deathcounter/v2/admin/settings` ergaenzt.
- `/api/deathcounter/v2/settings` zeigt jetzt DB-Settings und Runtime-State.
- `requireMentionForPlayerCommands` ist standardmaessig aktiv und kommt aus DB-Settings.
- Chat-Output-, Fallback-, AutoCreate-, TwitchLookup-, Default-Spieler-, Max-Extra-Spieler- und Streamstart-Reset-Optionen vorbereitet.
- Integration-Check prueft die Settings-Tabelle nicht-destruktiv.
- Keine Count-/State-Migration und keine Dashboard-/Overlay-Aenderung.

---

## 2026-05-11 - STEP239 DeathCounter Chat-Output-Anbindung

- `backend/modules/deathcounter_v2.js` an vorhandenen `helper_chat_output` angebunden.
- DeathCounter Command-Antworten mit Chattext werden primaer vom Backend/Bot gesendet.
- Erfolgreicher Backend-Chatversand setzt `chat_sent = true` und verhindert Streamer.bot-Doppelposts durch `streamerbot_send = "0"`.
- Fallback ueber `streamerbot_send = "1"` bleibt erhalten, wenn direkter Chatversand nicht moeglich ist.
- Fuer manuelle Tests kann Backend-Chatversand mit `sendChat=0` oder `chatOutput=0` uebersprungen werden.
- Keine DB-, Dashboard-, Overlay- oder Config-Aenderung.

---

## 2026-05-11 - STEP238 DeathCounter Command-API Bridge

- `backend/modules/deathcounter_v2.js` erweitert.
- Neue zentrale Route `GET/POST /api/deathcounter/v2/command` ergaenzt.
- `command=dcount`, `command=rip` und `command=tode` werden serverseitig verarbeitet.
- Streamer.bot-kompatibles Antwortformat ergaenzt: `streamerbot_send` und `streamerbot_message`.
- `@`-Pflicht fuer Spielerbefehle technisch vorbereitet ueber `requireMention=1` bzw. Env-Fallback.
- Bestehende DeathCounter-Routen, JSON-State, Overlay und Zaehllogik bleiben erhalten.
- Keine DB-, Dashboard-, Overlay- oder Streamer.bot-Action-Aenderung.

---

## 2026-05-11 - STEP237 Hug/Rehug Command-Flow verifiziert

- Hug/Rehug Command-Flow per API geprueft.
- `/api/hug/command?command=hug...` funktioniert mit den Streamer.bot-relevanten Parametern.
- `/api/hug/command?command=rehug...` blockiert korrekt, wenn kein vorheriger Gegen-Hug existiert.
- `/api/hug/statscmd` und Toplisten funktionieren.
- Streamer.bot-Standard-URLs fuer Hug und Rehug dokumentiert.
- Wichtige Ausgaberegel dokumentiert: `result.streamerbot_send` beachten, damit Streamer.bot keine Doppelposts erzeugt.
- Keine Code-, Config-, Dashboard- oder DB-Dateien geaendert.

---

# CHANGELOG - stream-control-center

Aeltere ausfuehrliche STEP-Historie bleibt in den einzelnen `project-state/STEP*.md` Dateien erhalten. Dieses Changelog ist ab STEP232 bewusst als kompakte aktuelle Arbeitschronik gehalten.

## 2026-05-11 – STEP242.1 DeathCounter Dashboard Visible Players Fix

- Fixed DeathCounter dashboard visible player card by reading nested overlay state from the API response.
- No backend/database/count migration changes.
