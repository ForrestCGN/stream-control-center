# Dashboard v2 Design- und Frontend-Plan

Stand: 2026-06-22  
Status: bestätigte Designrichtung aus den isolierten Design-Tests v8 bis v13

## Zweck dieser Datei

Diese Datei hält die aktuell bestätigte Richtung für Dashboard-v2 fest, damit spätere Chats und Umsetzungen nicht wieder bei null anfangen.

Wichtig: Dieser Stand ist **Design-/Frontend-Planung**, keine Runtime-Umsetzung.

Nicht geändert durch diesen Plan:

- kein Backend-Code
- kein bestehendes Dashboard
- keine produktive DB
- keine Config
- keine OBS-Quelle
- kein Remote-Agent-Code

## Bestätigte Designbasis

Als aktuelle Designrichtung gilt der Stand aus:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

Dieser Teststand ist nur ein Mockup/Prototyp, aber die dort gezeigten Regeln gelten als Designbasis.

## Grundoptik

Das Dashboard-v2 soll einen eigenen CGN-Dark-/Neon-/Galaxy-Stil bekommen.

Festgelegt:

- dunkler blau/lila Grund
- ruhiger Vision-UI-artiger Galaxy-/Nebula-Hintergrund
- dezente Dot-/Star-Struktur
- keine unruhigen oder zu hellen Hintergründe hinter Text
- Glassmorphism-Karten mit abgerundeten Ecken
- Neon-Lila/Cyan/Blau als Akzentfarben
- hoher Kontrast und gute Lesbarkeit
- keine direkte Kopie von Creative-Tim/Vision-UI-Code oder Templates

Creative Tim / Vision UI dient nur als Inspiration für:

- Dashboard-Komponenten
- Kartenaufbau
- Tabellenstil
- Timeline/Progress/Chips
- Glass-/Dark-Look
- grobe UI-Patterns

Nicht übernommen werden:

- fertiger Creative-Tim-Code
- deren React-/MUI-/Chakra-Struktur
- Business-Inhalte wie Sales/Orders
- Template-/Lizenzstruktur

## Topbar

Die Topbar ist dauerhaft oben fixiert.

Regeln:

- links: Menübutton + Standortanzeige
- rechts: Sprache, Benachrichtigungen, Avatar, Name, Rolle
- Suche in der Topbar
- kein CGN-/ForrestCGN-Brandingblock links oben
- am Seitenanfang eher dezenter Rand
- nach Scroll leicht stärkerer weißlich/glassiger Rand mit Schatten

Die Standortanzeige zeigt:

```text
Hauptbereich
Modul • aktiver Tab
```

Beispiele:

```text
Live
Remote Agent • Übersicht
```

```text
Aktionen
Shot-Alarm • Statistik
```

```text
Admin
Benutzer & Rechte • Rollen
```

Der aktive Tab steht **in derselben Zeile direkt hinter dem Modulnamen**, getrennt mit `•`, nicht darunter.

## Navigation

Die linke Sidebar ist die Hauptnavigation.

Feste Regel:

```text
Sidebar = Hauptkategorie → Modul
Modul-Navi = Unterbereiche innerhalb der Seite
Admin = Technik, Tiefe, Diagnose, gefährliche Aktionen
```

Keine dritte Ebene in der Sidebar.

Gut:

```text
Community / Events
  Stream-Events
  Shot-Alarm
```

Dann innerhalb von `Stream-Events`:

```text
Übersicht | Events | Teilnehmer | Runden | Finale | Logs
```

Nicht gut:

```text
Community / Events
  Stream-Events
    Übersicht
    Teilnehmer
    Runden
    Finale
    Logs
```

## Sidebar-Verhalten

Festgelegt:

- Accordion-Verhalten wie Material-Admin-Pro-artige Navigation
- immer nur ein Hauptbereich offen
- keine Einstellung dafür nötig
- Sidebar Desktop/HD links sichtbar
- Sidebar per Menübutton einklappbar
- unter ca. 1180px als Drawer
- Sidebar ist auf Desktop fixed, nicht sticky
- beim Scrollen bewegt sich die Navigation nicht leicht mit

