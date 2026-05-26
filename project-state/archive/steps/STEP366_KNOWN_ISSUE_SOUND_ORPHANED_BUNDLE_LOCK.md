# STEP366 Known Issue: Sound-System Orphaned Bundle Lock

Datum: 2026-05-24
Status: offen / gemerkt, noch keine Umsetzung

## Kurzfassung
Beim Live-Test mit Geburtstagssystem und VIP-Sounds standen vier Items in der Sound-System-Queue, aber nichts wurde abgespielt.

Der Status zeigte:

```text
current: null
queuedCount: 4
activeBundleLock: birthday_1779641794533_ma71ca
currentBundle: null
paused: false
```

Damit war kein Sound aktiv, aber ein alter Birthday-Bundle-Lock blockierte weiterhin die Queue.

## Beobachtung
- Discord war nicht der Blocker: Discord-Queue war leer, Player war idle.
- Sound-System war enabled und nicht paused.
- Queue enthielt Birthday- und VIP-Items.
- Die wartenden Items hatten `queuedBehindActiveBundleLock: true`.
- `activeBundleLockId` zeigte auf ein altes Birthday-Bundle: `birthday_1779641794533_ma71ca`.
- Aktuell wartende Birthday-Items gehörten bereits zu einem anderen Bundle: `birthday_1779642002163_k0so65`.

## Live-Entstörung
Diese Route hat den Zustand bereinigt:

```powershell
Invoke-RestMethod -Method Post "http://127.0.0.1:8080/api/sound/clear"
```

Danach war der Status sauber:

```text
current: leer
queuedCount: 0
activeBundleLock: leer
currentBundle: leer
paused: False
```

## Vermutete Ursache
Ein Birthday-Bundle wurde manuell oder durch einen Sonderfall gestoppt/beendet, aber der aktive Bundle-Lock wurde nicht freigegeben.
Dadurch blieb das Sound-System in einem Zustand hängen, in dem kein aktueller Sound läuft, aber neue Sounds weiterhin hinter einem alten Lock warten.

## Späterer Fix-Kandidat
Sound-System sollte orphaned bundle locks erkennen und automatisch freigeben, z. B. wenn:

```text
current == null
currentBundle == null
activeBundleLock != null
```

Zusätzlich sollte danach die Queue wieder angestoßen werden, sofern sie Items enthält.

## Wichtig
Dieser Punkt wird bewusst NICHT sofort umgesetzt, weil aktuell weiter am Bus/Alert-Kommunikationssystem gearbeitet wird.
Das Geburtstagssystem kommt später separat dran.

Keine Funktionalität entfernen.
