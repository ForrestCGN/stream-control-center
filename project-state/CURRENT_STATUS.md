# Current Status

Stand: 2026-06-27

Version 0.1.3 bleibt die aktuelle technische Basis fuer Streaming-PC Verbindung, Komponentenstatus und OBS-Status read-only. Keine OBS-/Sound-/Overlay-/Command-Steuerung und keine Agent-Actions.

RDAP Docs Cleanup 5 bis 10 ist abgeschlossen.

RDAP TODO Rescue 1 und 2 sind abgeschlossen:

- `project-state/TODO.md` ist wieder die kurze aktive TODO-Liste fuer direkte naechste Arbeit.
- `project-state/PARKED_TODOS.md` ist die zentrale Langzeit-Merkstelle fuer zurueckgestellte Arbeit, fruehe Planungen und geparkte Themen.
- Rescue 2 hat die in Rescue 1 markierten Archivquellen gezielt ausgewertet und belegte Langzeitpunkte ergaenzt.
- Alte reine CAN-/STEP-Install-/Deploy-Reste wurden nicht wiederbelebt.

RDAP_MODULE_ROUTE_AUDIT_1_DEV_CODE_VERIFY ist vorbereitet/ausgefuehrt als Doku-only-Audit gegen echte GitHub/dev-Dateien.

Wichtiger Audit-Befund:

- Die Doku hatte den technischen Basisstand zu pauschal als "keine Writes" beschrieben.
- Echte GitHub/dev-Dateien zeigen differenzierter:
  - Agent/OBS/Sound/Overlay/Command-Steuerung bleibt deaktiviert/read-only.
  - Admin-Note Deactivate/Delete bleiben deaktiviert.
  - Admin-Note Create-Backend und Update-Backend sind im Code/Status als kontrollierte Backend-Writes vorhanden.
  - Update-UI ist nicht vorbereitet.
  - Create-UI ist fuer write-berechtigte Admins vorbereitet.
  - DB-Write-Verbindung haengt an Auth/OAuth/Session/DB-Gating.
- Vor weiterer Admin-User/Admin-Notes-Arbeit sollte ein kleiner Status-/Routes-Semantik-Doku-Fix gemacht werden.

Normale RDAP-/Remote-Modboard-Weiterarbeit kann fortgesetzt werden, aber der naechste sinnvolle Schritt ist zuerst die Status-/Routes-Semantik sauber zu dokumentieren.
