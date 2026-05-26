# STEP235 - Hug/Rehug Ist-Analyse und Live-API-Test

Stand: 2026-05-11

## Ergebnis

Hug/Rehug ist aktuell API-seitig healthy. Alle acht getesteten Status-, Integrations- und Dashboard-Routen antworten ohne Fehler.

## Testlog

Die Rohdaten dieses Tests liegen im Repo unter:

```text
project-state/HUG_LIVE_API_TEST_LOG_2026-05-11.jsonl
project-state/HUG_LIVE_API_TEST_SUMMARY_2026-05-11.txt
```

## Getestete Routen

| Test | OK | Fehler |
|---|---:|---|
| api_hug_status | True |  |
| api_hug_integration_check | True |  |
| api_hug_routes | True |  |
| dashboard_hug_status | True |  |
| dashboard_hug_text_pairs | True |  |
| dashboard_hug_all_texts | True |  |
| dashboard_hug_response_texts | True |  |
| dashboard_hug_top_title_texts | True |  |

## Kernstatus

```text
module: hug
schemaVersion: 3
source: database
enabled: True
DB adapter: sqlite
DB path: D:\Streaming\stramAssets\data\sqlite\app.sqlite
configPath: D:\Streaming\stramAssets\config\hug_system.json
messagesPath: D:\Streaming\stramAssets\config\messages\hug.json
rehugWindowSeconds: 300
topLimit: 5
```

## Datenbestand laut Status

| Bereich | Wert |
|---|---:|
| Users | 59 |
| Enabled Users | 58 |
| Disabled Users | 1 |
| Pair Stats | 195 |
| Pending Rehugs | 0 |
| Hug Types | 30 |
| Hug Text Pairs | 30 |
| Active Hug Text Pairs | 30 |
| Hug-All Texts | 20 |
| DB Texts gesamt | 107 |
| Total Hugs Given | 740 |
| Total Hugs Received | 683 |
| Total Rehugs Given | 56 |
| Total Rehugs Received | 56 |

## Textbereiche / Dashboard-Editoren

| Bereich | Count | Active | Tabelle/Kategorie |
|---|---:|---:|---|
| Hug/Rehug-Paare | 30 | 30 | hug_text_pairs / hug_pairs |
| Chatweite Hugs | 20 | 20 | hug_texts / hug_all |
| Systemantworten | 24 | 24 | hug_texts / responses |
| Toplisten-Titel | 3 | 3 | hug_texts / top_titles |

## Integration-Check

```text
summary.total = 12
summary.ok = 12
summary.warnings = 0
summary.errors = 0
routes.count = 29
```

| Check | OK | Level | Count/Source | Fehler |
|---|---:|---|---:|---|
| config_file | True | ok |  |  |
| messages_file | True | ok |  |  |
| hug_users | True | ok | 59 |  |
| hug_pair_stats | True | ok | 195 |  |
| hug_pending_rehugs | True | ok | 0 |  |
| hug_settings | True | ok | 1 |  |
| hug_types | True | ok | 30 |  |
| hug_texts | True | ok | 107 |  |
| hug_text_pairs | True | ok | 30 |  |
| runtime_cache | True | ok | database |  |
| active_text_pairs | True | ok | 30 |  |
| routes | True | ok | 29 |  |

## Aktive Hug-API-Routen laut `/api/hug/routes`

| Methode | Route | Zweck |
|---|---|---|
| GET | `/api/hug/status` | dashboard/runtime status |
| GET | `/api/hug/config` | sanitized config and seed-file summary |
| GET | `/api/hug/settings` | runtime settings and cache summary |
| GET | `/api/hug/routes` | list hug API routes |
| GET | `/api/hug/integration-check` | run non-destructive integration check |
| POST | `/api/hug/reload` | safe cache reload without chat output |
| GET | `/api/hug/reload` | legacy command reload with existing chat output |
| POST | `/api/hug/action` | execute hug/rehug action |
| POST | `/api/hug/stats` | return stats for request body |
| GET | `/api/hug/cmd` | Streamer.bot compatible command endpoint |
| GET | `/api/hug/statscmd` | Streamer.bot compatible stats command |
| GET | `/api/hug/top` | return hug top list |
| GET/POST | `/api/hug/command` | unified command endpoint |
| GET | `/api/hug/db/status` | legacy db status alias |
| GET | `/api/dashboard/community/hug/status` | dashboard status alias |
| GET | `/api/hug/text-store/status` | text store status alias |
| POST | `/api/hug/text-store/reload` | legacy JSON seed import/reload |
| GET | `/api/hug/db/output-mode` | read output mode |
| POST | `/api/hug/db/output-mode` | write output mode |
| GET | `/api/hug/types` | list hug types |
| GET | `/api/hug/texts` | list hug texts by kind/type |
| GET/POST | `/api/hug/admin/text-pairs` | admin text-pair editor |
| GET/POST | `/api/dashboard/community/hug/text-pairs` | dashboard text-pair editor alias |
| GET/POST | `/api/hug/admin/hug-all-texts` | admin chatwide hug text editor |
| GET/POST | `/api/dashboard/community/hug/hug-all-texts` | dashboard chatwide hug text editor alias |
| GET/POST | `/api/hug/admin/response-texts` | admin response text editor |
| GET/POST | `/api/dashboard/community/hug/response-texts` | dashboard response text editor alias |
| GET/POST | `/api/hug/admin/top-title-texts` | admin top title text editor |
| GET/POST | `/api/dashboard/community/hug/top-title-texts` | dashboard top title text editor alias |

## Bewertung

- Kein akuter Backend-Fehler gefunden.
- Hug/Rehug arbeitet aus der produktiven SQLite-Datenbank `app.sqlite`.
- Dashboard-Editor-Routen fuer Hug/Rehug-Paare, chatweite Hug-Texte, Systemantworten und Toplisten-Titel sind erreichbar.
- Die Textdaten sind bereits DB-basiert vorhanden.
- Der naechste Schritt ist kein Backend-Fix, sondern ein gezielter Dashboard-Schreibtest und danach ein Streamer.bot-/Chat-Flow-Test.

## Bewusst nicht geaendert

```text
backend/**
htdocs/**
config/**
data/**
app.sqlite
```

STEP235 ist reine Analyse/Dokumentation.

## Naechste Pruefungen

1. Dashboard: Hug/Rehug-Paar bearbeiten, speichern, Reload pruefen.
2. Dashboard: Chatweite Hug-Variante hinzufuegen/deaktivieren/loeschen.
3. Dashboard: Systemantwort bearbeiten und wieder zuruecksetzen.
4. Dashboard: Toplisten-Titel bearbeiten und wieder zuruecksetzen.
5. Streamer.bot Live-Flow pruefen:
   - `!hug @user`
   - `!rehug @user`
   - `!hug stats`
   - `!hug top`
   - `!hug top received`
   - `!hug top rehug`
6. Danach entscheiden, ob ein Code-Fix oder nur Abschluss-Doku noetig ist.