## Modul-Navi / Tabs

Innerhalb einer Modulseite gibt es direkt unter dem PageHeader eine Modul-Navi.

Beispiele:

Shot-Alarm:

```text
Übersicht | Verlauf | Statistik | Texte | Einstellungen
```

Stream-Events:

```text
Übersicht | Events | Teilnehmer | Runden | Finale | Logs
```

Media:

```text
Bibliothek | Sounds | Videos | Bilder | Uploads | Zuordnungen
```

Loyalty:

```text
Übersicht | Transaktionen | Ranking | Giveaways | Glücksrad | Texte
```

Admin:

```text
Übersicht | Benutzer | Rollen | Texte | Configs | Diagnose | Audit
```

Beim Klick auf einen Tab muss die Topbar den aktiven Tab aktualisieren.

## Einheitlicher Seitenaufbau

Normale Streamer-/Mod-Seiten sollen fast alle gleich aufgebaut sein.

Standardmuster:

1. PageHeader
   - Modulname
   - kurze, verständliche Erklärung
   - keine langen technischen Texte

2. Modul-Navi / Tabs
   - Unterbereiche des aktuellen Moduls

3. Status-/KPI-Zeile
   - wichtigste Zahlen
   - Aktiv/Inaktiv
   - Warnungen
   - letzte relevante Aktion

4. Hauptkarte
   - wichtigste Aktionen
   - klare Bedienung
   - keine Technikbegriffe

5. Verlauf / letzte Ereignisse
   - Timeline oder Tabelle

6. Optional einfache Optionen
   - nur wenn sie für Streamer/Mods im Alltag sinnvoll sind

## Normale Seiten vs Admin

Normale Modul-Seiten sind für Streamer/Mods gedacht.

Dort gehören hin:

- Status
- einfache Aktionen
- wichtige Zahlen
- Verlauf
- einfache Texte/Optionen
- verständliche Hinweise

Dort gehören nicht hin:

- API-Routen
- JSON-Rohdaten
- Debug-Flags
- Datenbankdetails
- Token/Secrets
- technische Payloads
- gefährliche Aktionen
- tiefe Configs

Diese Dinge gehören in Admin.

Admin enthält:

- Userverwaltung
- Rollen/Rechte
- Locks
- Audit-Log
- Diagnose/Testbereich
- technische Configs
- Textvarianten-Editor
- Secrets/Tokens nur geschützt und nie im Klartext anzeigen
- Import/Export/Backup später separat planen

## Erweiterbarkeit / Umstrukturierbarkeit

Dashboard-v2 muss einfach erweiterbar und später umstrukturierbar bleiben.

Feste Architekturregel:

```text
Navigation, Module, Rechte, Texte, Configs und Seitenstruktur dürfen nicht hart überall verteilt sein.
```

Ziel:

- neues Modul einfach hinzufügen
- Modul in andere Hauptkategorie verschieben
- Modul deaktivieren/ausblenden
- Rechte pro Modul/Seite/Aktion setzen
- Tabs pro Modul definieren
- Texte/Configs zentral verwalten
- Module getrennt entwickeln
- Module später ersetzen, ohne die ganze App umzubauen

## Frontend-Technik: bevorzugte Richtung

Aufgrund der Projektgröße ist die bevorzugte Richtung:

```text
React + Vite
```

Aber:

- kein Creative-Tim-Template kopieren
- keine direkte Vision-UI-Codebasis übernehmen
- keine MUI-/Chakra-Abhängigkeit erzwingen
- eigenes CGN-Designsystem bauen
- API/WebSocket/Auth/Locks getrennt von UI halten

Warum React/Vite sinnvoll ist:

- Projekt ist groß genug
- viele Module
- viele Zustände
- Live-Status/WebSocket
- Locks/Multi-User
- Tabellen/Filter/Pagination
- Modals/Toasts
- Rollen/Rechte
- wiederverwendbare Komponenten
- spätere Umstrukturierung einfacher

