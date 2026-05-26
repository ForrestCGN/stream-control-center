# Module Docs Deep Dive Status

Stand: 2026-05-26 / nach STEP483_SHOUTOUT_DASHBOARD_TABS

## Abgeschlossene Doku-Blöcke

- STEP476: Core-/Basis-Module und Helper.
- STEP477: Stream-/Media-Module.
- STEP478: Integrations- und Community-Module.
- STEP479: Sekundäre/ergänzende Module.
- STEP480: Modul-Doku-/Versions-/EventBus-Regeln.
- STEP481: Server-Log-/Modul-Meta-/EventBus-Monitoring-Regeln.
- STEP482: Übergabe-/Chatwechsel-Doku-Regel.
- STEP483: Shoutout-Dashboard-Tabs und zugehörige Modul-Doku aktualisiert.

## Aktueller Dokumentationsgrad

Pro Modul sollen dokumentiert werden:

- Zweck
- Datei
- erkannte API-Routen
- erkannte Hauptfunktionen/interne Bereiche
- erkannte Datenbanktabellen
- wichtige Abhängigkeiten
- Runtime-/State-Themen
- Dashboard-/Overlay-Hinweise
- Risiken/Regeln
- sinnvolle Tests
- offene Punkte
- erkannte Modulversion / `moduleVersion`
- Modul-Meta-/Server-Log-/EventBus-Readiness, soweit vorhanden

## STEP483 ergänzt

Für `clip_shoutout` / VSO wurde die Deep-Dive-Doku aktualisiert:

```text
docs/modules/clip-shoutout-vso-deep-dive.md
```

Neu dokumentiert:

- Dashboard-Dateien `htdocs/dashboard/modules/shoutout.js` und `htdocs/dashboard/modules/shoutout.css`.
- Tab-Aufteilung: Übersicht, Queues, Statistik, Timeline, Settings/Test.
- Dashboard-State `activeTab`.
- Keine Backend-, API-, Config-, DB- oder EventBus-Änderung in STEP483.
- Tests für Dashboard und API.

## Noch offen

- Eingehende Shoutouts separat loggen und dokumentieren.
- Dashboard-/Overlay-Dokus bei weiteren UI-/Overlay-STEPS gegen echte Dateien nachziehen.
- Module schrittweise mit maschinenlesbarer Meta-Info ausstatten.
- EventBus später als zentrale Monitoring-Schicht ausbauen.

## Pflege bei Chatwechsel / Übergabe

Wenn Forrest „dokumentieren und aktualisieren" schreibt oder ein neuer Chat vorbereitet wird, müssen die Modul-Dokus geprüft werden.

Für jedes seit dem letzten Stand geänderte oder neu angelegte Modul gilt:

```text
1. passende docs/modules/<modul>.md lesen
2. echte Moduldateien prüfen
3. Routen, Funktionen, Configs, DB-Tabellen, Events, Dashboard-/Overlay-Bezüge aktualisieren
4. offene Punkte in TODO.md/NEXT_STEPS.md nachziehen
5. docs/current/MODULE_DOCS_DEEP_DIVE_STATUS_*.md aktualisieren oder neue Statusdatei anlegen
```

Keine Moduländerung gilt als abgeschlossen, wenn die zugehörige Modul-Doku veraltet bleibt.
