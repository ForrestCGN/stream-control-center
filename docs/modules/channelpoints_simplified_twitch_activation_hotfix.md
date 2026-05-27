# STEP526 – Channelpoints Simplified Twitch Activation Hotfix

## Ziel

Hotfix fuer STEP525:

- `channelpoints.js` laedt wieder korrekt.
- Fehlende Funktion `deleteRewardFromTwitch` wurde wiederhergestellt.
- Der Editor nutzt kein lokales Aktiv-Haekchen mehr.
- Speichern erstellt/aktualisiert den Twitch-Reward.
- Neue Rewards werden auf Twitch standardmaessig **inaktiv** erstellt.
- Der Aktiv/Inaktiv-Schalter in der Uebersicht steuert nur Twitch-Sichtbarkeit.

## Wichtig

Der vorherige STEP525 darf nicht weiter genutzt werden, weil das Backend-Modul beim Start mit
`deleteRewardFromTwitch is not defined` abgebrochen ist.

## Geaenderte Dateien

- `backend/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`

## Verhalten

### Neuer Reward

```text
Erstellen/Speichern
→ lokaler Reward wird angelegt
→ Twitch-Reward wird erstellt/aktualisiert
→ Twitch-Reward bleibt standardmaessig inaktiv
```

### Bestehender Reward

```text
Speichern
→ lokaler Reward wird aktualisiert
→ Twitch-Reward wird aktualisiert
→ bisheriger Twitch-Aktivstatus bleibt erhalten
```

### Uebersicht

```text
Aktiv/Inaktiv
→ steuert nur Twitch sichtbar/einloesbar
```

## Checks

```bat
cd D:\Git\stream-control-center
node --check backend\modules\channelpoints.js
node --check htdocs\dashboard\modules\channelpoints.js
.\stepdone.cmd "STEP526 Channelpoints Simplified Twitch Activation Hotfix v0.9.12"
```

Danach deploy/restart.
