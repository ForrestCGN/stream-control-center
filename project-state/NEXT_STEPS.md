# NEXT_STEPS

## Naechster RDAP-Schritt nach 0.2.58M

`RDAP_0.2.58N_MEDIA_INDEX_PERSISTENT_MISSING_TOMBSTONE_GATED_PREP`

Ziel:

- Gated Tombstone/Soft-Delete-Route fuer normale persistente Missing-Kandidaten vorbereiten.
- Nur local-only.
- Nur mit `confirmWrite:true`.
- Eigenes Confirm-Token fuer persistent-media-tombstone verwenden.
- `expectedCandidateCount` pruefen.
- Media-Index-Write-Gates pruefen.
- Audit schreiben.
- Lock/Backup/Readback-Konzept einhalten.
- Kein Hard-Delete.
- Kein physisches Loeschen.
- Kein Online->Agent-Trigger.

## Ausgangspunkt

0.2.58M ist ein read-only Doku-/Plan-Step:

```text
Normale lokal geloeschte persistente Media-Dateien werden nur als spaetere Tombstone-Kandidaten geplant.
Kein Code-Write.
Kein DB-Write.
Kein Webserver-Deploy noetig.
```

0.2.58L ist bestaetigt:

```text
Alter sounds:tts/generated/** Legacy-DB-Eintrag wurde per gated Soft-Delete bereinigt.
Cleanup-Preview danach = 0.
Diff-Missing danach = 0.
Media-Index-Write-Gates sind wieder aus.
```

## Wichtig

TTS-generated Dateien bleiben Sonderfall:

```text
sounds/tts/generated/** wird nicht synchronisiert und soll nicht dauerhaft im Media-Index auftauchen.
```

Normale persistente Media-Dateien sind anderer Fall:

```text
Wenn lokal geloescht und Full-Sync vollstaendig ist, koennen sie spaeter als Missing/Tombstone-Kandidaten behandelt werden.
```

Tombstone/Delete fuer normale persistente Media-Dateien erst mit eigenem Gate-/Confirm-/Audit-/Lock-/Backup-/Readback-Step.

## Arbeitswechsel

Alert-Arbeiten nicht mit RDAP vermischen; fuer Alert-System zuerst Masterprompt und relevante GitHub/dev-Dateien lesen.