## Vorgeschlagene Frontend-Struktur

Zielstruktur für spätere Umsetzung:

```text
frontend/dashboard-v2/
  src/
    app/
      App.jsx
      router.jsx
      moduleRegistry.js
      navigationRegistry.js

    layout/
      AppShell.jsx
      Topbar.jsx
      Sidebar.jsx
      PageHeader.jsx
      ModuleTabs.jsx

    components/
      CgnCard.jsx
      CgnButton.jsx
      CgnChip.jsx
      CgnTable.jsx
      CgnPagination.jsx
      CgnTimeline.jsx
      CgnTransactionList.jsx
      CgnSwitch.jsx
      CgnModal.jsx
      CgnToast.jsx
      CgnAvatar.jsx
      CgnProgress.jsx

    modules/
      overview/
      agent/
      media/
      overlays/
      loyalty/
      events/
      shotAlarm/
      admin/

    services/
      apiClient.js
      wsClient.js
      authClient.js
      permissionClient.js
      lockClient.js

    styles/
      tokens.css
      theme.css
      layout.css
      components.css
```

Build-Ziel später:

```text
htdocs/dashboard-v2/
```

Der genaue Build-/Deploy-Workflow muss separat geplant werden.

## Moduldefinitionen / Registry-Idee

Module sollen sich später über Definitionen registrieren.

Beispiel-Idee:

```js
export default {
  id: "shot_alarm",
  label: "Shot-Alarm",
  category: "actions",
  icon: "shot",
  route: "/actions/shot-alarm",
  permission: "shot_alarm.view",
  tabs: [
    { id: "overview", label: "Übersicht", permission: "shot_alarm.view" },
    { id: "history", label: "Verlauf", permission: "shot_alarm.view" },
    { id: "stats", label: "Statistik", permission: "shot_alarm.view" },
    { id: "texts", label: "Texte", permission: "shot_alarm.texts" },
    { id: "settings", label: "Einstellungen", permission: "shot_alarm.config" }
  ]
};
```

Wenn ein Modul später in eine andere Hauptkategorie soll, darf nicht die halbe Sidebar umgebaut werden müssen.

## Wichtige Komponentenideen

Das eigene CGN-Designsystem soll mindestens diese Bausteine bekommen:

- `CgnCard`
- `CgnStatCard`
- `CgnChartCard`
- `CgnButton`
- `CgnChip`
- `CgnTable`
- `CgnPagination`
- `CgnTimeline`
- `CgnTransactionList`
- `CgnSwitch`
- `CgnModal`
- `CgnToast`
- `CgnAvatar`
- `CgnProgress`
- `CgnModuleTabs`
- `CgnPageHeader`

## Design-Teststände aus dem Chat

Die im Chat erzeugten ZIPs waren isolierte Design-Tests und gehören nicht automatisch ins Repo.

Wichtigster bestätigter Stand:

- `DASHBOARD_V2_DESIGN_TEST_V13_TOPBAR_TAB_INLINE.zip`

Davor relevante Schritte:

- v8: mehrere Beispielseiten/Komponenten
- v9: Vision-UI-artiger Hintergrund, kompaktere HD-Karten, Topbar-Scroll-Rand
- v10: fixed Sidebar, stärkerer Scroll-Rand
- v11: Beispiele für Sidebar→Modul plus Modul-Navi/Tabs
- v12: Topbar zeigt Modul + aktiven Tab
- v13: aktiver Tab inline hinter Modulnamen mit Punkt

## Weiteres Vorgehen

Trotz bestätigter Designrichtung bleibt die Priorität:

1. sichere Webserver↔Stream-PC-Agent-Architektur
2. Rollen/Rechte/Locks
3. React/Vite-Frontend-Entscheidung sauber dokumentieren
4. kleiner technischer Dashboard-v2-Prototyp
5. erst danach echte Modulmigration

Keine produktive Dashboard-v2-Umsetzung ohne separaten Step und `go`.
