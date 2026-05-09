# STEP207 – Alert-Regel TTS Dashboard Settings

## Kurzfassung

Der TTS-Bereich im Alert-Regel-Editor wurde an den neuen STEP206-Stand angepasst. Aus „TTS vorbereitet“ wurde eine klare Text-to-Speech-Konfiguration mit Hauptschalter und dynamischen Hilfetexten.

## Dateien

- `htdocs/dashboard/modules/alerts.js`
- `htdocs/dashboard/modules/alerts.css`

## Ergebnis

- TTS kann pro Regel klar an-/ausgeschaltet werden.
- Detailfelder sind nur sichtbar, wenn TTS aktiv ist.
- Mindestwert-Beschriftung passt dynamisch zu Bits/Donation/Resub/Channelpoints.
- Hilfetexte erklären, dass der Alert-Sound zuerst läuft und TTS danach abgespielt wird.
- Platzhalter `{user}`, `{message}`, `{amount}` werden im UI erklärt.

## Nicht geändert

- keine Regeln verändert
- keine DB verändert
- kein Backend verändert
- keine Funktionen entfernt

