# CAN-44.14 – Shoutout-System Dashboard-Struktur & Bestandsaufnahme

Stand: 2026-06-04
Typ: Planung / Bestandsaufnahme
Code-Änderung: nein

## Ziel

Das bisher gewachsene Shoutout-/AutoShoutout-System soll als ein gemeinsames **Shoutout-System** betrachtet und im Dashboard übersichtlicher organisiert werden.

Die bisherigen Teilbereiche bleiben technisch erhalten:

- Chat-Shoutout per `!so` / Alias `!vso`, `!clipso`, `!videoso`
- AutoShoutout über Chat-Aktivität konfigurierter Streamer
- DisplayQueue für Video-/Clip-Shoutouts
- OfficialQueue für Twitch Send Shoutout
- Eingehende/ausgehende EventSub-Shoutout-Ereignisse
- Gemeinsame Statistik, Timeline und Statusdaten

## Begriffsfestlegung

### Chat-Shoutout

Bezeichnet die direkte Auslösung eines Shoutouts durch Chat-Command oder Dashboard-Eingabe.

Beispiele:

```text
!so @kanal
!vso @kanal
Dashboard: Zielkanal eintragen und Shoutout auslösen
```

Der Begriff ersetzt vorerst Formulierungen wie „Manuelle Shoutouts“.

### AutoShoutout

Automatische Auslösung anhand von Chat-Aktivität konfigurierter Streamer.

Aktueller Stand:

- konfigurierbare Streamer-Liste
- Mindestnachrichten pro Zeitfenster
- Standard: 3 Nachrichten innerhalb 30 Minuten
- Auto-Begrüßung über Textvarianten
- Startszene-Gate
- optionaler Live-Gate-Schalter, aktuell für Tests deaktiviert

### Offizieller Shoutout

Twitch-eigener offizieller Shoutout über `moderator:manage:shoutouts`, der nach dem Display-/Video-Shoutout eingereiht werden kann.

## Aktuelle technische Basis

### Backend

```text
backend/modules/clip_shoutout.js
```

Aktuelle Systemrolle:

- Chat-Shoutout-Verarbeitung
- Clip-Auswahl
- DisplayQueue
- OfficialQueue
- AutoShoutout
- Inbound/Outbound EventSub-Shoutout-Events
- Statistik und Timeline
- gemeinsame API unter `/api/clip-shoutout`

### Dashboard

```text
htdocs/dashboard/modules/shoutout.js
htdocs/dashboard/modules/shoutout.css
htdocs/dashboard/modules/auto_shoutout.js
htdocs/dashboard/modules/auto_shoutout.css
```

Aktuell ist `auto_shoutout.js` als zusätzlicher Tab in das bestehende Shoutout-Dashboard eingehängt.

### Config

```text
config/clip_system.json
```

Wichtige Bereiche:

```text
clipShoutout
clipShoutout.displayQueue
clipShoutout.officialShoutout
clipShoutout.streamDayLimit
clipShoutout.streamStatus
clipShoutout.inboundShoutout
clipShoutout.autoShoutout
```

### Datenbank

Aktuell relevante Tabellen:

```text
clip_shoutout_display_queue
clip_shoutout_official_queue
clip_shoutout_official_history
clip_shoutout_inbound_events
clip_shoutout_auto_settings
clip_shoutout_auto_streamers
clip_shoutout_auto_events
clip_shoutout_auto_message_activity
command_definitions
module_text_variants
```

Diese Tabellen bleiben bestehen. Keine bestehende Tabelle wird ersetzt oder gelöscht.

## Aktuelle Dashboard-Probleme

Das Dashboard ist funktional, aber inzwischen technisch gewachsen:

```text
Übersicht
Eingehend
Queues
Statistik
Timeline
Produktion
Live-Test
Settings/Test
Auto-Shoutouts als Zusatz-Tab
```

Probleme:

- AutoShoutout wirkt wie ein separates System, obwohl es fachlich zum Shoutout-System gehört.
- Produktion/Live-Test sind eher Diagnosebereiche, stehen aber als Haupttabs sehr prominent.
- Settings/Test vermischt Bedienung, Tests und technische Einstellungen.
- Texte sind noch verteilt und nicht als eigener Shoutout-Textbereich sichtbar.
- Chat-Shoutout-Auslösung sollte klarer und alltagstauglicher benannt werden.

## Vorgeschlagene neue Dashboard-Struktur

### 1. Übersicht

Ziel: schneller Tagesstatus.

Inhalte:

```text
- Systemstatus
- aktive DisplayQueue
- aktive OfficialQueue
- letzter Shoutout
- AutoShoutout Kurzstatus
- LiveGate Kurzstatus
- SceneGate Kurzstatus
- Hinweis auf offene Probleme
```

### 2. Chat-Shoutout

Ziel: direkte Auslösung per Dashboard und Übersicht zur Chat-Command-Nutzung.

Inhalte:

```text
- Zielkanal eingeben
- Force-Option
- Shoutout auslösen
- ggf. Clip-Vorschau / Clip-Test
- Hinweis auf Chat-Befehle: !so, !vso, !clipso, !videoso
- letzte Chat-Shoutouts
```

