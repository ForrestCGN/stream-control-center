# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58L-Test

`RDAP_0.2.58M_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_PLAN_READONLY`

Ziel:

- Normale lokal geloeschte persistente Media-Dateien sicher behandeln.
- Read-only planen, wie Missing-on-Agent aus vollstaendigem Full-Sync zu Tombstone-Kandidaten wird.
- Kein Auto-Delete.
- Kein DB-Write in diesem Plan-Step.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58L bereitet den kontrollierten Cleanup fuer alte TTS-generated Legacy-DB-Eintraege vor.

TTS-generated Dateien sind Sonderfall:

```text
sounds/tts/generated/** wird nicht synchronisiert und kann als Legacy bereinigt werden.
```

Normale persistente Media-Dateien sind anderer Fall:

```text
Wenn lokal geloescht und Full-Sync vollstaendig ist, sollen sie spaeter als Missing/Tombstone-Kandidaten behandelt werden.
```

## Wichtig

Tombstone/Delete fuer normale persistente Media-Dateien erst mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
