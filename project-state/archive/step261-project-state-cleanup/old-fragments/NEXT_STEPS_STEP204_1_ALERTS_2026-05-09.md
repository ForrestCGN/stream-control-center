# NEXT STEPS – STEP204.1 Alerts

Stand: 2026-05-09

## Erledigt

- Twitch Sub/Gift/Resub Grundlogik getestet.
- Falsche `sub`-Regel für Sub-Bombe bereinigt.
- GiftSub-/SubBomb-Staffeln ergänzt.
- `gifted_sub_received` bewusst ohne aktive Regel gelassen, damit kein Doppel-Alert entsteht.

## Nächster sinnvoller Schritt

### Option A – TTS pro Text-Event

Für Events mit Text soll pro Regel einstellbar werden, ob Text per TTS ausgegeben wird:

```text
channel.cheer -> message
channel.subscription.message -> message.text
Ko-fi/Tipeee Donation -> message
channelpoints -> user_input
```

Benötigt:

- Prüfen, wie `alert_rules` TTS-Felder aktuell nutzt.
- Prüfen, wie `tts_system.js` an Alerts angebunden ist.
- Zielmodell für `meta_json.tts` definieren.
- Dashboard-Optionen planen.

### Option B – HypeTrain Alerts

HypeTrain fachlich aufbauen:

```text
hypeTrainBegin
hypeTrainProgress
hypeTrainEnd
```

Benötigt:

- Twitch-Mapping prüfen.
- Regeln für Level/Stufen.
- Schutz gegen Spam bei Progress-Events.

### Option C – Dashboard-Regel-Editor verbessern

Spezialbedingungen sichtbar/editierbar machen:

```text
meta_json.match.tier
meta_json.match.minTotal/maxTotal
meta_json.match.minMonths/maxMonths
meta_json.match.hypeTrainLevel
meta_json.tts.*
```

## Wichtig

- Keine DB-Dateien committen.
- Keine direkten DB-Patches per PowerShell.
- Live-Regeln nur per Backend-API/Dashboard ändern.
- Nach Live-Regeländerungen immer eine Doku mit Regelstand erstellen.
