# NEXT CHAT HANDOFF – STEP205 Alert-Regel-Editor Min/Max-Hinweise

Stand: 2026-05-09

## Kontext

Nach STEP203/204/204.1 wurden Alert-Duplikate, Twitch Sub/Gift-Mapping und Sub/Gift-Regeln korrigiert. Danach wurde im Dashboard festgestellt, dass der Regel-Editor bei Min/Max keine verständliche typabhängige Erklärung bietet.

## Geändert

- `htdocs/dashboard/modules/alerts.js`

Der Regel-Editor zeigt jetzt abhängig von Quelle/Typ passende Labels und Hinweise:

- Bits → Min/Max-Bits
- Raid → Min/Max-Zuschauer
- Gift/Sub-Bombe → Anzahl verschenkter Subs
- Donation → Betrag
- Resub → Monate

Beim Wechsel der Quelle oder des Typs aktualisiert sich der Hinweis sofort.

## Test

- `node -c htdocs/dashboard/modules/alerts.js`
- Manuell im Dashboard: Neue Regel öffnen und Typ wechseln.

## Nächste mögliche Punkte

- TTS-Problem bei Ko-fi/Tipeee analysieren.
- HypeTrain-Regeln modellieren.
- Spätere fachliche Felder im Regel-Editor: Tier, Monate, HypeTrain-Level, TTS-Textquelle.
