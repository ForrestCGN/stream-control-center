# Kanalpunkte Dashboard v0.6.1

Build: `friendly-media-action-editor`

Diese Lieferung verbessert nur die Dashboard-Bedienung. Backend und DB bleiben unverändert.

## Inhalt

- `htdocs/dashboard/modules/channelpoints.js`
- `htdocs/dashboard/modules/channelpoints.css`
- aktualisierte Projekt-/Modul-Doku

## Test

```bat
cd D:\Git\stream-control-center
node --check htdocs\dashboard\modules\channelpoints.js
.\stepdone.cmd "Channelpoints Dashboard v0.6.1 friendly media action editor"
```

Nach Deploy den Browser hart neu laden und einen Reward mit `Video anzeigen` oder `Sound abspielen` testen.
