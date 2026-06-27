# Changelog

## Version 0.2.6 - Online-Modoberflaeche bereinigt

- Sichtbare Version `0.2.6` vorbereitet.
- Deutscher Buildname `Online-Modoberflaeche bereinigt` eingefuehrt.
- Linke Online-Navigation bereinigt:
  - `Lokales Dashboard` wird nicht mehr als Hauptmenue angezeigt.
  - `Mein Konto` wird nicht mehr als Hauptmenue angezeigt.
  - `Routen` wird nicht mehr unter System angezeigt.
- Technische Routen-/Detailansicht bleibt unter `Admin -> Doku / Details`.
- Konto-/Rechtefunktionen bleiben oben rechts im User-Panel.
- Keine Backend-Routen entfernt.
- Keine DB-Migration, keine produktiven Writes, keine Agent-Actions.

## DOKU - Projektstatus und Langzeit-TODOs zentralisiert

- Master-Prompt um zentrale Langzeit-TODO-Regel ergaenzt.
- `project-state/PARKED_TODOS.md` als zentrale Langzeit-Merkstelle aufgenommen.
- `project-state/TODO.md` wieder kurz und aktiv gehalten.
- `docs/current/START_HERE_FOR_NEW_CHAT.md` auf zentrale Startreihenfolge mit `PARKED_TODOS.md` aktualisiert.
- `docs/current/RDAP_EXAKTE_ARBEITSWEISE_2026-06-25_RDAP28_WORKFLOW.md` gestrafft: RDAP-Spezialregeln behalten, alte Historien ausgelagert.
- `docs/current/NEXT_CHAT_PROMPT_RDAP_REMOTE_MODBOARD_NEXT.md` auf zentrale TODO-/Parked-TODO-Struktur aktualisiert.
- Ueberholte RDAP104-Next-/Workflow-Dateien als historisch markiert und nach `docs/archive/` kopiert.
- Doku-only: keine Codeaenderung, kein Webserver-Deploy noetig.

## RDAP128 - Handoff nach Version 0.2.5

- Live-Bestaetigung fuer `0.2.5 - Lokales Dashboard vorbereitet` dokumentiert.
- Startdatei und Next-Chat-Prompt auf den bestaetigten Live-Stand aktualisiert.
- Geparkte Idee `Kontrollierter Online-Sync lokaler Aenderungen` dokumentiert.
- Naechster sinnvoller technischer Fokus auf `0.2.6 - Lokale Statusdaten verbessert` gesetzt.
- Doku-only: keine Codeaenderung, kein Webserver-Deploy noetig.

## Version 0.2.5 - Lokales Dashboard vorbereitet

- Sichtbare Version `0.2.5` eingefuehrt.
- Deutscher kurzer Buildname `Lokales Dashboard vorbereitet` eingefuehrt.
- Hauptbereich `Lokales Dashboard` im zentralen Modulmanifest registriert.
- Drei lokale read-only Seiten registriert:
  - `Stream-PC Status`,
  - `LAN / Zugriff`,
  - `Start / Env`.
- Alle lokalen Seiten nutzen `runtime: local`.
- Sprachdateien Deutsch/Englisch erweitert.
- Status-API meldet lokale Dashboard-Seiten als vorbereitet.
- Keine DB-Migration, keine neuen produktiven Writes, keine Agent-Actions.
