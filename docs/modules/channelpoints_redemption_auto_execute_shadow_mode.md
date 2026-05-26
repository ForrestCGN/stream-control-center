# Channelpoints Redemption Auto Execute Shadow Mode

Stand: STEP500 / Backend `channelpoints` v0.8.4 / Build `redemption-auto-execute-shadow-mode`

## Ziel

Dieser Schritt ergänzt die EventSub-Redemption-Vorbereitung um einen sicheren Shadow-Modus.

Eine eingehende Redemption wird weiterhin nur lokal gespeichert. Zusätzlich prüft das Backend, ob die Redemption im späteren Live-Modus ausführbar wäre.

## Sicherheit

- Kein Twitch-Write.
- Keine automatische Ausführung.
- Keine neue Datenbanktabelle.
- Keine DB-Migration.
- Nutzung des bestehenden zentralen `../core/database` Helpers.
- AutoExecute bleibt produktiv aus.

## Konfiguration

Neue/ergänzte Config-Werte im Modul-Fallback:

```js
redemptionEventSubAutoExecuteEnabled: false
redemptionEventSubAutoExecuteMode: "shadow"
redemptionEventSubShadowModeEnabled: true
```

`live` wird in diesem Step nicht automatisch scharf geschaltet. Wenn `live` konfiguriert wäre, aber `redemptionEventSubAutoExecuteEnabled` nicht explizit true ist, fällt das System sicher auf `shadow` zurück.

## Verhalten

Bei Preview und Receive wird `shadowExecution` erzeugt:

- `wouldExecute: true`, wenn der Reward gemappt, lokal aktiv, nicht pausiert und ausführbar ist.
- `blocked: true`, wenn z. B. lokale Zuordnung fehlt, Reward deaktiviert/pausiert ist oder keine ausführbare Aktion existiert.
- `reason` beschreibt den Grund, z. B. `would_execute_in_live_mode`, `reward_disabled_local`, `missing_executable_action`.

## EventBus

Zusätzlich vorbereitetes Domain-Event:

```text
channelpoints.redemption.shadow_checked
```

Das Event meldet die Shadow-Prüfung mit Reward-Key, Mapping und Ergebnis.

## Dashboard

Der Tab „Einlösungen“ zeigt jetzt zusätzlich:

- AutoExecute-Modus
- Shadow-Zähler
- Would-Execute-Zähler
- Blocked-Zähler
- Shadow-Ergebnis bei Preview und Speicherung

## Nächster Schritt

Nach erfolgreichem Test kann ein kontrollierter Live-Modus vorbereitet werden, aber nur mit expliziter Aktivierung und weiteren Sicherheitsregeln.
