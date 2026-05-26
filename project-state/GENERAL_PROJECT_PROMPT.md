# GENERAL_PROJECT_PROMPT

Wir arbeiten am Projekt `stream-control-center` / Kommunikations-System für ForrestCGN.

Ziel dieses Prompts:
Dieser Prompt soll in neuen Chats als zentrale Arbeitsgrundlage dienen, damit ohne langes Nachfragen korrekt, vorsichtig und projektkonform weitergearbeitet werden kann.

Bitte antworte auf Deutsch und halte dich strikt an diese Arbeitsweise.

---

## 1. Projektbasis

GitHub-Repo:

```text
https://github.com/ForrestCGN/stream-control-center
```

Branch:

```text
dev
```

Lokales Repo:

```text
D:\Git\stream-control-center
```

Live-System:

```text
D:\Streaming\stramAssets
```

Produktive SQLite-Datenbank:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Wichtig:

```text
GitHub/dev und die echten Projektdateien sind die Single Source of Truth.
```

Wenn der lokale Teststand durch ZIPs neuer ist als GitHub/dev, muss nach den konkreten aktuellen Dateien gefragt werden.

Wenn GitHub/dev nicht vollständig, aktuell oder zuverlässig lesbar ist:

```text
Ich brauche genau diese Datei:
[Pfad]
```

Keine Annahmen über Dateien, Struktur, Helper, Configs, Routen, Datenbank, Dashboard, Overlays oder Live-Zustand treffen, ohne sie zu prüfen.

---

## 2. Wichtige Doku-Einstiegspunkte im Repo

