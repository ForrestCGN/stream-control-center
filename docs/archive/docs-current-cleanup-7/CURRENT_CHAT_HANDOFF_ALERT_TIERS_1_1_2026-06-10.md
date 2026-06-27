# CURRENT CHAT HANDOFF – ALERT-TIERS.1.1

Stand: 2026-06-10

## Ziel

Hotfix für den Alert-Dashboard-Regeltest nach Einführung der Twitch-Tier-Auswahl.

## Problem

Sub-Regeln für Tier 2 und Tier 3 waren korrekt mit unterschiedlichen Media-Registry-Sounds konfiguriert. Der Regel-Testbutton konnte trotzdem den Standard-Sub-Sound auslösen, weil der Testpayload keinen Twitch-Tier-Wert enthielt.

Backend-Matching prüft `meta.match.tierLabel`. Ohne passenden `tier` im Payload fällt das Matching auf eine andere passende Sub-Regel zurück.

## Änderung

Datei:

```text
htdocs/dashboard/modules/alerts.js
```

Änderungen:

- `testRule(id)` ruft jetzt `applyRuleTierToTestPayload(rule, payload)` auf.
- Tier-Mapping für Testpayloads:
  - `tier1` -> `1000`
  - `tier2` -> `2000`
  - `tier3` -> `3000`
  - `prime` -> `Prime`
- Media-Registry-Sounds in der Regelzeile bekommen einen direkten Sound-Playbutton und zeigen die Media-URL.

## Nicht geändert

- Kein Backend-Umbau.
- Keine DB-Migration.
- Keine neuen Standardregeln.
- Keine Änderung an EventBus/Communication Bus.
- Keine Änderung an Sound-System/Overlay/Queue.

## Test

```powershell
node -c .\htdocs\dashboard\modules\alerts.js
```

Danach im Dashboard eine Tier2- oder Tier3-Sub-Regel per Regel-Testbutton starten.

Erwartung:

```text
matchedRule = angeklickte Regel-ID
```

## StepDone

```powershell
.\stepdone.cmd "STEP ALERT-TIERS.1.1 – Alert-Regeltest nutzt Twitch-Tier-Payload"
```
