# TODO / Offene Punkte

Diese Datei ist die zentrale ToDo-/Offene-Punkte-Liste für das Projekt `stream-control-center`.

Regel:

- Offene Ideen, Bugs, spätere Umbauten und bewusst verschobene Aufgaben hier festhalten.
- Erledigte Punkte im passenden STEP aus dieser Datei entfernen oder als erledigt markieren, wenn die Historie wichtig ist.
- Unmittelbare Einbau-/Testschritte gehören zusätzlich nach `project-state/NEXT_STEPS.md`.
- Modulbezogene Zusatzlisten sind erlaubt, wenn ein Thema groß genug wird.

## Aktuell offen

### Doku / Cleanup

- Alte STEP-/APPEND-/Snapshot-Dateien später in einem eigenen Cleanup-STEP bewerten.
- Alte Dateien nicht blind löschen; zuerst klären, ob sie noch Übergabe-/Historienwert haben.
- Prüfen, ob alte Doku-Dateien nach `project-state/archive/` oder einen klareren Archivbereich verschoben werden sollen.
- Prüfen, ob `docs/current/` wirklich nur aktuelle zentrale Doku enthalten soll oder ob alte STEP-Dateien dort archiviert werden.
- Modul-Dokus schrittweise auf aktuellen Stand bringen, beginnend mit den produktiv wichtigsten Systemen.
- Versionskennungen in Modulen später prüfen und vereinheitlichen, aber nicht nebenbei erzwingen.
- Vor Repo-/Commit-Arbeiten prüfen, ob Runtime-/Backup-Dateien wie `backend/data/app.sqlite`, `backend/data/deathcounter.v2.json` oder `*.bak*` im echten Repo liegen und ausgeschlossen werden müssen.

### Shoutout-System

- Shoutout-Dashboard in Tabs/Unterbereiche aufteilen, damit nicht alles auf einer Seite steht.
- Gewünschte Tabs/Unterbereiche:
  - Übersicht
  - Queues
  - Statistik
  - Timeline
  - Settings/Test
- Eingehende Twitch-Shoutouts loggen und im Dashboard/statistisch anzeigen.
- Prüfen, welche Twitch EventSub-Events und Scopes dafür im bestehenden Twitch-/EventSub-System bereits verfügbar sind.
- Inbound-Statistik getrennt von Outbound-Statistik darstellen.

### Stream-Status

- `stream_status` bei echtem Streamstart/Streamende live testen.
- Prüfen, ob Twitch-Live-Verzögerung mit Restart-Grace/Sessionlogik sauber abgefangen wird.
- Weitere Module schrittweise auf zentralen Stream-Status umstellen, statt eigene Datei-/Livechecks zu verwenden.

### Dashboard allgemein

- Große Module konsequent in Tabs/Unterbereiche aufteilen.
- Dashboard-Ausgaben schlank halten und nicht mit Technikboxen überladen.
- Bei neuen Modulen immer prüfen, ob sie in `htdocs/dashboard/app.js`, `index.html`, CSS und Modul-Katalog sichtbar und auffindbar sind.
- Dashboard-Doku je Modul aktualisieren, sobald das Modul fachlich angefasst wird.

### Modul-Doku-Prioritäten

- Alerts-Doku aktualisieren.
- Sound-System-Doku aktualisieren.
- VIP-Sound-Overlay-Doku aktualisieren.
- Birthday-Doku aktualisieren, bevor daran weitergebaut wird.
- Hug/Rehug-Doku aktualisieren.
- TTS-System-Doku aktualisieren.
- Message-Rotator-Doku aktualisieren.
- Clip-System-Doku aktualisieren.
- Loyalty-Doku aktualisieren.
- Deathcounter-Doku aktualisieren.
- OBS-/Scene-Control-Doku aktualisieren.
- Discord-/Twitch-/EventSub-Doku aktualisieren.

### Projekt-/Arbeitsregeln

- Bei jedem STEP prüfen, ob `project-state/TODO.md` und `project-state/NEXT_STEPS.md` aktualisiert werden müssen.
- Shell-/PowerShell-Ausgaben kurz halten und bevorzugt gezielte Feldauswahl statt großer JSON-Dumps nutzen.
- Keine Doku-Only-STEPs nebenbei, außer sie sind ausdrücklich Ziel des aktuellen STEPs.
