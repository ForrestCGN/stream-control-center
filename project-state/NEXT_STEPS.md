# NEXT_STEPS

## Naechster Schritt

```text
CAN-24.13: Entscheidung treffen, ob ein streng begrenzter Shadow-Hook fuer genau einen Reward gebaut werden darf.
```

## Entscheidungsbasis

```text
DryRun funktioniert erfolgreich mit mediaId/mediaAssetId.
Der Kandidat bauernweisheit ist validierbar.
Keine Queue/Audio-Aktion im DryRun.
```

## Sicherheitsanforderungen fuer einen moeglichen Hook

```text
Nur ein Reward-Key: bauernweisheit
Default aus oder explizit aktiviert
Legacy-Flow bleibt unveraendert
Shadow-DryRun nur Diagnose
Kein Sound-Play
Keine Queue
Keine Redemption-/Twitch-Aenderung
Sofort abschaltbar
```

## Weiter blockiert

```text
Keine produktive Sound-Migration.
Kein Sound-Play ueber Bus.
Kein automatischer Shadow-Mitulauf fuer alle Rewards.
```
