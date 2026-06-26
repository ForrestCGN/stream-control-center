# Remote-Modboard – UI-Design und Seitenstruktur

Stand: RDAP76B_DOCS_PROJECT_CONSOLIDATION_REMOTE_MODBOARD  
Datum: 2026-06-26  
Projekt: `stream-control-center` / `remote-modboard` / RDAP

## Zweck

Diese Datei beschreibt den aktuellen Zielaufbau der Remote-Modboard-Webseite. Sie soll verhindern, dass die UI weiter aus kleinen Einzelpatches, doppelten Toolbars oder uneindeutigem Router-State zusammenwaechst.

## Grundprinzipien

```text
- Eine sichtbare Seite = ein passender Haupt-Header = ein passender aktiver Nav-Eintrag.
- Kein CSS als Tarnung fuer falschen State.
- Keine parallele Zweitnavigation.
- Bestehenden Haupt-Router erweitern statt neue Router nebenbei bauen.
- Normale Ansichten bleiben menschlich lesbar.
- Technische Diagnosewerte gehoeren nicht prominent in Hauptansichten.
```

## Visuelle Richtung

Das Remote-Modboard folgt dem ForrestCGN-/CGN-Look:

```text
- dunkler Hintergrund
- Neon-Violett, Blau und Cyan
- Glow, Glas-/Card-Look, runde Rahmen
- klare Status-Chips
- kompakte Admin-Karten
- keine rohe technische Tabellenoptik als Hauptansicht
```

Die Webseite soll fuer Moderatoren und ausgewaehlte Helfer bedienbar sein, nicht nur fuer Entwickler.

## Aktueller Seitenrahmen

Die Seite besteht grob aus:

```text
- Login-/Denied-Szene
- Dashboard-Szene
- Topbar mit Breadcrumb/Header
- linke Navigation
- Content-Bereich mit Panels
- Status-Chips oben
- Account-/Self-Profile-Panel
```

Der Haupt-Header in der Topbar ist zentral. Er darf nicht auf einer alten Seite stehen bleiben, wenn ein anderes Panel sichtbar ist.

## Navigation

Die linke Navigation ist die fuehrende Benutzerfuehrung. Admin-Notes und User-Detail gehoeren in den Admin-Bereich.

Aktuelle relevante Admin-Seiten:

```text
Admin -> Admin-Notizen
Admin -> User-Detail
```

Regeln:

```text
- Klick auf Admin-Notizen setzt Header und aktive Navigation auf Admin-Notizen.
- Klick auf User-Detail setzt Header und aktive Navigation auf User-Detail.
- Wenn Admin-Notizen sichtbar sind, darf User-Detail nicht aktiv wirken.
- Wenn User-Detail sichtbar ist, darf Admin-Notizen nicht aktiv wirken.
```

## Router-/Page-State-Vertrag

Der bestehende Haupt-Router in `remote-modboard.js` ist die bevorzugte Wahrheit fuer:

```text
- currentPage
- pageTitle
- sectionLabel
- tab-part
- aktive Navigation
- sichtbares Panel
- Page-Change-Event
```

Erweiternde Module duerfen nicht dauerhaft einen eigenen konkurrierenden Router-State pflegen.

Wenn ein Zusatzmodul wie Admin-Notes eine Seite injiziert, muss es den Haupt-Router verwenden oder sauber daran andocken.

## Admin-Notizen Zielaufbau

### 1. Seitenheader

```text
Titel: Admin-Notizen
Rechts: Notizen neu laden | Neue Notiz
```

Regeln:

```text
- Header gehoert zur sichtbaren Seite.
- Header darf nicht User-Detail zeigen, wenn Admin-Notizen sichtbar sind.
- Header-Aktionen stehen oben, nicht doppelt in einer zweiten Toolbar.
```

### 2. Zieluser-Auswahl

```text
Zieluser
Admin-Notizen fuer ausgewaehlten User
```

Regeln:

```text
- Zieluser setzt den Kontext fuer alles darunter.
- Auswahl und Suche bleiben sichtbar, aber kompakt.
- Beim Wechsel darf kein alter Count/alte Liste unklar stehen bleiben.
```

### 3. Notizen-Liste

Zielbild:

```text
Notizen fuer ForrestCGN
4 Notizen geladen
```

Bei anderem User:

```text
Notizen fuer EngelCGN
0 Notizen geladen
```

Regeln:

```text
- Count bezieht sich immer auf den aktuell ausgewaehlten User.
- Notizkarten zeigen menschliches Datum/Uhrzeit.
- Technische noteUid ist nicht Hauptueberschrift.
- Technische IDs spaeter nur in Details/Diagnose.
```

### 4. Create

```text
Neue Notiz
```

Regeln:

```text
- Create ist nur nach Klick auf Neue Notiz sichtbar.
- Create bleibt nur bei Schreibrecht sichtbar.
- confirmWrite:true bleibt unveraendert.
- Backend entscheidet ueber Session, Permission, Audit, Lock und Readback.
```

### 5. Update

Regeln:

```text
- Update/Speichern bleibt aktiv, wenn Backend und Permission es erlauben.
- Kein Delete/Deactivate in der UI.
- Keine neuen Schreibbuttons nebenbei.
```

### 6. Diagnose/Technik

Regeln:

```text
- Diagnosewerte wie canRead, canWrite, Schema, confirmWrite-Hinweise, Admin-only, Read/Create/Update sind nicht Teil der normalen Hauptansicht.
- Spaeter moeglich: einklappbarer Bereich "Diagnose anzeigen".
- Keine prominente Technik zwischen Header und Liste.
```

## User-Detail Zielaufbau

User-Detail ist read-only und dient als Admin-Blick auf einen User.

Aktuelle Inhalte:

```text
- User-Auswahl / Suche
- DisplayName / Login / UserUid / Status
- Rollen-Lesestand
- Gruppen-Lesestand
- Session-Lesestand
- Uebergang zu Admin-Notizen fuer diesen User
```

Regeln:

```text
- Kein Rollen-Write.
- Kein Gruppen-Write.
- Keine Session-Revocation UI.
- Uebergang zu Admin-Notizen muss den Zieluser sauber uebernehmen.
```

## Was aktuell nicht weiter gemacht werden soll

```text
- keine weiteren wilden CSS-Patches vor State-Fixes
- keine neue parallele Navigation
- keine technische Diagnose prominent in Normalansichten
- keine optische Tarnung fuer falschen Header-/Router-State
- keine neuen Write-Buttons
```

## Naechste UI-relevante Steps

```text
RDAP76_ADMIN_NOTES_ROUTER_HEADER_STATE_FIX
- Haupt-Header, Navigation und sichtbares Panel synchronisieren.

RDAP77_ADMIN_NOTES_SELECTED_USER_RELOAD_AND_COUNT_FIX
- Zieluser-/Count-/Reload-Kontext sauber machen.

Danach:
- Admin-Notes weiter polieren, aber erst auf sauberem State-Fundament.
```
