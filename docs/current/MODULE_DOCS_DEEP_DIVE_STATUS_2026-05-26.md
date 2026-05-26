# MODULE_DOCS_DEEP_DIVE_STATUS_2026-05-26

## Aktualisiert in STEP490

- `docs/modules/channelpoints-deep-dive.md`
- `docs/modules/README.md`

## Aktueller Stand

- STEP483 Dashboard Tabs dokumentiert.
- STEP484 Incoming-Shoutout-EventSub-Integration dokumentiert.
- STEP485 Produktionscheck dokumentiert.
- STEP486 Live-Test-/Decision-Prep dokumentiert.
- STEP488 Communication-Bus-Modul-Contract direkt in `helper_communication.js` dokumentiert.
- STEP489 Kanalpunkte-Backend-Skeleton erstellt.
- STEP490 Kanalpunkte-Modellplan und Media-Integrationsplan dokumentiert.

## Wichtiger Korrekturhinweis

Ein separater `helper_communication_contract.js` soll nicht als dauerhafte Architektur genutzt werden. Der Contract sitzt ab STEP488 im bestehenden Bus-Core.

## Kanalpunkte-Doku-Regel

Für Kanalpunkte gilt:

```text
Medien/Uploads immer über bestehendes media.js / Media-Picker-System.
Keine eigene Upload-Maske im Kanalpunkte-Modul.
```

## Nächster Doku-Fokus

Nach STEP491 muss die DB-Migration in `docs/modules/channelpoints-deep-dive.md` ergänzt werden.
