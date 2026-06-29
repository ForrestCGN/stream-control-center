# NEXT_STEPS

## Naechster Schritt

Webserver-Diff nach 0.2.58E testen und `modifiedAtDeltaStats` bewerten.

Ziel:
- Klaeren, ob `modifiedAt`-Abweichung konstant, zeitzonenartig, rundungsartig oder importbedingt ist.
- Pruefen, ob fuer den ersten gated Delta-Upsert `modifiedAt` als hartes Change-Kriterium taugt.
- Keine DB-Writes.
- Kein Upsert.
- Kein Tombstone/Delete.

## Danach

- Gated Delta-Upsert separat planen.
- Tombstone/`deleted=1` fuer fehlende Dateien separat planen.
- Online->Agent Queue separat und nur mit expliziten Permission-/Audit-/Confirm-Gates planen.
