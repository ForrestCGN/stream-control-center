# CURRENT CHAT HANDOFF – Loyalty Dashboard / Core Config / Logs / Texte / Go-Live Vorbereitung

Stand: 2026-06-15
Projekt: `stream-control-center`
Branch: `dev`
Kontext: Loyalty Core, zentrale Einstellungen, zentrale Logs, zentrale Texte, Stream-Go-Live und Punkteimport als nächster Fokus

## Kurzstatus

```text
Loyalty Core läuft produktiv über Twitch Events / Communication Bus.
Dashboard-Struktur wurde stark aufgeräumt.
Core-Config ist teilweise wirklich speicherbar.
Logs sind zentral unter Loyalty gebündelt.
Texte sind zentral unter Loyalty gebündelt und nutzen mehrere vorhandene Text-APIs.
Alert-System bleibt weiterhin nur im Shadow-Modus und darf nicht produktiv umgeschaltet werden.
```

## Wichtige Architektur-Entscheidungen

### Loyalty-Navigation

Aktuelle Zielstruktur im Dashboard:

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

Regeln:

```text
Core bleibt Core, nicht „Punkte-Core“.
Logs heißt Logs, nicht „Verlauf & Logs“.
Ein eigener Hilfe-Tab ist derzeit nicht nötig; Hilfe gehört in Tooltips/Infoboxen.
Einstellungen sind zentral.
Texte sind zentral.
Logs sind zentral.
```

### Zentrale Einstellungen

Unter `Loyalty → Einstellungen` gibt es nur noch echte Hauptbereiche:

```text
Core
Glücksrad
Presets
Giveaways
Gamble
Chat & Befehle
```

Core bündelt alle Core-nahen Einstellungen:

```text
Core
├─ Grundregeln
├─ Automatische Punkte
├─ Abo-Bonus bei automatischen Punkten
├─ Geschenk-Abos / GiftBombs
└─ Raids
```

Nicht mehr als eigene Hauptbereiche im Config-Dropdown:

```text
Automatische Punkte
Geschenk-Abos / GiftBombs
Raids
```

### Zentrale Logs

Unter `Loyalty → Logs` werden zentrale Loyalty-Logs gesammelt.
Aktuell angebunden:

```text
Core / Punkte-/Support-Events über /api/loyalty/events/history
Glücksrad / Sessions über vorhandene Loyalty-Games-Routen
Gamble über vorhandene Command-/Audit-/Log-Daten
```

Haupttabelle ist streamer-/modfreundlich. Technische IDs liegen im Detailfenster, nicht in der Haupttabelle.

### Zentrale Texte

Unter `Loyalty → Texte` gibt es eine zentrale Textpflege mit Bereichsfilter:

```text
Alle Textbereiche
Core
Glücksrad
Giveaways
Gamble
Chat & Befehle
Geschenk-Abos / GiftBombs
Hinweise / Fehlertexte
```

Aktueller Stand:

```text
Texte werden über mehrere vorhandene Text-APIs geladen:
/api/loyalty/giveaways/texts
/api/loyalty/games/texts
```

Varianten-Editor:

```text
Varianten anzeigen
Neue Variante hinzufügen
Aktivieren / Deaktivieren, wenn sichere Variant-ID vorhanden
Löschen mit Nachfrage, wenn sichere Variant-ID vorhanden
Keine Fake-IDs verwenden
Keine Varianten blind löschen
```

## Abgeschlossene Schritte in diesem Chat

### Loyalty Core / Twitch Events

```text
LC-CORE-DIAGNOSTICS-1 – Loyalty Status Diagnostics
LC-CORE-DIAGNOSTICS-2 – Loyalty Bonus Mapping Diagnostics
LC-CORE-DIAGNOSTICS-3 – Loyalty Bonus Values Diagnostics
LC-CORE-BALANCE-1 – Raid Bonus Viewer Scaling
LC-CORE-HISTORY-1 – Loyalty Event History Readonly
LC-CORE-GIFTS-CONFIG-1 – Gift Receiver Mode Config
```

Bestätigt:

```text
loyalty.js Version 0.1.23
7/7 Twitch-Event-Bus-Subscriptions aktiv
GiftSub-/GiftBomb-Empfänger default: track_only
Raid-Regel: base_plus_viewers mit Cap
```

### Dashboard Struktur / Config / Logs / Texte

```text
LC-DASHBOARD-INVENTORY-1 – Loyalty Dashboard Inventory
LC-DASHBOARD-STRUCTURE-1 – Streamer/Mod Navigation
LC-DASHBOARD-STRUCTURE-2 – Central Config Texts Logs
LC-DASHBOARD-CONFIG-1 – Central Loyalty Settings
LC-DASHBOARD-CONFIG-2 – Cleanup Config UX Standard
LC-DASHBOARD-CONFIG-3 – Core Grouped Settings
LC-DASHBOARD-CLEANUP-1 – Core Duplicate Cleanup
LC-DASHBOARD-CONFIG-4 – Gift Receiver Setting Write
LC-DASHBOARD-CONFIG-5 – Raid Setting Write
LC-DASHBOARD-CONFIG-6 – Core Auto Points Write
LC-DASHBOARD-CONFIG-6B – Settings Reload Fix
LC-DASHBOARD-CONFIG-7 – Subscriber Auto Points
LC-DASHBOARD-LOGS-1 – Central Loyalty Logs
LC-DASHBOARD-LOGS-2 – Compact Logs Details
LC-DASHBOARD-TEXTS-1 – Central Texts Tab
LC-DASHBOARD-TEXTS-2 – Text Editor Modal
LC-DASHBOARD-TEXTS-3 – Variant Manage
LC-DASHBOARD-TEXTS-4 – Multi Module Text API
```

