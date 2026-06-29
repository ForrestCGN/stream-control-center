# RDAP 0.2.48 - Remote-Modboard Media Mod View Cleanup Handoff Docs

Stand: 2026-06-29

## Ziel

Dieser Step dokumentiert den aktuellen Stand nach `0.2.47B` und legt den naechsten fachlichen Schritt fest:

```text
Media-Seite fuer normale Mods vereinfachen.
Technische Diagnose-Details aus der normalen Media-Uebersicht entfernen.
Technische Quelle/DB/Fallback/Writes-Details in den Admin-/Diagnosebereich verschieben.
```

Dieser Step ist bewusst Doku-/Handoff-only.

## Anlass

Im Browser ist die Media-Seite nach `0.2.47B` wieder sichtbar. Die Seite zeigt aber in der normalen Mod-Ansicht zu viele technische Details:

```text
- Agent / DB / Fallback
- Primaere Quelle
- DB-Index geprueft/verfuegbar
- Fallback
- Writes
- technische Diagnose-Hinweise
```

Diese Informationen sind fuer normale Mods nicht relevant und gehoeren nicht prominent auf die Media-Hauptseite.

## Bestaetigter Stand

```text
0.2.46:
- sourceInfo ist in /api/remote/media/status vorhanden.
- Ohne db=1 gibt es keine DB-Abfrage.
- Mit db=1 wird nur Schema/COUNT read-only diagnostiziert.
- Keine DB-Item-Reads.
- Fallback/Writes bleiben aus.

0.2.47:
- Media-UI nutzt sourceInfo sichtbar.
- Das war funktional, aber fuer Mods zu technisch.

0.2.47B:
- Media-UI Runtime-Fix.
- Media-Seite rendert wieder sichtbar.
- Agent-Memory ist aktiv.
- Browser zeigt Medienbereiche und Inventar.
```

## Neue Produktregel

```text
Normale Mod-Ansicht:
- soll einfach und handlungsorientiert sein.
- zeigt Medienbereiche, Anzahl, Filter, Medienliste und read-only Hinweis.
- zeigt keine internen DB-/Fallback-/Write-Flags prominent.
- zeigt keine technischen Diagnose-Saetze, die nur Entwickler/Admins brauchen.

Admin-/Diagnosebereich:
- darf Quelle/Agent/DB/Fallback/Writes anzeigen.
- darf sourceInfo kompakt anzeigen.
- darf DB-Index-Diagnose beschreiben.
- darf Readonly-/Sicherheitsgrenzen technisch sichtbar machen.
```

## Naechster funktionaler Step

```text
RDAP_0.2.49_REMOTE_MODBOARD_MEDIA_MOD_VIEW_CLEANUP_ADMIN_DIAG_SPLIT
```

Ziel:

```text
Bestehende Media-UI verschlanken:
- normale Media-Uebersicht enttechnisieren.
- technische sourceInfo-Karte aus der normalen Media-Seite entfernen oder stark vereinfachen.
- Admin-/Diagnosehinweis vorbereiten, ohne neue Writes.
- keine neue API, wenn nicht noetig.
- kein neuer Endpoint, wenn nicht noetig.
```

## Erwartete UI nach 0.2.49

Normale Mod-Ansicht:

```text
Header:
Media-System
Status: Online-Media-Inventar aktiv, 120 Medien, read-only.

Karten:
- Modus: Online/Lokal
- Inventar: Anzahl Medien
- Status: Read-only
- Aktionen: Upload/Bearbeiten/Loeschen gesperrt

Inhalt:
- Media-Bereiche
- Medienliste mit Filter
- kurze klare Erklaerung:
  "Diese Ansicht ist read-only. Dateien kommen vom Stream-PC/Agent. Upload, Bearbeiten und Loeschen sind deaktiviert."
```

Nicht mehr prominent in der normalen Mod-Ansicht:

```text
- Primaere Quelle agent_memory
- Quelle aktiv ja
- DB-Index geprueft nein
- DB-Index verfuegbar nicht geprueft
- Fallback aus
- Writes aus
- Diagnosehinweise zu ?db=1
```

## Sicherheitsgrenzen bleiben

```text
Keine Backend-Write-Routen.
Keine DB-Item-Reads.
Keine SQL-Ausfuehrung.
Keine DB-Migration.
Keine INSERT/UPDATE/DELETE.
Keine Media-Daten-Writes.
Keine Agent-Writes.
Kein Upload/Edit/Delete.
Fallback bleibt aus.
Writes bleiben aus.
```

## Masterprompt / Pflichtkontext fuer neuen Chat

Masterprompt:

```text
docs/current/MASTER_PROMPT_stream_control_center_CLEAN_2026-06-21.txt
```

RDAP Workflow Addendum:

```text
docs/current/MASTER_PROMPT_RDAP_WORKFLOW_ADDENDUM_2026-06-24.md
```

Startdatei fuer neuen Chat:

```text
docs/current/START_HERE_FOR_NEW_CHAT.md
```

Kopier-Prompt fuer neuen Chat:

```text
docs/current/PROMPT_FOR_NEW_CHAT_RDAP_MEDIA_MOD_VIEW_CLEANUP.md
```

## Checks

```powershell
Select-String -Path .\docs\current\PROMPT_FOR_NEW_CHAT_RDAP_MEDIA_MOD_VIEW_CLEANUP.md -Pattern "Masterprompt","0.2.47B","0.2.49","Mod-Ansicht","Admin-/Diagnosebereich","keine Writes"

git status
```

## Kein Deploy

```text
Dieser Step aendert keine Runtime-Dateien.
Kein Node-Neustart.
Kein Webserver-Deploy.
```
