# CHANGELOG

## CAN-27.1

- Getrackte Altlast `htdocs/htdocs/...` als Entfernungs-Step vorbereitet.
- CAN-27.0 Befund dokumentiert:
  - `htdocs/htdocs/dashboard/modules/overlays.js` ist ein alter/abweichender Stand der echten Dashboard-Datei.
  - `htdocs/htdocs/overlays/Overlay Birthday.html` ist ein Duplikat von `htdocs/overlays/_overlay-birthday.html`.
  - `htdocs/htdocs/overlays/_rahmen.html` ist ein alter/abweichender Stand der echten Rahmen-Datei.
- Keine Runtime-Referenzen auf `htdocs/htdocs` gefunden.
- Echte Zielpfade bleiben unveraendert.
- Keine Backend-Logik, keine Dashboard-Logik, keine DB und keine produktiven Flows geaendert.

## CAN-26.5

- Deploy-Script `tools/deploy_repo_to_streamassets.ps1` um Doku-/Projektstands-Sync erweitert.
- Live-Deploy umfasst jetzt zusaetzlich:
  - `docs/current`
  - `docs/system-inspection`
  - `docs/modules`
  - `project-state`
- Live-Test bestaetigt: `docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md`, `docs/current/CURRENT_CHAT_HANDOFF_CAN26_5.md` und Projektstandsdateien sind in Repo und Live synchron.

## CAN-26.4

- Live-Doku-Sync und NEXT_STEPS-Bereinigung im Repo vorbereitet.
- `NEXT_STEPS.md` bereinigt: direkter naechster Schritt ist CAN-27.0 Planung, nicht mehr CAN-26.3 Abschluss.
- Fehlende Handoff-Datei `docs/current/CURRENT_CHAT_HANDOFF_CAN26_3.md` fuer Live-Sync aufgenommen.

## CAN-26.3

- Dokumentation und Handoff auf abgeschlossenen CAN-26 Stand aktualisiert.
- Dashboard-Sichtpruefung dokumentiert.
- SYSTEME-Bereich ist lesbar.
- Keine langen Detailbloecke in Tabellenzellen sichtbar.
- Overlay-Monitor zeigt 0 Warnungen / 0 Fehler.
- `overlay:frame_overlay` wird in Szene ohne Rahmen korrekt als `EXPECTED_INACTIVE` angezeigt.
- Sicherheitsgrenze weiterhin read-only: keine Aktion wird ausgefuehrt.
- Keine Code-Logik geaendert.
- Keine produktive Aktion ausgefuehrt.

## CAN-26.2

- Overlay-Monitor `client-control/status` um Top-Level-Diagnosefelder ergaenzt.
- Sichtbar sind jetzt u. a.:
  - `currentProgramSceneName`
  - `currentPreviewSceneName`
  - `currentProgramSceneKnown`
  - `sceneAwarenessMode`
  - `inventoryUpdatedAt`
  - `inventoryFromCache`
  - `inventoryFromMemory`
- `overlay_monitor` Version auf 0.1.8 / Status API 1.0.8 erhoeht.
- Keine OBS-Reparatur, kein Source-Refresh, keine DB-Migration.

## CAN-26.1

- Overlay-Monitor Scene-Awareness robuster gemacht.
- `currentProgramSceneName` faellt nicht mehr blind auf `sceneNames[0]` zurueck.
- Bei fehlender/unklarer Program-Szene wird safe-inactive bewertet und kein Overlay automatisch als `activeExpected` markiert.
- `overlay:frame_overlay` wurde in einer Szene ohne Rahmen korrekt als `expected_inactive` getestet.
- `overlay_monitor` Version auf 0.1.7 / Status API 1.0.7 erhoeht.
- Keine produktive Aktion ausgefuehrt.

## CAN-26.0

- GitHub/dev und Live-System bewusst abgeglichen.
- Runtime-relevante Dateien fuer Bus-/Overlay-Diagnose waren identisch.
- Doku-Dateien im Live-System wichen ab bzw. Handoff fehlte dort; Doku-Stand wird mit CAN-26.3 aktualisiert.
- Bus-Diagnose und Overlay-Monitor final gegenprueft.
- Urspruenglicher Befund: Rahmen-Overlay wurde bei unklarer Szenen-/Inventarbewertung als activeExpected behandelt.
- Daraus entstanden CAN-26.1 und CAN-26.2.
