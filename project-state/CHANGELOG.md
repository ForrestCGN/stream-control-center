# CHANGELOG

## 2026-06-26 - RDAP75_ADMIN_NOTES_PAGE_DESIGN_CONTRACT_AND_FINDINGS

```text
- Admin-Notes Seitenaufbau verbindlich festgelegt.
- Weitere kleine Layout-Patches ohne Konzept gestoppt.
- Live-Findings nach RDAP74 dokumentiert:
  - Notizen-Anzahl muss zum aktuell ausgewaehlten User gehoeren.
  - Zieluser-Wechsel muss eindeutig die Notizen dieses Users laden/anzeigen.
  - Header/Router-State ist falsch, wenn "User-Detail" stehen bleibt, obwohl Admin-Notes sichtbar ist.
- Zielaufbau dokumentiert:
  - Header: Admin-Notizen | Notizen neu laden | Neue Notiz.
  - Zieluser-Auswahl als Kontext.
  - Liste: Notizen fuer <DisplayName>, <n> Notizen geladen.
  - Create nur nach Klick auf Neue Notiz.
  - Diagnose/Technik nicht prominent in Hauptansicht.
- RDAP76 als Header/Router-State-Fix festgelegt.
- RDAP77 als Selected-User-Reload/Count-Fix festgelegt.
- Doku-only.
- Kein Code.
- Keine Backend-Route.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP74_ADMIN_NOTES_HEADER_ACTIONS_DEDUP

```text
- Admin-Notes Header/Toolbar-Doppelstand bereinigt.
- Frontend-only Style-Injection rdap74AdminNotesHeaderActionsDedupStyle ergaenzt.
- Alte Admin-Notes Style-Injections RDAP73/RDAP72/RDAP71/RDAP69/RDAP67 werden beim Laden entfernt.
- initAdminNotesHeaderActionsDedup() ergaenzt.
- Bestehende Button-Zeile mit "Notizen neu laden" und "Neue Notiz" in den oberen Admin-Notizen-Header verschoben.
- Separate Toolbar mit erneutem "Admin-Notizen" ausgeblendet.
- Bestehende Button-IDs/Eventhandler bleiben erhalten.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP73_ADMIN_NOTES_HUMAN_READABLE_LIST

```text
- Admin-Notes-Liste weiter enttechnisiert.
- Frontend-only Style-Injection rdap73AdminNotesHumanReadableListStyle ergaenzt.
- Alte Admin-Notes Style-Injections RDAP72/RDAP71/RDAP69/RDAP67 werden beim Laden entfernt.
- Technische Chips Admin-only / Read/Create/Update aus Hauptansicht ausgeblendet.
- Hinweistext in Liste vereinfacht.
- Technische noteUid wird nicht mehr als sichtbare Hauptueberschrift angezeigt.
- Notiz-Titel wird menschlich aus noteUid formatiert.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP72_ADMIN_NOTES_HIDE_TECHNICAL_STATUS

```text
- Admin-Notes Normalansicht weiter enttechnisiert.
- Frontend-only Style-Injection rdap72AdminNotesHideTechnicalStatusStyle ergaenzt.
- Alte RDAP71/RDAP69/RDAP67 Admin-Notes Style-Injections werden entfernt.
- Technische Read/Write/Grenzen-Bloecke in der normalen Arbeitsansicht ausgeblendet.
- Lange technische Header-Erklaerung ausgeblendet.
- Aktionsleiste mit Neu laden/Neue Notiz bleibt sichtbar.
- Liste bleibt prominent.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP71_ADMIN_NOTES_CLEAN_LAYOUT

