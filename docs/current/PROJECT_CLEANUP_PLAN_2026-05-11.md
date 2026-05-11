# PROJECT CLEANUP PLAN - stream-control-center

Stand: 2026-05-11

## Ziel

Das Projekt soll besser navigierbar werden, ohne historische Informationen oder funktionierende Systeme zu verlieren.

## Befund aus dem bereitgestellten ZIP

```text
Gesamtdateien: 578
Doku-Dateien in docs/: 101
Projektstatus-Dateien in project-state/: 477
Dateien direkt in project-state/: 466
APPEND-Dateien: 127
STATUS_NOTE-Dateien: 26
HANDOFF-Dateien: 15
STEP201-Dateien: 155
```

## Bewertung

Das Problem ist nicht fehlende Dokumentation, sondern zu viel gleichrangige Dokumentation. Die wichtigen aktuellen Informationen sind dadurch schwerer zu finden.

## Sofort umgesetzter Cleanup in STEP232

- `docs/current/CURRENT_SYSTEM_STATUS.md` wurde als kompakter aktueller Einstieg neu sortiert.
- `project-state/NEXT_STEPS.md` wurde auf aktuelle Prioritaeten reduziert.
- `project-state/FILES.md` dokumentiert jetzt den Doku-Cleanup und die aktuellen Hauptdateien.
- `project-state/CHANGELOG.md` bekommt einen klaren STEP232-Eintrag.
- Eine neue Doku-Karte wurde erstellt: `docs/current/PROJECT_DOCUMENTATION_MAP_2026-05-11.md`.
- Diese Cleanup-Plan-Datei wurde erstellt.

## Bewusst nicht gemacht

- Keine Code-Dateien geaendert.
- Keine historischen STEP-Dateien geloescht.
- Keine APPEND-Dateien verschoben.
- Keine Doku nach `htdocs` kopiert.
- Keine Datenbank-/Config-/Runtime-Dateien angefasst.

## Empfohlene weitere Cleanup-Reihenfolge

### Phase 1 - Orientierung stabilisieren

Status: mit STEP232 erledigt.

- Aktuelle Einstiegspunkte klar definieren.
- Historische Snapshots klar als historische Snapshots markieren.
- NEXT_STEPS auf echte aktuelle Arbeit reduzieren.

### Phase 2 - Append-/Status-Notizen einordnen

Noch offen.

Ziel:

```text
project-state/archive/appends/
project-state/archive/status-notes/
docs/archive/handoffs/
docs/archive/old-current-notes/
```

Vorgehen:

1. Nur Dateien verschieben, deren Inhalt bereits in Hauptdokumente uebernommen wurde.
2. Vorher Liste erzeugen.
3. ZIP mit echten Zielpfaden liefern.
4. Keine Inhalte loeschen.

### Phase 3 - Modul-Doku je System vereinheitlichen

Noch offen.

Pro Modul eine kompakte Statusdatei:

```text
docs/modules/message_rotator.md
docs/modules/alerts.md
docs/modules/twitch.md
docs/modules/loyalty.md
docs/modules/tagebuch_todo.md
docs/modules/sound_system.md
docs/modules/hug.md
```

### Phase 4 - Automatisch generierte Struktur aktualisieren

Noch offen.

Betroffene Dateien koennten sein:

```text
docs/_generated/ROUTES.md
docs/_generated/DASHBOARD_MODULES.md
docs/_generated/CONFIGS_AND_DATA.md
docs/_generated/FUNCTIONS.md
docs/_generated/PROJECT_NAVIGATION.md
```

Nur aktualisieren, wenn der Generator/Quelle bekannt ist oder der echte Repo-Stand vollstaendig vorliegt.

## Wichtigste No-Gos

- Keine historischen Dateien blind loeschen.
- Keine alte Analyse als aktuellen Stand verkaufen.
- Keine neuen Parallel-Doku-Strukturen ohne Zweck.
- Keine Doku-Dateien in `htdocs` ablegen.
- Keine Runtime-Dateien, Datenbanken oder Secrets anfassen.


## STEP260 Cleanup-Ergänzung DeathCounter

Status: erledigt fuer DeathCounter-Doku.

Umgesetzt:

- DeathCounter-DB-Umbau in einer stabilen Current-Doku zusammengeführt.
- Aktive Einstiegspunkte auf finalen DeathCounter-Stand aktualisiert.
- Full Maps fuer Config/DB und Module/Routen wieder als vollständige Arbeitskarten geführt und DeathCounter ergänzt.
- Keine historischen STEP-Dateien gelöscht.
- Keine APPEND-/STATUS_NOTE-Dateien verschoben.

Bewusst offen fuer einen separaten Cleanup-Step:

```text
project-state/*APPEND*.md
project-state/*STATUS_NOTE*.md
docs/current/*STATUS_NOTE*.md
docs/handoffs/NEXT_CHAT_HANDOFF_*.md
```

Diese Dateien nur später in einem eigenen Archiv-STEP verschieben, nicht löschen.
