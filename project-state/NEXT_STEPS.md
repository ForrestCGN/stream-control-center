# NEXT_STEPS

Stand: RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP59_ADMIN_NOTES_COMMUNITY_READ_SCOPE_PLAN
```

## Ziel

```text
Planen, ob und wie Admin-Notizen spaeter ausserhalb des Admin-Bereichs read-only sichtbar werden duerfen.
```

## Richtung

```text
- Plan-only.
- Keine direkte Community-Read-Implementierung.
- Keine neue Route in RDAP59.
- Keine DB-Migration.
- Keine Writes.
- Keine Admin-Note Update/Deactivate/Delete-Funktion.
- Kein Permission-/Rollen-/Gruppen-Write.
```

## Leitfragen

```text
- Welche Notizen duerfen Community-/Nicht-Admin-Bereiche sehen?
- Welche Notiztypen bleiben admin-only?
- Welche Rollen duerfen lesen?
- Wird nur ein Flag/eine Zusammenfassung angezeigt oder kompletter Notiztext?
- Welche Privacy-/Audit-Regeln gelten?
- Welche API darf spaeter genutzt werden?
- Ist eine neue read-only Route noetig oder bleibt alles im Admin-Bereich?
```

## Vorher pruefen

```text
docs/current/NEXT_CHAT_PROMPT_RDAP_AFTER_RDAP58.md
docs/current/RDAP57B_PERMISSION_READ_DETAIL_CATEGORIES_POLISH_LIVE_CONFIRMED_DOCS.md
docs/current/RDAP58_PERMISSION_READ_DETAIL_WRAPUP_OR_NEXT_AREA_PLAN.md
project-state/CURRENT_STATUS.md
project-state/TODO.md
project-state/FILES.md
project-state/CHANGELOG.md
```

## Nicht in RDAP59 aendern

```text
Keine Backend-Aenderung ohne separaten Plan.
Keine DB-Migration.
Keine Community-Read-Freigabe ohne Plan.
Keine Permission-Verwaltung mit Writes.
Kein Admin-Note Update.
Kein Admin-Note Deactivate.
Kein Delete.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
```