```text
- Admin-Notes Clean-Layout vorbereitet.
- Frontend-only Style-Injection rdap71AdminNotesCleanLayoutStyle ergaenzt.
- Alte RDAP69/RDAP67 Admin-Notes Style-Injections werden beim Laden entfernt, falls vorhanden.
- Aktion/Neu laden/Neue Notiz als schmalere Arbeits-Toolbar dargestellt.
- Technische Read/Write/Grenzen-Infos weniger dominant gemacht.
- Create-Bereich nicht mehr dauerhaft als grosser rechter Kasten sichtbar.
- Create-Formular nur sichtbar, wenn Neue Notiz geoeffnet ist.
- Sicherheit/Diagnose-Karte in Arbeitsansicht ausgeblendet.
- Liste und Notizkarten klarer in den Fokus gesetzt.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP70_ADMIN_NOTES_COMPACT_LAYOUT_LIVE_VERIFICATION_DOC

```text
- RDAP69 Live-Deploy technisch bestaetigt dokumentiert.
- Serverchecks dokumentiert:
  - /api/remote/status ok.
  - /api/remote/routes ok.
  - Public UI HTTP 200.
- Browser-/Layoutbefund dokumentiert:
  - Admin-Notes sichtbar.
  - Navigation stabil.
  - Delete/Deactivate nicht sichtbar.
  - Compact-Layout technisch ok, aber fachlich weiterhin zu technisch.
  - "Neue Notiz" wirkt doppelt: oben Button und rechts dauerhafter Create-Bereich.
  - Diagnose-/Safety-Karten sind fuer Normalbetrieb zu dominant.
- RDAP71 Admin-Notes Clean-Layout als naechsten Frontend-only Step festgelegt.
- Doku-only.
- Kein Code.
- Keine Backend-Route.
- Keine DB-Migration.
- Keine neue Permission.
```

## 2026-06-26 - RDAP69_ADMIN_NOTES_COMPACT_LAYOUT

```text
- Admin-Notes Compact-Layout vorbereitet.
- Frontend-only Style-Injection rdap69AdminNotesCompactLayoutStyle ergaenzt.
- RDAP67-Style wird beim Laden entfernt, falls vorhanden.
- Obere Statuskarten kompakter gemacht.
- Create-Bereich weniger dominant gemacht.
- Liste hoeher und zentraler vorbereitet.
- Notizkarten kompakter und weiterhin lesbar gestaltet.
- Erfolg-/Fehler-/Info-Hinweise platzsparender gehalten.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```

## 2026-06-26 - RDAP68_ADMIN_NOTES_UI_POLISH_LIVE_VERIFICATION_DOC

```text
- RDAP67 Live-Deploy dokumentiert.
- Serverchecks dokumentiert:
  - /api/remote/status ok.
  - /api/remote/routes ok.
  - Public UI HTTP 200.
- Browserbefund dokumentiert:
  - Admin-Notizen sichtbar.
  - Navigation stabil.
  - Bearbeiten funktioniert.
  - Speichern funktioniert.
  - Delete/Deactivate nicht sichtbar.
- Layoutbefund dokumentiert:
  - RDAP67 ist fachlich ok, aber noch nicht optimal uebersichtlich.
  - Statuskarten/Create-Bereich nehmen zu viel Platz ein.
  - RDAP69 soll Compact-Layout werden.
- Doku-only.
- Kein Code.
- Keine Backend-Route.
- Keine DB-Migration.
- Keine neue Permission.
```

## 2026-06-26 - RDAP67_ADMIN_NOTES_UI_POLISH

```text
- Admin-Notes UI-Polish vorbereitet.
- Frontend-only Style-Injection rdap67AdminNotesPolishStyle ergaenzt.
- Notizkarten optisch lesbarer gemacht.
- Notiztext und Metadaten besser getrennt.
- Erfolg-/Fehler-/Info-Hinweise klarer dargestellt.
- Bearbeiten-Editor optisch kompakter gemacht.
- Create-Karte optisch klarer markiert.
- Keine Backend-Route geaendert.
- Keine DB-Migration.
- Keine neue Permission.
- Kein Delete/Deactivate.
```