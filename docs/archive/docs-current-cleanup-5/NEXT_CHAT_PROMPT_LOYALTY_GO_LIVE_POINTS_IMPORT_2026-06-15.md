# NEXT CHAT PROMPT – Loyalty Go-Live + Punkteimport

Du arbeitest mit ForrestCGN am Projekt `stream-control-center`.

Bitte zuerst lesen:

```text
MASTER_PROMPT_stream_control_center_CLEAN_2026-06-15.txt
docs/current/CURRENT_CHAT_HANDOFF_LC_DASHBOARD_TEXTS_4_GO_LIVE_POINTS_IMPORT_2026-06-15.md
project-state/CURRENT_STATUS.md
project-state/NEXT_STEPS.md
project-state/TODO.md
project-state/CHANGELOG.md
project-state/FILES.md
docs/modules/loyalty.md
```

## Aktueller Stand

Loyalty Core und Dashboard wurden im letzten Chat umfangreich aufgeräumt.

Aktuelle Dashboard-Struktur:

```text
Loyalty
├─ Start
├─ Core
├─ Glücksrad
├─ Presets
├─ Giveaways
├─ Gamble
├─ Einstellungen
├─ Texte
├─ Chat & Befehle
└─ Logs
```

Core-Config ist teilweise wirklich speicherbar:

```text
Grundregeln
Automatische Punkte
Abo-Bonus bei automatischen Punkten
Geschenk-Abo-/GiftBomb-Empfänger-Modus
Raid-Regel
```

Logs sind zentral unter `Loyalty → Logs`.
Texte sind zentral unter `Loyalty → Texte` und nutzen mehrere vorhandene Text-APIs.

## Wichtige Regeln

```text
Nicht raten.
Erst echte Dateien prüfen.
Keine Apply-/Patch-Scripte.
Keine DB überschreiben.
Keine Punkte blind importieren.
Keine Alert-Produktivumschaltung.
Keine Funktionalität entfernen.
```

## Ziel des neuen Chats

Forrest möchte das System für den Stream scharf schalten und Punkte importieren.

Arbeite Schritt für Schritt:

```text
1. Go-Live Check read-only.
2. Testwerte prüfen/zurücksetzen.
3. Settings/Runner/EventSub prüfen.
4. Punkteimport-Quelle prüfen.
5. Importplan erstellen.
6. Dry-Run bauen/ausführen.
7. Nach Freigabe echter Import.
```

## Go-Live Checks

Nutze gezielte Ausgaben:

```powershell
node -c .\backend\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty.js
node -c .\htdocs\dashboard\modules\loyalty_games.js
```

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/status"
$loy | Select-Object ok,module,version,lastError
$loy.twitchEventBonusBinding | Select-Object installed,subscriptionCount,received,processed,skipped,duplicates,errors,lastEventKey,lastLogin,lastError
```

```powershell
$cfg = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings"
$cfg.config.watch
$cfg.config.autoRunner
$cfg.config.bonuses.raid
$cfg.config.bonuses.giftSubReceiver
```

```powershell
$t = Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/eventsub/status"
$t.twitchEventsParallel.supportEvents | Select-Object enabled,forwarded,failed,lastEventSubType,lastUserLogin,lastError
$t.legacyLoyaltyDirectForward | Select-Object enabled,forwarded,skipped,failed,lastEventSubType,lastUserLogin,lastError
```

Alert Shadow nur prüfen:

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a | Select-Object installed,effectiveMode,received,mapped,wouldEnqueue,enqueued,skipped,errors,lastEventKey,lastLogin,lastTypeKey,lastError
```

Erwartung:

```text
Alert effectiveMode = shadow
enqueued = 0
```

## Punkteimport

Vor Import unbedingt klären:

```text
Welche Datei/Quelle?
Welche Felder?
Twitch Login oder User-ID?
Sollen Punkte addiert oder ersetzt werden?
Soll pro User eine Import-Transaktion entstehen?
```

Empfehlung:

```text
Additiver Import über Transaktionen.
Importgrund/referenceType z. B. legacy_points_import.
Dry-Run zuerst.
Backup/Snapshot vor Echtdurchlauf.
Keine direkte DB-Überschreibung.
```

Wenn eine Datei hochgeladen wird:

```text
Erst Inhalt prüfen.
Mapping vorschlagen.
Dry-Run-Zusammenfassung liefern.
Auf go warten.
```

## Antwortformat vor Umsetzung

Immer kurz:

```text
Ziel:
Dateien:
Änderung:
Nicht geändert:
Tests:
Warte auf go.
```
