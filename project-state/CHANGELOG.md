# CHANGELOG

## 2026-06-27 - RDAP118_ADMIN_NAV_POLISH_AND_VISIBLE_REVIEW

```text
- Admin-/System-Navigation sichtbar poliert.
- users.js normalisiert Admin-Labels/Aliase zentral.
- users.js stellt zentral sicher, dass Benutzerverwaltung, Admin-Notizen, Verbindungen und Doku / Details im Admin-Menue vorhanden sind.
- System-Menue wird auf Übersicht und Diagnose bereinigt.
- notes.js und connections.js bleiben Fachmodule ohne eigene Admin-Navi-Button-Erzeugung.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```

## 2026-06-27 - RDAP117C_ADMIN_MODULE_NAV_CONTRACT_FIX

```text
- Admin-Modul-/Navigation-Vertrag korrigiert.
- notes.js erzeugt keinen eigenen Admin-Navi-Button mehr.
- connections.js erzeugt keinen eigenen Admin-Navi-Button mehr.
- users.js bleibt zentraler Admin-Nav-Owner fuer Sortierung/Deduplizierung.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```

## 2026-06-27 - RDAP117B_CONNECTIONS_NAV_DEDUP

```text
- Admin-Navigation dedupliziert gleiche data-page-Eintraege.
- Verbindungen darf nur einmal unter Admin sichtbar sein.
- Keine Backend-Aenderung, keine DB-Migration, keine Agent-Actions.
```
