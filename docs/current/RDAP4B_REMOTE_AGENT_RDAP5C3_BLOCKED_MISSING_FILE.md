# RDAP4B Remote Agent -> RDAP5C3 Blocker

Stand: 2026-06-23

## Ziel des geplanten Steps

`backend/modules/remote_agent.js` soll fachlich von RDAP4B auf RDAP5C3 korrigiert werden.

Kernpunkt:

- `sound_profi` darf keine Rolle sein.
- `sound_profi` darf kein festes globales Permission-Preset sein.
- `sound_profi` ist Gruppe/Markierung.
- Rollen und Gruppen bleiben getrennt.
- Modulrechte sollen ueber `target_type` + `target_key` / Modulmatrix gedacht werden.
- Bestehende read-only RDAP4B-Routen duerfen nicht entfernt werden.
- Keine Agent-Aktionen, Writes, Auth, Sessions oder Migrationen aktivieren.

## Ergebnis der Bestandspruefung

GitHub-Pruefung:

```text
backend/modules/remote_agent.js
```

war im abrufbaren Repo-Stand nicht vorhanden bzw. nicht abrufbar.

Suche nach:

```text
remote_agent
sound_profi
```

fand nur Doku-/Projektstatus-Dateien, aber keinen echten Code-Stand der Datei.

## Entscheidung

Keine Code-Aenderung wurde vorgenommen.

Grund:

Ohne die echte Datei darf nicht geraten werden. Es darf keine neue Parallel-Datei gebaut und keine Funktionalitaet entfernt oder erfunden werden.

## Benoetigt fuer Fortsetzung

Forrest muss eine der folgenden Optionen liefern:

1. die echte Datei:

```text
backend/modules/remote_agent.js
```

oder

2. ein aktuelles Projekt-ZIP mit echtem Pfad ab Repo-Root, das diese Datei enthaelt.

Danach kann der Step sauber fortgesetzt werden.

## Geplanter Scope nach Dateilieferung

Nach Lesen der echten Datei:

- konkrete Stellen mit `sound_profi` pruefen.
- Rollen-/Gruppen-Verwechslung korrigieren.
- bestehende Routen und read-only Verhalten erhalten.
- keine Write-/Agent-/Auth-/DB-Migration aktivieren.
- Tests/Pruefschritte nennen.
- ZIP/Commit nur mit echten Zielpfaden liefern.
