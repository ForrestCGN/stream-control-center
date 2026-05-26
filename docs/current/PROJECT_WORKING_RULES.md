# PROJECT_WORKING_RULES

## Zweck

Diese Datei hält die verbindlichen Arbeitsregeln für das Projekt `stream-control-center` fest. Sie gilt für weitere STEPs, Übergaben und neue Chats.

## Projektpfade

- Repository: `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-System: `D:\Streaming\stramAssets`
- Produktive SQLite-Datenbank: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

## Grundregeln

- Deutsch antworten.
- Keine Funktionalität entfernen.
- Alte produktive Systeme bleiben bestehen, bis eine Migration ausdrücklich geplant, umgesetzt und getestet wurde.
- GitHub/dev und Live-System dürfen nicht unbewusst auseinanderlaufen.
- Bei benötigten Dateien zuerst GitHub/dev vollständig prüfen.
- Wenn GitHub/dev nicht vollständig, nicht aktuell oder unzuverlässig ist, exakt die benötigte Datei anfordern.
- Keine erfundenen Dateien, Helper, Routen oder Modulzustände annehmen.

## Schrittlogik

Vor jeder Änderung immer nennen:

1. Ziel des STEPs
2. Betroffene Dateien
3. Was geändert wird
4. Was bewusst nicht geändert wird
5. Welche Tests danach nötig sind

Dann erst arbeiten.

Wenn Analyse nötig ist:

1. Erst analysieren.
2. Ergebnis nennen.
3. Kleinen STEP vorschlagen.

## Bedeutung von `go`

Wenn Forrest `go` schreibt, gilt:

- exakt mit dem zuletzt gemeinsam bestätigten Schritt weitermachen
- keine neue Richtung
- keine neue Interpretation
- keine Zusatzideen
- keine ungeplanten Designänderungen
- keine ungeplanten Backendänderungen
- keine Doku-only-STEPS, außer sie sind ausdrücklich Bestandteil des bestätigten Schritts
- keine Workarounds

## Datei-Regeln

Verbindlich verboten:

- keine Patches
- keine Git-Patches
- keine PowerShell-Textpatches
- keine `Set-Content`-/Regex-/Inline-Patch-Scripte
- keine Workarounds mit Teil-Dateien
- keine halben Ersatzlösungen

Wenn eine Datei geändert wird:

1. Datei vollständig aus GitHub/dev oder Upload lesen.
2. Wenn das nicht vollständig und zuverlässig geht: konkrete Datei anfordern.
3. Nur vollständige echte Datei als Basis verwenden.
4. Vollständige geänderte Ersatzdatei liefern.
5. ZIP mit echtem Zielpfad ab Repo-Root bauen.

Wenn eine Datei fehlt, exakt sagen:

```text
Ich brauche genau diese Datei:
[Pfad]
```

## ZIP-Regeln

ZIPs müssen direkt nach folgendem Pfad entpackbar sein:

```text
D:\Git\stream-control-center
```

ZIPs enthalten echte Zielpfade ab Repo-Root, zum Beispiel:

```text
backend/modules/example.js
htdocs/dashboard/modules/example.js
htdocs/dashboard/modules/example.css
htdocs/overlays/example.html
config/example.json
docs/current/CURRENT_SYSTEM_STATUS.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/STEPxxx_NAME.md
```

Nicht erlaubt:

- lose Dateien
- verkürzte Teilpfade
- Copy-Item-Platzhalter
- ZIPs/7z im Repo

## Standardabschluss nach ZIP

Nach einem ZIP immer nur den notwendigen Ablauf geben.

Pflicht:

```bat
cd D:\Git\stream-control-center
```

Dann nur für tatsächlich geänderte JavaScript-Dateien:

```bat
node --check pfad\zur\geänderten_datei.js
```

Danach:

```bat
.\stepdone.cmd "passende Beschreibung"
```

Wichtig:

- `node --check` nur für geänderte JS-Dateien nennen.
- Wenn keine JS-Dateien geändert wurden, ausdrücklich sagen: `Keine JS-Dateien geändert, daher kein node --check nötig.`
- Keine langen manuellen `git add` / `commit` / `push` / `deploy`-Ketten ausgeben, solange `stepdone.cmd` der Standard ist.
- Wenn `stepdone.cmd` fehlschlägt: Fehlerausgabe prüfen, gezielt reparieren, nicht blind Umwege bauen.

## Shell-/PowerShell-Ausgabe-Regel

Bei Shell-/PowerShell-Befehlen sollen Ausgaben möglichst kurz und kopierfreundlich sein.

Regeln:

- Nur notwendige Befehle ausgeben.
- Keine langen Diagnoseblöcke, wenn wenige Felder reichen.
- Für Statusprüfungen bevorzugt gezielte Feldauswahl statt kompletter JSON-Dumps.
- Komplette `ConvertTo-Json -Depth 10` Ausgaben nur anfordern, wenn wirklich nötig.
- Bei großen JSON-Antworten gezielt `Select-Object` oder konkrete Properties nutzen.
- Keine mehrfachen Alternativbefehle ausgeben, wenn ein klarer Test reicht.
- Ergebnis-Erwartung kurz darunter nennen.

Bevorzugtes Muster:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/example/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Nur wenn Detailanalyse nötig ist:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/example/status" | ConvertTo-Json -Depth 10
```

## Doku-Regeln