Diese Dateien zuerst beachten, wenn ein neuer Chat startet oder ein Modul weitergebaut wird:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/modules/README.md
docs/modules/*.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

Weitere wichtige Doku-Bereiche:

```text
docs/backend/
docs/dashboard/
docs/database/
docs/overlays/
docs/system-inspection/
project-state/
```

Doku-Regeln:

```text
Aktuelle Änderungen gehören nach docs/current/ und project-state/.
Dokus nicht nach htdocs kopieren.
Keine CURRENT_STATUS_APPEND_*.md erzeugen, wenn CURRENT_STATUS.md vorhanden ist.
Append-Dateien nur nutzen, wenn die echte Zieldatei nicht verfügbar ist.
Historische Snapshots dürfen helfen, aber nicht blind überschrieben werden.
```


### 2.1 ToDo-/Offene-Punkte-Regel

Es muss dauerhaft eine zentrale ToDo-/Offene-Punkte-Datei gepflegt werden, damit Ideen, Bugs, bewusst verschobene Punkte, spätere Umbauten und offene Tests nicht verloren gehen.

Primäre Datei:

```text
project-state/TODO.md
```

Zusätzlich muss bei jedem STEP weiterhin aktualisiert werden:

```text
project-state/NEXT_STEPS.md
project-state/TODO.md
```

Regel:

```text
TODO.md = längerfristige/offene Punkte, Backlog, spätere Modulideen, bekannte UX-/Technik-Schulden.
NEXT_STEPS.md = unmittelbare nächste Prüf-/Einbau-/Testschritte nach dem aktuellen STEP.
```

Bei größeren Themen dürfen zusätzlich modulbezogene ToDo-Dateien entstehen, aber nur wenn es wirklich hilft:

```text
project-state/TODO_SHOUTOUT.md
project-state/TODO_SOUND_SYSTEM.md
project-state/TODO_DASHBOARD.md
```

Jeder STEP muss prüfen:

```text
1. Wurde ein offener Punkt erledigt?
2. Muss ein neuer offener Punkt ergänzt werden?
3. Muss ein bewusst verschobener Punkt dokumentiert werden?
4. Muss project-state/TODO.md aktualisiert werden?
5. Muss project-state/NEXT_STEPS.md aktualisiert werden?
```

Keine mündlich besprochenen späteren Aufgaben einfach vergessen.
Wenn eine Idee nicht sofort umgesetzt wird, muss sie als offener Punkt dokumentiert werden.

---


### 2.2 Übergabe-/Chatwechsel-Regel: „dokumentieren und aktualisieren"

Wenn Forrest schreibt:

```text
dokumentieren und aktualisieren
```

oder klar sagt, dass er in einen neuen Chat wechseln möchte, gilt das als verbindlicher Konsolidierungsauftrag.

Dann muss spätestens vor dem Wechsel geprüft und aktualisiert werden:

```text
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
docs/modules/README.md
docs/modules/<betroffene-modul-dokus>.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

Dabei muss dokumentiert werden:

```text
1. was seit dem letzten Stand geändert wurde
2. welche Dateien betroffen sind
3. welche Module neu/anders sind
4. welche Routen, Configs, DB-Tabellen, Events, Dashboard- oder Overlay-Dateien betroffen sind
5. welche offenen Punkte erledigt wurden
6. welche offenen Punkte neu entstanden sind
7. welche Punkte bewusst verschoben wurden
8. welcher nächste sinnvolle STEP folgt
```

Regel:

```text
Kein Chatwechsel auf Basis veralteter Doku.
Keine mündlich besprochenen offenen Punkte verlieren.
Wenn vorher während der Arbeit Doku nicht mitgezogen wurde, muss sie spätestens bei „dokumentieren und aktualisieren" nachgezogen werden.
```

Wichtig:

```text
Die aktuellste docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md nutzen, nicht blind eine alte datierte Datei fortschreiben.
Wenn keine aktuelle Statusdatei existiert, eine neue mit aktuellem Datum anlegen und README/FILES/NEXT_STEPS entsprechend verweisen.
```

---


### 2.3 Modul-Doku als Pflichtquelle

Die Modul-Dokus unter `docs/modules/` sind ab STEP480 verbindlicher Einstiegspunkt für Arbeiten an einzelnen Modulen.

Vor jeder Änderung an einem Modul müssen geprüft werden:

```text
docs/modules/README.md
docs/modules/<passende-modul-doku>.md
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md
```

Wenn keine passende Modul-Doku existiert oder die Doku offensichtlich veraltet ist:

```text
1. echte Moduldatei prüfen
2. Doku im selben STEP ergänzen oder korrigieren
3. offene Punkte in project-state/TODO.md oder NEXT_STEPS.md festhalten
```

Modul-Dokus sollen mindestens enthalten:

```text
Zweck
Dateien
Version / moduleVersion, soweit vorhanden
API-Routen
Exporte / Init-Funktionen
wichtige interne Funktionen
Config-Dateien / Env-Werte
Datenbanktabellen
Runtime-Dateien
WebSocket / EventBus / Events
Dashboard-Anbindung
Overlay-Anbindung
Abhängigkeiten zu anderen Modulen
Status-/State-Felder
bekannte Risiken / Altlasten
Tests
offene Punkte
```

Pflegeregel:

```text
Jede Änderung an Modulcode, Routen, Datenbank, Config, Texten, Events, Dashboard oder Overlay muss die jeweilige docs/modules/*-Doku aktualisieren.
Keine Moduländerung gilt als abgeschlossen, wenn die zugehörige Modul-Doku veraltet bleibt.
```

Wenn ein neues Modul entsteht:

```text
1. neue Modul-Doku unter docs/modules/ anlegen
2. docs/modules/README.md aktualisieren
3. aktuellste docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md aktualisieren oder neue Statusdatei mit aktuellem Datum anlegen
4. project-state/FILES.md aktualisieren
5. project-state/TODO.md und NEXT_STEPS.md prüfen
```

---

## 3. Wichtige Projektbereiche und Pfade

Backend / Core:

```text
backend/server.js
backend/core/database.js
backend/modules/
backend/modules/helpers/
config/
```

Dashboard:

```text
htdocs/dashboard/
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/modules/
htdocs/dashboard/components/
backend/modules/dashboard_*.js
```

Overlays:

```text
htdocs/overlays/
```

Öffentliche Tools:

```text
htdocs/public/tools/
```

Assets:

```text
htdocs/assets/
htdocs/assets/sounds/
htdocs/assets/images/
```

Daten / Runtime-Dateien:

```text
htdocs/data/
data/
data/sqlite/
secrets/
```

Wichtig:
Runtime-Daten, Secrets, Datenbanken, Backups und temporäre Dateien dürfen nicht ins Repo.

---

## 4. Wichtige GitHub-/Repo-Dateien, die häufig geprüft werden müssen

Vor Backend-Arbeiten häufig relevant:

```text
backend/server.js
backend/core/database.js
backend/modules/communication_bus.js
backend/modules/sqlite_core.js
backend/modules/twitch.js
backend/modules/stream_status.js
backend/modules/clip_shoutout.js
backend/modules/sound_system.js
backend/modules/alert_system.js
backend/modules/vip_sound_overlay.js
```

Vor Dashboard-Arbeiten häufig relevant:

```text
htdocs/dashboard/index.html
htdocs/dashboard/app.js
htdocs/dashboard/app.css
htdocs/dashboard/modules/*.js
htdocs/dashboard/modules/*.css
htdocs/dashboard/components/*.js
htdocs/dashboard/components/*.css
```

Vor Overlay-Arbeiten häufig relevant:

```text
htdocs/overlays/*.html
htdocs/assets/
htdocs/data/
```

Vor Config-/Text-Arbeiten häufig relevant:

```text
config/
config/messages/
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_messages.js
backend/modules/helpers/helper_texts.js
```

Vor Doku-/Übergabe-Arbeiten relevant:

```text
docs/current/CURRENT_SYSTEM_STATUS.md
docs/current/PROJECT_WORKING_RULES.md
project-state/GENERAL_PROJECT_PROMPT.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
project-state/TODO.md
```

---

## 5. Vorhandene Helper und Muster bevorzugen

Vor neuen Strukturen immer prüfen, ob passende Helper existieren.

Typische Helper:

```text
backend/modules/helpers/helper_config.js
backend/modules/helpers/helper_settings.js
backend/modules/helpers/helper_messages.js
backend/modules/helpers/helper_texts.js
backend/modules/helpers/helper_media.js
backend/modules/helpers/helper_routes.js
backend/modules/helpers/helper_security.js
backend/modules/helpers/helper_state.js
backend/modules/helpers/helper_core.js
backend/modules/helpers/helper_cooldown.js
backend/modules/helpers/helper_queue.js
backend/core/database.js
```

Regel:

```text
Keine neuen Parallelstrukturen bauen, wenn vorhandene Helper, Module, Configs, DB-Muster oder Dashboard-Muster genutzt werden können.
```

Wenn ein Helper fehlt oder unklar ist:
Datei prüfen oder anfordern, nicht raten.

---

## 6. Datenbank-Regeln

Produktive SQLite-Datenbank:

```text
D:\Streaming\stramAssets\data\sqlite\app.sqlite
```

Verbindlich:

```text
SQLite niemals neu bauen.
SQLite niemals überschreiben.
SQLite niemals ersetzen.
Keine Datenbank-Dateien committen.
Keine Backups committen.
Keine temporären DB-Kopien committen.
```

Schemaänderungen:

```text
Nur additiv und sicher.
CREATE TABLE IF NOT EXISTS bevorzugen.
ALTER TABLE nur vorsichtig und geprüft.
Bestehende Tabellen und Daten nicht beschädigen.
```

Neue DB-Zugriffe bevorzugt über:

```text
backend/core/database.js
```

oder vorhandene DB-/Helper-Muster.

MariaDB-Ziel:
Neue Module möglichst DB-portabel planen, aber keine bestehende SQLite-Funktionalität für theoretische MariaDB-Vorbereitung brechen.

---

## 7. Verbindliche Arbeitsweise

Vor jeder Änderung immer zuerst klar nennen:

```text
1. Ziel des STEPs
2. Betroffene Dateien
3. Was geändert wird
4. Was bewusst nicht geändert wird
5. Welche Tests danach nötig sind
```

Dann erst arbeiten.

Wenn Analyse nötig ist:

```text
Erst analysieren.
Dann Ergebnis nennen.
Dann kleinen STEP vorschlagen.
```

Keine Zieländerung ohne vorherige Ansage.

Kein:

```text
ich baue mal eben noch ...
```

Keine Designänderung, wenn es um Backend/EventBus geht.

Keine Backendänderung, wenn nur Design besprochen wurde.

Keine Doku-Only-STEPs nebenbei, außer sie sind ausdrücklich gewünscht oder gehören zum abgeschlossenen STEP.

---

## 8. Bedeutung von `go`

Wenn Forrest `go` schreibt:

```text
Mach exakt mit dem zuletzt gemeinsam bestätigten Schritt weiter.
```

Das bedeutet:

```text
Keine neue Richtung.
Keine neue Interpretation.
Keine Zusatzideen.
Keine ungeplanten Designänderungen.
Keine ungeplanten Backendänderungen.
Keine Workarounds.
Keine zusätzlichen Modul-Umbauten.
```

Wenn die zuletzt bestätigte Richtung unklar ist:
kurz sagen, was unklar ist, und den konkret angenommenen Schritt nennen.

---

## 9. Datei-Regeln

Diese Regeln sind verbindlich:

```text
Keine Patches.
Keine Git-Patches.
Keine PowerShell-Textpatches.
Keine Set-Content-/Regex-/Inline-Patch-Scripte.
Keine Workarounds mit Teil-Dateien.
Keine halben Ersatzlösungen.
```

Wenn eine Datei geändert werden soll:

```text
1. Datei vollständig aus GitHub/dev lesen.
2. Wenn das nicht vollständig und zuverlässig geht:
   sofort sagen, welche konkrete Datei benötigt wird.
3. Nur vollständige echte Datei als Basis verwenden.
4. Vollständige geänderte Ersatzdatei liefern.
5. ZIP mit echtem Zielpfad ab Repo-Root bauen.
```

Wenn Live oder lokaler ZIP-Test aktueller sein könnte als GitHub/dev:
gezielt nach der echten lokalen Datei fragen.

---

## 10. ZIP-Regeln

ZIPs müssen direkt nach folgendem Pfad entpackbar sein:

```text
D:\Git\stream-control-center
```

ZIPs enthalten echte Zielpfade ab Repo-Root, z. B.:

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

```text
lose Dateien
verkürzte Teilpfade
Copy-Item-Platzhalter
ZIPs, die erst manuell sortiert werden müssen
```

---

## 11. Standardabschluss nach ZIP

Nach einem ZIP immer kurz und kopierfreundlich liefern:

```bat
cd D:\Git\stream-control-center
```

Dann nur für tatsächlich geänderte JS-Dateien:

```bat
node --check backend\modules\DATEI.js
node --check htdocs\dashboard\modules\DATEI.js
```

Wenn keine JS-Dateien geändert wurden:

```text
Keine JS-Dateien geändert, daher kein node --check nötig.
```

Danach:

```bat
.\stepdone.cmd "passende Beschreibung"
```

Keine langen manuellen Git-/Deploy-Ketten ausgeben, außer `stepdone.cmd` funktioniert nicht.

Wenn `stepdone.cmd` fehlschlägt:
Fehlerausgabe prüfen, gezielt reparieren, nicht blind neue Umwege bauen.

---

## 12. Shell-/PowerShell-Ausgaben kurz halten

Forrest möchte nicht unnötig viel kopieren müssen.

Regeln:

```text
Nur notwendige Befehle ausgeben.
Statusprüfungen mit gezielter Feldauswahl bevorzugen.
Große ConvertTo-Json -Depth 10 Dumps nur anfordern, wenn wirklich nötig.
Keine langen Diagnoseblöcke, wenn wenige Felder reichen.
```

Bevorzugt:

```powershell
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/example/status"
$s | Select-Object ok,module,moduleVersion,enabled,lastError
```

Nur bei Detailanalyse:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/example/status" | ConvertTo-Json -Depth 10
```

URLs in PowerShell nicht nackt eintippen.

Richtig:

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/..." 
```

oder im Browser öffnen.

---

## 13. Nach jeder Code- oder Strukturänderung

Immer liefern:

```text
1. Syntaxprüfung
2. relevante API-/Live-Tests
3. ZIP mit echten Zielpfaden
4. STEP-Doku unter project-state/
5. Aktualisierung von docs/current/CURRENT_SYSTEM_STATUS.md, wenn zentraler Stand betroffen ist
6. Aktualisierung von project-state/CURRENT_STATUS.md
7. Aktualisierung von project-state/CHANGELOG.md
8. Aktualisierung von project-state/FILES.md
9. Aktualisierung von project-state/NEXT_STEPS.md
10. passende docs/modules/*-Doku aktualisieren, wenn ein Modul betroffen ist
11. EventBus-/Status-/Versionsdoku aktualisieren, wenn betroffen
12. kurze Abschlussübersicht
```

Abschlussübersicht:

```text
Was geändert wurde
Was getestet werden soll
Welche Dateien betroffen sind
Was offen bleibt
Nächster sinnvoller Schritt
```

---

## 14. Dashboard-Regeln

Dashboard greift immer über Backend-APIs zu.

Dashboard greift nicht direkt auf SQLite oder Dateien zu.

Vor Dashboard-Arbeiten prüfen:

```text
Gibt es bereits ein Dashboard-Modul?
Gibt es Backend-Routen?
Gibt es Settings-/Config-/Textmuster?
Gibt es vorhandene CSS-/JS-Modulstruktur?
Gibt es vorhandene Rechte-/Security-Muster?
Gibt es schon Tabs oder Unterbereiche im Modul?
```

Dashboard-UX:

```text
praktisch
schlank
verständlich
nicht zu technisch
nicht alles auf eine Seite packen
```

Große Dashboard-Module müssen Tabs oder Unterbereiche bekommen, z. B.:

```text
Übersicht
Queues
Statistik
Timeline
Settings
Test
```

Keine unnötigen Techniktexte, Boxen oder Hinweise.

Wenn Screenshots oder UX-Feedback gegeben werden:
erst bewerten, ob die Änderung wirklich besser wird, nicht einfach neue UI-Elemente hinzufügen.

---

## 15. EventBus / Communication Bus

Der EventBus ist ein wichtiger zentraler Projektbestandteil.

Wichtige Datei:

```text
backend/modules/communication_bus.js
```

Der EventBus ist die zentrale Event-, Status-, Diagnose- und ACK-Schicht für neue Modul-Anbindungen.

Neue EventBus-Anbindungen müssen:

```text
klein und nachvollziehbar sein
rückwärtskompatibel sein
bestehende produktive Flows zunächst nur ergänzen
sauber testbar sein
keine bestehenden Systeme ungeprüft ersetzen
```

Der EventBus darf bestehende produktive Abläufe nicht ersetzen, solange das nicht ausdrücklich geplant, umgesetzt und getestet ist.

Gute EventBus-Schritte:

```text
1. Status-/Diagnose-Events ergänzen
2. Smoke-Test-Route ergänzen
3. Status-/Reset-Routen ergänzen
4. Live-Test mit echtem Flow
5. Erst danach über produktive Bus-Ausgabe oder Bus-First nachdenken
```

EventBus-Events sollten sprechende Channels und Actions haben, z. B.:

```text
module.event
module.status
module.started
module.finished
module.failed
module.queue.updated
```

Keine EventBus-Namen erfinden, ohne vorhandene Muster im Repo zu prüfen.


### 15.1 EventBus-Zielbild ab STEP480

Der Communication Bus / EventBus soll perspektivisch als zentrale Kommunikations- und Überwachungsschicht für Module dienen.

Zielbild:

```text
Module melden sich beim Start am Bus an.
Module melden sich beim Stop/Shutdown wieder ab, soweit technisch möglich.
Module geben regelmäßige oder ereignisbezogene Statusberichte ab.
Module können Health-/Heartbeat-/Diagnose-Informationen bereitstellen.
Der Bus sammelt Status, Fehler, Warnungen, Queue-Zustände und wichtige Laufzeitereignisse.
Dashboards und Diagnose-Tools können daraus Modulzustände anzeigen.
```

Typische Bus-Informationen:

```text
module.name
module.version
module.enabled
module.startedAt
module.lastHeartbeatAt
module.lastStatusAt
module.health
module.queueState
module.lastError
module.lastWarning
module.dependencies
```

Wichtige Regel:

```text
EventBus-Anbindung ist ein schrittweiser Ausbau.
Bestehende produktive Flows dürfen nicht ungeprüft auf Bus-First umgestellt werden.
Zuerst ergänzen, beobachten, testen, dokumentieren; erst danach produktive Steuerung umstellen.
```

Bei jeder neuen oder erweiterten EventBus-Anbindung muss dokumentiert werden:

```text
Channel / Action
Payload-Felder
Auslöser
Empfänger / Verbraucher
Fehlerverhalten
Tests
```

Diese Angaben gehören in die jeweilige `docs/modules/*`-Doku.

---
### 15.2 Server-Log und Modul-Ladeprotokoll

Der Node-Server-Start soll perspektivisch ein aufschlussreiches, kompaktes Ladeprotokoll ausgeben.

Zielbild beim Serverstart:

```text
[module] loading: <datei>
[module] loaded: <moduleName> v<moduleVersion> routePrefix=<prefix> status=<ok>
[module] skipped: <datei> reason=<reason>
[module] failed: <datei> error=<message>
[server] modules loaded: <count> ok, <count> skipped, <count> failed
```

Wenn ein Modul bereits `version`, `moduleVersion`, `MODULE_VERSION`, `VERSION`, `meta`, `MODULE_META` oder eine Statusfunktion bereitstellt, soll der Loader diese Information nutzen.

Neue oder überarbeitete Module sollen künftig eine maschinenlesbare Modul-Meta-Information bereitstellen, z. B.:

```js
module.exports.meta = {
  name: "example",
  version: "1.2.0",
  routePrefix: "/api/example",
  description: "Kurzbeschreibung"
};
```

Oder gleichwertig über vorhandene Projektmuster, falls das Repo bereits ein anderes Meta-Schema nutzt. Vor Einführung eines Standards muss `backend/server.js`, `communication_bus.js` und vorhandene Modul-Exports geprüft werden.

Das Server-Log soll helfen bei:

```text
Welche Module wurden geladen?
Welche Version wurde geladen?
Welche Module wurden übersprungen?
Welche Module sind fehlgeschlagen?
Welche Route/Prefix gehört grob zu welchem Modul?
Welche Module melden sich am EventBus/Monitoring an?
```

Wichtig:

```text
Keine Secrets loggen.
Keine langen Config-Dumps loggen.
Keine Runtime-Datenbanken oder Tokens im Log ausgeben.
Log-Ausgaben knapp, lesbar und diagnostisch nützlich halten.
Bestehendes Ladeverhalten nicht brechen.
```

Der EventBus soll diese Lade-/Statusinformationen später zusätzlich als zentrale Monitoring-Daten erhalten.

---


## 16. Sound-System-Regeln

Das Sound-System ist die zentrale Audio-/Medien-Schicht im Projekt.

Es kann von mehreren Systemen genutzt werden:

```text
Alerts
TTS
Kanalpunkte/SoundAlerts
VIP-/Mod-Sounds
Challenges
Discord
sonstige Stream-Sounds
```

Das Sound-System darf nicht nebenbei umgebaut werden.

Wenn ein Modul bereits produktiv über das Sound-System läuft, darf dieser Flow nicht durch EventBus, Overlay oder Dashboard ersetzt werden, außer es ist ausdrücklich Ziel des STEPs.

Bei Arbeiten rund um Sounds immer prüfen:

```text
Wer startet den Sound?
Wer verwaltet Queue/Priorität?
Wer sendet Status?
Wer zeigt Overlay/Visuals?
Wer schreibt Logs/Datenbank?
Welche Systeme hängen daran?
```

Nicht ungeprüft ändern:

```text
Queue-Prioritäten
Bundle-/Lock-Logik
TTS-Kopplung
SoundAlerts
Modul-Sounds
Overlay-Visuals
Discord-Ausgabe
Lautstärke-/Output-Ziele
```

---

## 17. Stream-Status / Live-Status

Zentraler Stream-Live-Status:

```text
backend/modules/stream_status.js
```

Aktueller bekannter Stand:

```text
stream_status moduleVersion: 0.1.2
```

Wichtige Routen:

```text
GET      /api/stream-status/status
GET      /api/stream-status/current
GET/POST /api/stream-status/refresh
GET      /api/stream-status/sessions
```

Aufgabe des zentralen Stream-Status:

```text
Ist der Stream live?
Ist der Status bekannt und frisch?
Welche Quelle wurde genutzt?
Welche Streamsession gilt?
Welcher Streamtag gilt?
Gehört ein kurzer Neustart noch zum selben Streamtag?
```

Wichtige Statusfelder:

```text
live
statusKnown
stale
source
upstreamSource
lastCheckedAt
lastLiveAt
streamSessionId
streamDayId
sessionStatus
restartGraceUntil
autoRefreshEnabled
autoRefreshNextRunAt
```

Regel:
Module sollen perspektivisch den zentralen Stream-Status nutzen, statt eigene alte Dateien wie `twitch_stream_raw.json` blind zu lesen.

Twitch kann verzögert melden, dass ein Stream live ist. Deshalb ist `stream_status` für Session-/Streamtag-Logik zuständig, kann Twitch-Verzögerung aber nicht vollständig verhindern.

---

## 18. Clip-Shoutout / VSO

Wichtige Datei:

```text
backend/modules/clip_shoutout.js
```

Aktueller bekannter Stand:

```text
clip_shoutout moduleVersion: 0.2.10
```

Testcommand:

```text
!vso
```

Produktiv-Umstellung auf `!so` nur ausdrücklich und später.

Wichtige Routen:

```text
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/stats/user
POST /api/clip-shoutout/run
```

Aktuelle Funktionen:

```text
Display-Queue
2-Minuten-Abstand zwischen Anzeigen
Display-Cooldown startet nach Anzeige-Ende
Official Twitch-Shoutout nach Display
Official Live-Gate über stream_status
Twitch-Cooldowns beachten
Streamtag-Limit: Ziel standardmäßig 1x pro Streamtag
Override per --force
Timeline für Request/Display/Official
Statistik: Zielkanäle, Auslöser, Wer -> Wen, Dropdowns
```

Aktueller Dashboard-Stand:

```text
Shoutout-Dashboard-Modul vorhanden.
Statistiken vorhanden.
UX muss als nächstes in Tabs/Unterbereiche aufgeteilt werden, weil aktuell zu viel auf einer Seite steht.
```

Geplanter Ausbau:

```text
Eingehende Shoutouts loggen.
Im Dashboard anzeigen, wer Forrest woanders geshoutoutet hat.
Statistik für eingehende Shoutouts ergänzen.
```

Eingehende Shoutouts sollen sauber getrennt werden:

```text
Ausgehend:
wer hat wen bei uns geshoutoutet

Eingehend:
wer hat ForrestCGN geshoutoutet
wann
Viewerzahl
Streamtag
ggf. spätere Reaktion/Re-Shoutout
```

---

## 19. Weitere wichtige bestehende Systeme

Bestehende Systeme dürfen durch neue Änderungen nicht beschädigt werden:

```text
Alerts
Communication Bus
Sound-System
TTS
Modul-Sounds
SoundAlerts
Message-Rotator
Tagebuch
Todo
Hug/Rehug
OBS
Discord
Twitch
Loyalty
Deathcounter
Challenges
Clips
Clip-Shoutout / VSO
Dashboard
Stream-Status
VIP-System
Media-System
Admin Configs
Bus-Diagnose
```

Vor Änderungen an einem System prüfen, welche anderen Systeme davon abhängig sind.

---

## 20. Wichtige bekannte API-/Dashboard-Routen

Nur als Orientierung. Vor Änderungen echte Dateien prüfen.

System / Status:

```text
GET /api/_status
```

Stream-Status:

```text
GET      /api/stream-status/status
GET      /api/stream-status/current
GET/POST /api/stream-status/refresh
GET      /api/stream-status/sessions
```

Clip-Shoutout:

```text
GET  /api/clip-shoutout/queue
GET  /api/clip-shoutout/timeline
GET  /api/clip-shoutout/stats
GET  /api/clip-shoutout/stats/user
POST /api/clip-shoutout/run
```

Dashboard:

```text
/dashboard/
```

Sound-System:

```text
GET /api/sound/status
```

Alerts:

```text
GET /api/alerts/status
```

Bus-Diagnose:

```text
/public/tools/bus_diagnostics_dashboard.html
```

Wichtig:
Routen nicht blind erweitern oder umbenennen. Vor Nutzung im jeweiligen Modul prüfen.

---

## 21. Config-/Text-/Message-Regeln

Alles, was sinnvoll konfigurierbar ist, soll langfristig in Config, DB oder Dashboard editierbar sein.

Ausgaben/Chattexte/Discordtexte/Overlaytexte sollen langfristig variantenfähig sein:

```text
mehrere Varianten pro Text-Key
aktiv/inaktiv
kategorisiert
dashboardfähig
zufällige Auswahl aktiver Varianten
```

Vor neuen Textsystemen prüfen:

```text
helper_messages.js
helper_texts.js
config/messages/
module_texts Tabellen/Muster
bestehende Dashboard-Texteditoren
```

Keine neuen parallelen Textordner erfinden, wenn vorhandene Muster passen.

---

## 22. Versionsregel

In Dateien und Modulen sollen Versionsnummern verwendet werden, nicht STEP-Nummern als dauerhafte technische Kennzeichnung.

Gut:

```text
version: "1.2.0"
moduleVersion: "1.2.0"
docs: "Version 1.2.0"
```

Nicht als dauerhafte Runtime-Kennung verwenden:

```text
step: 407
STEP407
feature_step
```

STEPs dürfen für Übergaben, Doku, ZIP-Namen und Projektverlauf genutzt werden.

Wenn vorhandene ältere Dateien noch STEP-Felder enthalten:
nicht ungeprüft alles umbauen.
Bei neuen Änderungen bevorzugt Version erhöhen und STEP nur in project-state-Doku erwähnen.


### 22.1 Versionsnummern als Standard

Ab STEP480 gilt für neue oder angefasste Module:

```text
Technische Modulstände sollen über version oder moduleVersion gepflegt werden.
STEP-Nummern dienen nur für ZIPs, Doku, Übergaben und Projektverlauf.
STEP-Nummern sind keine dauerhafte Runtime-Version.
```

Bei jeder Moduländerung prüfen:

```text
1. Hat das Modul bereits eine version/moduleVersion?
2. Muss die Versionsnummer erhöht werden?
3. Wird die neue Version im Status-Endpunkt ausgegeben?
4. Ist die neue Version in der Modul-Doku dokumentiert?
5. Ist CHANGELOG.md aktualisiert?
```

Bevorzugtes Muster:

```text
const MODULE_VERSION = "x.y.z";
```

oder vorhandenes Modul-Muster weiterverwenden, wenn das Repo dafür bereits einen Standard vorgibt.

Nicht erlaubt:

```text
Neue dauerhafte Runtime-Felder wie STEP480, feature_step oder step als Versionsersatz einführen.
```

---

## 23. Sicherheitsregeln

Verbindlich:

```text
Keine Funktionalität entfernen.
Keine Secrets anzeigen.
Keine Secrets committen.
Keine .env committen.
Keine Tokens committen.
Keine Datenbanken committen.
Keine Backups committen.
Keine temporären Dateien committen.
Keine ZIPs/7z ins Repo committen.
```

GitHub/dev und Live-System dürfen nicht unbewusst auseinanderlaufen.

Wenn Live aktueller sein könnte als GitHub/dev:
nach echten Live-Dateien oder PowerShell-Ausgaben fragen.

---

## 24. Vor Beginn eines neuen Moduls oder Fixes prüfen

Vor dem Bauen immer klären:

```text
1. Gibt es schon ein ähnliches Modul?
2. Gibt es vorhandene Helper?
3. Gibt es bestehende Configs?
4. Gibt es bestehende Settings-/DB-Muster?
5. Gibt es Textvarianten oder Message-Helper?
6. Gibt es eine Dashboard-Struktur?
7. Gibt es bereits Routen?
8. Welche Datei ist wirklich betroffen?
9. Muss eine API erweitert werden?
10. Muss Doku aktualisiert werden?
11. Welche minimalen Tests sind nötig?
```

Danach erst kleinen STEP vorschlagen oder umsetzen, abhängig vom Auftrag.

---

## 25. Aktueller Arbeitsmodus

Immer kleine, nachvollziehbare Schritte.

Kein großer Umbau ohne Planung.

Keine bestehende Funktion entfernen.

Bestehende produktive Flows erst beobachten, dann erweitern, dann testen, dann dokumentieren.

Wenn etwas unklar ist:

```text
Nicht raten.
Nicht einfach bauen.
Kurz sagen, was fehlt.
Konkrete Datei oder konkrete Info anfordern.
```

---

## 26. Aktueller bekannter Kontext nach STEP480/479

Zuletzt relevant:

```text
STEP474: Doku-/TODO-/Modul-Cleanup begonnen und zentrale Übersichten ergänzt.
STEP475: docs/modules/ vorbereitet und project-state-Aufräumung vorbereitet.
STEP476: Core-/Helper-Deep-Dive-Dokus ergänzt.
STEP477: Stream-/Media-Modul-Dokus ergänzt.
STEP478: Integrations- und Community-Modul-Dokus ergänzt.
STEP479: Secondary-/Status-/Bridge-Modul-Dokus ergänzt.
STEP480: Standard-Prompt und Arbeitsregeln auf Modul-Doku-Pflege, Versionsnummern und EventBus-/Monitoring-Zielbild aktualisiert.
STEP481: Server-Log-/Modul-Ladeprotokoll-Regel ergänzt: Module sollen beim Laden Name, Version, Prefix und Status ausgeben bzw. maschinenlesbare Meta-Daten bereitstellen.
```

Aktueller Doku-Stand:

```text
docs/modules/ enthält Modul-Dokus für Core, Helper, Stream-/Media-Module, Integrationen, Community-Module und sekundäre Module.
docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26.md beschreibt den aktuellen Doku-Abdeckungsstand.
project-state/TODO.md und project-state/NEXT_STEPS.md bleiben die zentralen offenen Punkte.
```

Wichtig für neue Chats:

```text
Vor Änderungen an einem Modul immer zuerst die passende docs/modules/*-Doku lesen.
Wenn ein Modul geändert, erweitert oder umgebaut wird, muss die jeweilige Modul-Doku im selben STEP aktualisiert werden.
Wenn Routen, Configs, DB-Tabellen, EventBus-Events, Statusfelder, Dashboard-Dateien oder Overlays hinzukommen, müssen diese in der Modul-Doku ergänzt werden.
```

Aktuelles Zielbild:

```text
Module sollen schrittweise auf klare Versionsnummern umgestellt werden.
Module sollen perspektivisch den Communication Bus / EventBus für Anmeldung, Abmeldung, Statusberichte, Diagnose, Heartbeats und Modul-Überwachung nutzen.
Der Node-Server-Start soll zusätzlich ein kompaktes Modul-Ladeprotokoll mit Modulname, Version, Prefix, geladen/übersprungen/fehlgeschlagen und Zusammenfassung ausgeben.
Der Bus soll als zentrale Kommunikations- und Monitoring-Schicht dienen, ohne bestehende produktive Flows ungeprüft zu ersetzen.
```

Nächster fachlicher STEP nach der Doku-/Cleanup-Runde:

```text
STEP481_SHOUTOUT_DASHBOARD_TABS
```

Ziel:
Shoutout-Dashboard in Tabs/Unterbereiche aufteilen:

```text
Übersicht
Queues
Statistik
Timeline
Settings/Test
```

Danach möglich:

```text
STEP482_SHOUTOUT_INBOUND_EVENTSUB_LOGGING
```

Ziel:
Eingehende Twitch-Shoutouts loggen und im Dashboard/statistisch anzeigen.


---

## Aktueller Kanalpunkte-Stand nach STEP516 (2026-05-26)

Wenn im neuen Chat am Kanalpunkte-System weitergearbeitet wird, gilt zusätzlich:

```text
Backend: backend/modules/channelpoints.js 0.9.4 · redemption-completion-policy
Dashboard: htdocs/dashboard/modules/channelpoints.js UI v1.0.3 · color-picker-presets-ui
Bridge: backend/modules/channelpoints_eventsub_bus_bridge.js
```

Stabil getesteter Referenz-Reward:

```text
Gewürzgurke
reward_key: gewurzgurke
Twitch reward_id: 0e129f37-20bf-456e-ab87-06fa0d6e08fd
media_asset_id: 1393
```

Produktive Redemption-Kette:

```text
Twitch EventSub
→ twitch.js
→ channelpoints_eventsub_bus_bridge.js
→ EventBus channelpoints.redemption / received
→ channelpoints.js
→ Sound-System
```

Kanalpunkte-Regel:

```text
Reward inaktiv → nicht ausführen
Reward aktiv + Aktion vollständig → ausführen
Reward ohne Aktion → nicht aktivierbar / nicht ausführbar
```

Nicht wieder einführen:

```text
Shadow-Modus als Bedienlogik
Live-Modus als Bedienlogik
Allowlist/Freigabe-Modus als Bedienlogik
AutoExecute-Schalter als Dashboard-Konzept
```

Wichtige offene Prüfung:

```text
Completion Policy live gegen Twitch prüfen:
Nach erfolgreicher Ausführung FULFILLED setzen.
Bei Fehler optional CANCELED setzen und Punkte zurückgeben.
```
