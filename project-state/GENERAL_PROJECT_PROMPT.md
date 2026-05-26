# GENERAL_PROJECT_PROMPT

Wir arbeiten am Projekt `stream-control-center` / Kommunikations-System für ForrestCGN.

Bitte antworte auf Deutsch und halte dich strikt an diese Arbeitsweise.

## Projektbasis

- Repo: `https://github.com/ForrestCGN/stream-control-center`
- Branch: `dev`
- Lokales Repo: `D:\Git\stream-control-center`
- Live-Ziel: `D:\Streaming\stramAssets`
- Produktive SQLite-Datenbank: `D:\Streaming\stramAssets\data\sqlite\app.sqlite`

GitHub/dev und echte Projektdateien sind die Single Source of Truth. Wenn der lokale Teststand durch ZIPs neuer ist als GitHub/dev, nach den konkreten Dateien fragen.

## Verbindliche Grundregeln

- Keine Funktionalität entfernen.
- Keine Patches.
- Keine Git-Patches.
- Keine PowerShell-Regex- oder Inline-Patch-Scripte.
- Keine `Set-Content`-Workarounds.
- Keine Teil-Dateien liefern.
- Änderungen nur als vollständige Ersatzdateien im ZIP.
- ZIPs müssen direkt nach `D:\Git\stream-control-center` entpackbar sein.
- ZIPs enthalten echte Zielpfade ab Repo-Root.
- Keine Secrets, `.env`, Tokens, Datenbanken, Backups, temporären Dateien, ZIPs oder 7z ins Repo.
- Die produktive SQLite-Datenbank niemals ersetzen, überschreiben oder neu bauen.
- Schemaänderungen nur additiv und sicher.

## Vor jeder Änderung

Immer zuerst nennen:

1. Ziel des STEPs
2. Betroffene Dateien
3. Was geändert wird
4. Was bewusst nicht geändert wird
5. Welche Tests danach nötig sind

Dann erst arbeiten.

Wenn Analyse nötig ist: erst analysieren, dann Ergebnis nennen, dann einen kleinen STEP vorschlagen.

## Bedeutung von `go`

Wenn ich `go` schreibe, mache exakt mit dem zuletzt gemeinsam bestätigten Schritt weiter.

Kein Richtungswechsel. Keine Zusatzideen. Keine ungeplanten Designänderungen. Keine ungeplanten Backendänderungen. Keine Workarounds.

## Datei-/ZIP-Regel

Wenn eine Datei geändert werden soll:

1. Datei vollständig aus GitHub/dev lesen.
2. Wenn das nicht vollständig oder nicht aktuell ist, exakt die benötigte Datei anfordern.
3. Nur vollständige echte Datei als Basis verwenden.
4. Vollständige Ersatzdatei liefern.
5. ZIP mit echtem Zielpfad ab Repo-Root bauen.

Beispiele für gültige ZIP-Pfade:

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

## Standardabschluss nach ZIP

Nach einem ZIP nur den notwendigen Ablauf geben:

```bat
cd D:\Git\stream-control-center
```

Nur für geänderte JavaScript-Dateien:

```bat
node --check pfad\zur\datei.js
```

Danach:

```bat
.\stepdone.cmd "passende Beschreibung"
```

Wenn keine JavaScript-Datei geändert wurde, ausdrücklich sagen:

```text
Keine JS-Dateien geändert, daher kein node --check nötig.
```

Keine langen manuellen Git-/Deploy-Ketten ausgeben, außer `stepdone.cmd` funktioniert nicht.

## Shell-/PowerShell-Ausgaben

Befehle und Tests kopierfreundlich kurz halten.

- Nur notwendige Befehle ausgeben.
- Für Statusprüfungen gezielte Feldauswahl bevorzugen.
- Große JSON-Dumps nur anfordern, wenn wirklich nötig.
- Keine langen Diagnoseblöcke, wenn wenige Felder reichen.

Bevorzugt:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/example/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Nur bei Detailanalyse:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/example/status" | ConvertTo-Json -Depth 10
```

## Dashboard-Regeln

- Dashboard greift immer über Backend-APIs zu.
- Dashboard greift nicht direkt auf SQLite oder Dateien zu.
- Vor Dashboard-Arbeiten vorhandene Module, Routen, CSS-/JS-Struktur, Settings-/Config-/Textmuster und Security-Muster prüfen.
- UX praktisch, schlank und verständlich halten.
- Große Dashboard-Module in Tabs/Unterbereiche aufteilen; nicht alles auf eine Seite packen.
- Keine unnötigen Techniktexte oder Boxen.

## EventBus- und Sound-Regeln

- EventBus ersetzt produktive Abläufe nicht nebenbei.
- EventBus-Umstellungen nur als eigener geplanter und getesteter STEP.
- Sound-System ist zentrale Audio-/Medien-Schicht und darf nicht nebenbei umgebaut werden.
- Stabile Queue-, Prioritäts-, TTS-, SoundAlert-, Discord-, Overlay- und Output-Logik nicht ungeprüft ändern.

## Versionsregel

Produktive Module und APIs verwenden Versionsnummern, nicht STEP-Nummern als Runtime-Kennung.

Gut:

```text
moduleVersion: "0.2.10"
```

STEPs nur für ZIP-Namen, Doku, Übergaben und Projektverlauf nutzen.

## Aktueller Kontext

Zuletzt relevant:

- `stream_status` steht auf Runtime-Version `0.1.2` mit API-First und Auto-Refresh.
- `clip_shoutout` steht auf Runtime-Version `0.2.10` mit Statistik-Routen.
- Shoutout-Dashboard ist vorhanden, aber UX soll als nächstes in Tabs/Unterbereiche aufgeteilt werden.
- Gewünschter nächster Funktionsausbau später: eingehende Twitch-Shoutouts loggen und in der Statistik anzeigen.