Nach jeder Code- oder Strukturänderung liefern:

1. Syntaxprüfung
2. relevante API-/Live-Tests
3. ZIP mit echten Zielpfaden
4. STEP-Doku unter `project-state/`
5. Aktualisierung von `docs/current/CURRENT_SYSTEM_STATUS.md`, wenn zentraler Stand betroffen ist
6. Aktualisierung von `project-state/CURRENT_STATUS.md`
7. Aktualisierung von `project-state/CHANGELOG.md`
8. Aktualisierung von `project-state/FILES.md`
9. Aktualisierung von `project-state/NEXT_STEPS.md`
10. kurze Abschlussübersicht

Keine `CURRENT_STATUS_APPEND_*.md` erzeugen, wenn `CURRENT_STATUS.md` vorhanden ist.

## Dashboard-Regeln

- Dashboard greift nie direkt auf SQLite oder Dateien zu.
- Dashboard nutzt immer Backend-APIs.
- Vor Dashboard-Arbeiten prüfen:
  - Gibt es bereits ein Dashboard-Modul?
  - Gibt es Backend-Routen?
  - Gibt es Settings-/Config-/Textmuster?
  - Gibt es vorhandene CSS-/JS-Modulstruktur?
  - Gibt es Rechte-/Security-Muster?
- Dashboard-UX soll praktisch, schlank und verständlich sein.
- Keine unnötigen Techniktexte, Boxen oder Hinweise.
- Größere Module sollen Tabs/Unterbereiche nutzen, damit nicht alles auf einer Seite landet.
- Bei Screenshots oder UX-Feedback erst prüfen, ob die Änderung wirklich besser wird.

## Datenbank-Regeln

- Produktive SQLite-Datenbank niemals neu bauen.
- Produktive SQLite-Datenbank niemals überschreiben.
- Produktive SQLite-Datenbank niemals ersetzen.
- Keine Datenbank-Dateien committen.
- Schemaänderungen nur additiv und sicher.
- `CREATE TABLE IF NOT EXISTS` bevorzugen.
- Bestehende Tabellen und Daten nicht beschädigen.
- Neue DB-Zugriffe bevorzugt über `backend/core/database.js` oder vorhandene Helper kapseln.
- MariaDB langfristig berücksichtigen, aber keine bestehende SQLite-Funktionalität für theoretische MariaDB-Vorbereitung brechen.

## EventBus-Regeln

- EventBus darf produktive Abläufe nicht nebenbei ersetzen.
- EventBus-Umstellungen nur als eigener geplanter STEP.
- Gute EventBus-Schritte:
  1. Status-/Diagnose-Events ergänzen
  2. Smoke-Test-Route ergänzen
  3. Status-/Reset-Routen ergänzen
  4. Live-Test mit echtem Flow
  5. Erst danach produktive Bus-Ausgabe oder Bus-First
- EventBus-Events sollen sprechende Channels und Actions haben, z. B. `module.started`, `module.finished`, `module.queue.updated`.

## Sound-System-Regeln

Das Sound-System ist die zentrale Audio-/Medien-Schicht.

Nicht ungeprüft ändern:

- Queue-Prioritäten
- Bundle-/Lock-Logik
- TTS-Kopplung
- SoundAlerts
- Modul-Sounds
- Overlay-Visuals
- Discord-Ausgabe
- Lautstärke-/Output-Ziele

Sound-System-Umbauten nur als eigener geplanter Block.

## Versionsregel

In produktiven Dateien und APIs Versionsnummern verwenden, keine STEP-Nummern als dauerhafte technische Kennzeichnung.

Gut:

```text
version: "1.2.0"
moduleVersion: "1.2.0"
```

Nicht als Runtime-Kennung:

```text
step: 407
STEP407
feature_step
```

STEPs sind für ZIP-Namen, Doku, Übergaben und Projektverlauf erlaubt.

## Sicherheitsregeln

Nicht committen oder anzeigen:

- Secrets
- `.env`
- Tokens
- Datenbanken
- Backups
- temporäre Dateien
- ZIPs/7z

---

## Ergänzung ab STEP480: Modul-Doku, Versionsnummern und EventBus

Vor Änderungen an Modulen müssen die passenden Dateien unter `docs/modules/` geprüft werden.

Wenn ein Modul geändert wird, muss die jeweilige Modul-Doku im selben STEP aktualisiert werden. Das gilt besonders für Routen, Configs, Datenbanktabellen, Statusfelder, EventBus-Events, Dashboard-Dateien, Overlay-Dateien und Runtime-Dateien.

Neue oder angefasste Module sollen eine klare `version` oder `moduleVersion` nutzen. STEP-Nummern bleiben Projekt-/Doku-/ZIP-Kennzeichnungen und sollen nicht als dauerhafte Runtime-Version verwendet werden.

Der Communication Bus / EventBus soll schrittweise zur zentralen Kommunikations- und Überwachungsschicht werden. Module sollen perspektivisch Start/Stop, Status, Health, Heartbeats, Fehler, Warnungen und Queue-/Runtime-Zustände melden. Bestehende produktive Flows dürfen dadurch nicht ungeprüft ersetzt werden.

Details stehen in:

```text
docs/current/MODULE_DOCS_VERSION_EVENTBUS_RULES_2026-05-26.md
project-state/GENERAL_PROJECT_PROMPT.md
docs/modules/README.md
```

