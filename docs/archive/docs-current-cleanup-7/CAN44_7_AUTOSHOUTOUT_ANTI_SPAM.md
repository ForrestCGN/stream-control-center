# CAN-44.7 AutoShoutout Anti-Spam

## Ziel
AutoShoutout darf bei aktiven Chattern nicht bei jeder einzelnen Chatnachricht erneut melden, dass bereits ein Shouti vorhanden ist oder ein Cooldown aktiv ist.

## Änderung
- `clip_shoutout.js` Version `0.2.18`.
- Auto-SO-Chatmeldungen fuer Skip-Faelle werden gedrosselt.
- Folgende Meldungen werden nur noch einmal pro sinnvoller Einheit gesendet:
  - `alreadyReceived`: einmal pro StreamDay und Zielkanal
  - `alreadyQueued`: einmal pro offenem Queue-Eintrag und Zielkanal
  - `cooldown`: einmal pro Zielkanal und Cooldown-Fenster
  - `disabled`: einmal pro Zielkanal
- Die normale erfolgreiche Queue-Meldung bleibt weiterhin erlaubt.
- Auto-SO selbst bleibt aktiv und nutzt weiterhin DisplayQueue -> Video-Shoutout -> OfficialQueue.
- Kein Dashboard-Risiko: keine Tab-/DOM-Logik geändert.

## Technische Umsetzung
- In-Memory Notice-Guard in `state.autoShoutout.noticeMemory`.
- Status zeigt `noticeMemoryCount` zur Diagnose.
- Keine DB-Daten geloescht oder veraendert.
- Keine neue DB-Struktur.

## Test
```powershell
node -c backend\modules\clip_shoutout.js
node -c htdocs\dashboard\modules\auto_shoutout.js
.\stepdone.cmd "CAN-44.7 AutoShoutout Anti-Spam"
```

Danach Node neu starten.
