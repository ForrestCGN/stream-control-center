# CURRENT CHAT HANDOFF – ALERT-TIERS.1

Stand: 2026-06-09

## STEP

```text
STEP ALERT-TIERS.1 – Alert-Regel-Editor unterstützt Twitch Sub-Tier-Filter
```

## Ziel

Alert-Regeln für Twitch-Subs, Resubs, GiftSubs und Sub-Bomben können im Dashboard gezielt nach Sub-Tier gefiltert werden.

## Umgesetzt

- Im Alert-Regel-Editor gibt es nun eine Auswahl `Twitch-Tier`.
- Optionen:
  - Alle / kein Tier-Filter
  - Prime
  - Tier 1
  - Tier 2
  - Tier 3
- Die Auswahl wird nur für Twitch-Sub-Typen angezeigt:
  - `sub`
  - `resub`
  - `gift_sub`
  - `gifted_sub_received`
  - `gift_bomb`
- Beim Speichern wird der Filter in `meta.match.tierLabel` geschrieben.
- Bei `Alle / kein Tier-Filter` wird der Tier-Filter aus `meta.match` entfernt.
- In der Regelübersicht wird bei Sub-Regeln ein kleines Tier-Badge angezeigt.

## Wichtig

Es werden absichtlich keine Tier2-/Tier3-Standardregeln automatisch angelegt.

Bestehende Regeln bleiben unverändert und laufen weiter wie bisher. Tier2- und Tier3-Regeln werden später manuell im Dashboard angelegt bzw. kopiert und angepasst.

## Geänderte Dateien

```text
htdocs/dashboard/modules/alerts.js
htdocs/dashboard/modules/alerts.css
```

## Nicht geändert

```text
backend/modules/alert_system.js
Produktive SQLite-Datenbank
Alert-Queue
Sound-System
Overlay-Ausgabe
Streamer.bot-Logik
Seeds / Migrationslogik für neue Alert-Regeln
```

## Technische Grundlage

Das Backend konnte Tier-Matching bereits über `meta.match.tierLabel` / `meta.match.tier` auswerten. Dieser STEP ergänzt die fehlende Dashboard-Bedienung dafür.

## Tests

```powershell
node -c .\htdocs\dashboard\modules\alerts.js
```

Optional nach Einspielen:

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/rules"
$r.rules | Where-Object { $_.type_key -in @("sub","resub","gift_sub","gift_bomb","gifted_sub_received") } |
  Select-Object id,type_key,label,tier,priority,enabled,meta |
  Format-Table -AutoSize
```

Manueller Funktionstest:

1. Dashboard öffnen.
2. Alert-Regeln öffnen.
3. Eine Sub-/Resub-/Gift-Regel bearbeiten oder neue Regel anlegen.
4. `Twitch-Tier` auf Tier 2 oder Tier 3 setzen.
5. Speichern.
6. Regel erneut öffnen und prüfen, ob die Auswahl erhalten bleibt.

## Nächster sinnvoller Schritt

Nach Einspielen kann Forrest manuell Tier2-/Tier3-Regeln im Dashboard anlegen oder bestehende Tier1-Regeln kopieren/anpassen. Danach sollten echte Test-Payloads für `tier=2000` und `tier=3000` geprüft werden.