### 3. AutoShoutout

Ziel: Automatik verwalten.

Inhalte:

```text
- Aktivieren/Deaktivieren
- Streamer-Liste
- Mindestnachrichten
- Zeitfenster
- Cooldowns
- LiveGate-Schalter
- Startszene-Gate
- Dry-Run-Test
- clear-target / gezielter Reset
- aktuelle Message-Activity
```

### 4. Queues

Ziel: laufende und wartende Einträge sehen und steuern.

Inhalte:

```text
- DisplayQueue
- OfficialQueue
- Retry
- Remove
- aktive Wartezeiten
- Cooldown-Anzeige
- Queue-Fehler
```

### 5. Texte

Ziel: gemeinsamer Textvarianten-Editor für alle Shoutout-Texte.

Inhalte:

```text
- Chat-Shoutout-Texte
- AutoShoutout-Texte
- Official-Shoutout-Texte
- Kategorien
- mehrere Varianten pro Text-Key
- aktiv/deaktiviert
- Gewichtung später optional
```

Erste Ziel-Key-Struktur:

```text
shoutout.chat.accepted
shoutout.chat.waiting
shoutout.chat.duplicate
shoutout.chat.failed

shoutout.auto.greeting
shoutout.auto.queued
shoutout.auto.alreadyQueued
shoutout.auto.waitingStartScene
shoutout.auto.cooldown
shoutout.auto.disabled

shoutout.official.queued
shoutout.official.sent
shoutout.official.duplicate
shoutout.official.cooldown
shoutout.official.failed
```

Bestehende Keys wie `auto.greeting` bleiben zunächst als Fallback erhalten und werden nicht hart entfernt.

### 6. Verlauf

Ziel: nachvollziehbare Historie.

Inhalte:

```text
- Timeline
- heutige Shoutouts
- Filter pro User
- Quelle sichtbar: Chat / Auto / Dashboard / Official
- Status sichtbar: queued / waiting / done / removed / failed
```

### 7. Statistik

Ziel: Auswertung.

Inhalte:

```text
- häufigste Ziele
- häufigste Auslöser
- Paar-Statistik
- Streamtag-Auswertung
- AutoShoutout-Anteil später ergänzen
```

### 8. Eingehend

Ziel: offizielle Twitch-Shoutout-Events beobachten.

Inhalte:

```text
- eingehende offizielle Shoutouts
- ausgehende offizielle Shoutouts
- EventSub-Daten
- letzte Events
```

### 9. Diagnose

Ziel: technische Prüfung, nicht Alltag.

Inhalte:

```text
- Production-Check
- Live-Test
- Twitch Token/Scopes
- EventSub-Status
- LiveGate-Diagnose
- SceneGate-Diagnose
- Modulversion
- letzte Fehler
```

### 10. Einstellungen

Ziel: technische Grundkonfiguration.

Inhalte:

```text
- Clip-Suche
- Clip-Auswahl
- Cooldowns
- Streamtag-Limit
- Official-Shoutout-Verhalten
- Sound-/Overlay-Anbindung
- EventBus-Schalter
```

## Umsetzungsvorschlag in kleinen Schritten

### CAN-44.15 – Gemeinsamer Texte-Tab

- neuen Tab `Texte` im Shoutout-Dashboard anlegen
- vorhandenen AutoShoutout-Texteditor aus AutoShoutout herauslösen
- Textbereiche/Kategorien vorbereiten
- zunächst nur `auto.greeting` sicher bedienen
- keine Migration erzwingen

### CAN-44.16 – Dashboard-Tabs neu ordnen

- Tab-Reihenfolge ändern
- `Settings/Test` auflösen
- `Produktion` und `Live-Test` unter `Diagnose` zusammenführen
- `Chat-Shoutout` als klaren Alltagstab einführen

### CAN-44.17 – Text-Key-Migration vorbereiten

- neue Textkeys seedbar machen
- alte Config-Texte als Fallback behalten
- keine bestehenden Texte verlieren
- Dashboardfähig machen

### CAN-44.18 – Verlauf/Quelle verbessern

- Timeline besser nach Quelle markieren
- Chat / Auto / Dashboard / Official sichtbar machen
- Filter ergänzen

## Risiken / Regeln

- Keine Funktionalität entfernen.
- DB nur sanft erweitern.
- `module_text_variants` weiterverwenden.
- Bestehende `clip_shoutout_*` Tabellen nicht ersetzen.
- Erst Doku/Planung, dann kleine Umsetzungssteps.
- Vor Codeänderungen echte Dateien erneut prüfen.

## Aktueller Entscheidungsstand

Festgelegt:

```text
- gemeinsames System: Shoutout-System
- Begriff: Chat-Shoutout statt Manuelle Shoutouts
- eigener gemeinsamer Tab: Texte
- Dashboard soll übersichtlicher und alltagstauglicher werden
```

Nächster technischer Schritt:

```text
CAN-44.15 – Gemeinsamer Texte-Tab vorbereiten
```