## Erfolgreich getestete Funktionen

### GiftSub-/GiftBomb-Empfänger-Modus

Getestet über Dashboard und PowerShell:

```text
receiverMode: track_only → small_bonus
receiverAwardsPoints: false → true
```

Route:

```text
POST /api/loyalty/settings
GET  /api/loyalty/status
```

### Raid-Regel

Getestet über Dashboard und PowerShell:

```text
maxAmount: 250 → 249
150 Viewer → 249 Punkte
```

Route:

```text
POST /api/loyalty/settings
GET  /api/loyalty/status
```

Hinweis:

```text
Wenn 249 nur ein Test war, vor Stream-Go-Live wieder auf 250 setzen.
```

### Automatische Punkte

Getestet über Dashboard und PowerShell:

```text
watch.amount: 2 → 3 → 2
```

Settings-Route bestätigt:

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings"
$loy.config.watch.amount
```

### Abo-Bonus bei automatischen Punkten

Getestet über Dashboard und PowerShell:

```text
subscriberMultiplier: 2 → 3
Tier 1: 6 → 7
Tier 2: 8 bleibt
Tier 3: 10 bleibt
```

Settings-Route bestätigt:

```powershell
$loy.config.watch.subscriberMultiplier
$loy.config.watch.subscriberTierAmounts
```

## Aktuelle wichtige Config-Werte

Aus zuletzt bestätigten Tests:

```text
loyalty.config.enabled = true
currency.name = Kekskrümel
features.eventBonusesEnabled = true
watch.enabled = true
watch.amount = 2
watch.intervalMinutes = 10
watch.subscriberMultiplier zuletzt getestet und ggf. zurückstellen prüfen
watch.subscriberTierAmounts: 1000=6/7 je nach letztem Test, 2000=8, 3000=10
```

Vor Go-Live unbedingt im Dashboard oder per Route kontrollieren:

```powershell
$loy = Invoke-RestMethod "http://127.0.0.1:8080/api/loyalty/settings"
$loy.config.watch
$loy.config.autoRunner
$loy.config.bonuses.raid
$loy.config.bonuses.giftSubReceiver
```

## Alert-System Stand

Nicht anfassen für den Stream-Go-Live:

```text
Alerts bleiben produktiv über alten Direktpfad.
Neue Twitch-Events-Alert-Anbindung bleibt Shadow.
Nicht auf Bus-Alerts umschalten.
Alte Alert-Route nicht löschen.
```

Statusprüfung:

```powershell
$a = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/twitch-events/status"
$a | Select-Object installed,effectiveMode,received,mapped,wouldEnqueue,enqueued,skipped,errors,lastEventKey,lastLogin,lastTypeKey,lastError
```

Erwartung:

```text
effectiveMode = shadow
enqueued = 0
errors = 0
```

## Offene Punkte für nächsten Chat

### Stream scharf schalten

Vor dem Stream:

```text
1. Prüfen, ob alle letzten ZIPs eingespielt sind.
2. StepDone für letzten Stand ausführen, falls noch offen.
3. Server neu laden/restarten, falls nötig.
4. Dashboard kurz kontrollieren:
   - Loyalty → Start
   - Loyalty → Core
   - Loyalty → Einstellungen → Core
   - Loyalty → Logs
   - Loyalty → Texte
5. Settings prüfen.
6. EventSub / Twitch Events prüfen.
7. Loyalty Runner / Auto-Punkte prüfen.
8. Alerts bleiben Shadow.
```

### Punkte importieren

Noch nicht umgesetzt. Muss im nächsten Chat geplant werden.

Wichtig:

```text
Keine produktive DB überschreiben.
Keinen Import blind laufen lassen.
Zuerst Quelle/Format prüfen.
Dry-Run bauen.
Backup/Snapshot vor Import.
Dubletten-/User-Mapping prüfen.
Transaktionen/Audit sauber erzeugen.
Import muss nachvollziehbar und rollbackfähig sein.
```

Benötigte Info vom Nutzer:

```text
Welche Quelle enthält die alten Punkte?
CSV / JSON / SQLite / StreamElements / anderer Export?
Welche Spalten/Felder?
Wie sollen User gematcht werden: login, displayName, Twitch user id?
Sollen bestehende Punkte addiert oder ersetzt werden?
Soll pro User eine Import-Transaktion erzeugt werden?
```

Empfehlung:

```text
Import immer additiv als eigene Transaktionsart durchführen:
reason/referenceType z. B. legacy_points_import
Nicht bestehende Scores direkt überschreiben, außer ausdrücklich erlaubt.
```

## Harte Regeln für nächsten Chat

```text
Nicht raten.
Erst echte Dateien prüfen.
Keine Apply-/Patch-Scripte.
Keine PowerShell-Regex-Patches.
Keine DB ersetzen.
Keine alten Punkte überschreiben ohne ausdrückliche Freigabe.
Keine Funktionalität entfernen.
Keine Alert-Produktivumschaltung.
Keine Fake-User-/Fake-Receiver-Erzeugung.
```
