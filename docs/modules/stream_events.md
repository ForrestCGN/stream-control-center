# Modul-Doku: stream_events

Stand: EVS-7c / Event Overview + Editor Modal Flow Cleanup  
Datum: 2026-06-13

## Zweck

`stream_events` ist die neue Backend-/Dashboard-Basis für Stream-Events mit Sound- und/oder Text-Spielen, gemeinsamer Punktewertung, Ranking und späterer Overlay-/Chat-/Playback-Anbindung.

## Backend-Stand aus EVS-2

Backend-Modul:

```text
backend/modules/stream_events.js
```

Routen:

```text
GET  /api/stream-events/status
GET  /api/stream-events/routes
GET  /api/stream-events/texts
GET  /api/stream-events/events
POST /api/stream-events/events
GET  /api/stream-events/events/:eventUid
PUT  /api/stream-events/events/:eventUid
POST /api/stream-events/events/:eventUid/validate
POST /api/stream-events/events/:eventUid/start
POST /api/stream-events/events/:eventUid/finish
POST /api/stream-events/events/:eventUid/cancel
GET  /api/stream-events/events/:eventUid/ranking
POST /api/stream-events/events/:eventUid/points
```

## Dashboard-Stand EVS-3 bis EVS-5b

Dashboard-Dateien:

```text
htdocs/dashboard/modules/stream_events.js
htdocs/dashboard/modules/stream_events.css
```

EVS-3 brachte:

- Community-Modul `stream_events`
- Eventliste
- Event erstellen/bearbeiten
- Sound/Text auswählen
- Validierungsstatus
- Start/Beenden/Abbrechen vorbereitet
- Ranking-Anzeige

EVS-4 brachte:

- Sound-Schnipsel-Auswahl über vorhandenes `MediaField`/`MediaPicker`
- Upload über vorhandenes Media-System
- optionales Auflösungs-Video über vorhandenes Media-System
- keine neue Upload- oder Player-Struktur

EVS-4b brachte:

- Sound-Konfiguration im Modal klarer aufgeteilt
- Audio-Schnipsel als Pflicht-Karte
- Auflösungs-Video als optionale Karte
- Desktop nebeneinander, kleinere Auflösung untereinander
- kompaktere MediaField-Buttons

EVS-5 wurde als Zwischenstand getestet, wirkte aber zu kastenlastig. EVS-5b korrigiert die Text-Spiel-Regel und das Layout.

## Text-Spiel-Konvention aus EVS-5b

Text-Spiel V1:

```text
Geheimsatz / Lösungssatz: Pflicht
Erlaubte Antworten / Varianten: Optional
Punkte für den ersten richtigen Löser: Pflicht/Default
Teiltreffer-Hinweise: Optional
```

Fachregel:

```text
- Der erste User, der den kompletten Satz oder eine erlaubte Variante richtig schreibt, bekommt die Punkte.
- Danach ist dieser Satz im aktuellen Event erledigt und wird aus der Rotation entfernt.
- Es gibt in V1 keine weiteren Löser und kein Zeitfenster für weitere Löser.
- Teiltreffer geben keine Punkte.
- Teiltreffer-Hinweise werden aus den Wörtern des Geheimsatzes berechnet, kein separates Hinweiswort-Feld in V1.
- Pro Event, Satz und User wird später gespeichert, welche Wörter bereits erkannt wurden.
- Ein bereits erkanntes Wort wird für denselben User und Satz nicht erneut gemeldet/gezählt.
- Optional kann ein zusätzlicher Cooldown gesetzt werden.
```

Config-Snapshot aus EVS-5b:

```text
textConfig.winnerMode = first_complete_solver
textConfig.solvedPolicy = remove_from_rotation
textConfig.allowFollowupSolves = false
textConfig.hintTokensEnabled / partialHintsEnabled
textConfig.partialHintMode = new_words_per_user | improved_count
textConfig.uniqueWordsPerUser = true
textConfig.partialHintCooldownSeconds
```

Die konkrete Chat-Auswertung wird erst später gebaut.

## Media-System-Konvention

Für Event-Medien werden vorhandene Media-Komponenten genutzt:

```text
moduleKey: stream_events
categoryKey für Sound-Schnipsel: sound_snippets
categoryKey für Auflösungs-Videos: reveal_videos
```

Erlaubte Typen:

```text
Sound-Schnipsel: audio
Auflösungs-Video: video, animation
```

Das Event speichert im Config-Snapshot nur die Media-ID/Referenz.

## Noch nicht umgesetzt

```text
Chat-Auswertung
Sound-Rundensteuerung
Text-Rundensteuerung
Mehrere Schnipsel/Sätze je Event
Overlay
Playback-Anbindung
Statistik-Auswertung
```


## EVS-5c Dokumentations-/Backend-TODO-Festlegung

Dieser Stand ist eine reine Doku-/TODO-Konsolidierung nach EVS-5b. Es wurden keine Runtime-Dateien verändert.

Wichtig: Die im Dashboard sichtbaren Text-Spiel-Regeln sind nicht nur UI-Notizen. Sie müssen in späteren Backend-/Runtime-Schritten fachlich umgesetzt werden.

### Verbindliche Text-Spiel-Regel für Backend/Runtime

```text
- Pro aktivem Event kann ein Text-Spiel aktiv sein.
- Ein Text-Spiel besteht später aus mehreren Geheimsätzen / Lösungssätzen.
- Pro Satz gewinnt genau der erste User, der den kompletten Satz oder eine erlaubte Antwortvariante korrekt schreibt.
- Dieser User bekommt die konfigurierten Punkte.
- Nach korrekter Lösung wird der Satz im aktuellen Event als gelöst markiert und aus der Rotation entfernt.
- Es gibt in V1 keine weiteren Löser und kein Zeitfenster für weitere Löser.
- Teiltreffer geben keine Punkte.
```

### Teiltreffer-Hinweise

```text
- Teiltreffer-Hinweise können pro Text-Spiel/Event aktiviert oder deaktiviert werden.
- Die Teiltreffer-Wörter werden automatisch aus dem Geheimsatz berechnet.
- Es gibt in V1 kein separates Hinweiswörter-/Suchwörter-Feld.
- Wenn ein User neue Wörter aus dem Geheimsatz schreibt, kann eine Chatmeldung ausgegeben werden.
- Pro Event, Satz, User und Wort wird gespeichert, ob dieses Wort bereits erkannt/gemeldet wurde.
- Ein bereits erkanntes Wort darf für denselben User und Satz nicht erneut gemeldet oder gezählt werden.
- Optional kann zusätzlich ein Cooldown genutzt werden.
- Standardempfehlung: neue Wörter pro User nur einmal melden, Cooldown 0-10 Sekunden.
```

### Backend-/DB-TODO für spätere Schritte

Spätere Runtime-Schritte müssen diese Regeln im Backend abbilden. Dafür sind voraussichtlich notwendig:

```text
stream_event_text_items / stream_event_phrase_items
- event_uid
- phrase_uid
- solution_text
- answer_variants_json
- points_first_solver
- status: open | solved | removed | skipped
- solved_by_login / solved_by_display_name
- solved_at
- metadata_json

stream_event_text_partial_hits
- event_uid
- phrase_uid
- user_login
- user_display_name
- token
- first_seen_at
- last_seen_at
- hit_count
- UNIQUE(event_uid, phrase_uid, user_login, token)
```

Tabellennamen sind noch Planungsnamen. Umsetzung später nur nach Prüfung des echten Backend-Stands und nur sanft per Migration.

### Dashboard-/Config-TODO

```text
- Allgemeine Event-Config als Dashboard-Bereich ergänzen.
- Text-Config / Multi-Texte als Dashboard-Bereich ergänzen.
- Chatmeldungen für Teiltreffer, Lösung, keine aktive Runde, Eventstart/-ende über helper_texts / module_text_variants pflegen.
- Keine parallele Textstruktur bauen.
- Config und Textvarianten sollen streamer-/modfreundlich bearbeitbar sein.
```


---

## EVS-5d Ergänzung: Mehrere Sätze, Teiltreffer-Modus und Wortpunkte

EVS-5d ist eine reine Doku-/TODO-Konsolidierung der nach EVS-5c getroffenen Fachentscheidungen. Es wurden keine Code-, DB- oder Runtime-Dateien verändert.

### Text-Spiel: Satz-Pool statt Einzelsatz

Das Text-Spiel darf nicht als einzelner Geheimsatz gedacht werden. Ein Text-Spiel besteht künftig aus einem konfigurierbaren Pool mehrerer geheimer Sätze.

Fachregel:

```text
- Pro Event kann ein Text-Spiel mehrere geheime Sätze enthalten.
- Die Anzahl der Sätze muss im Dashboard konfigurierbar sein.
- Jeder Satz ist einzeln lösbar.
- Der erste User, der einen Satz vollständig oder über eine erlaubte Variante löst, bekommt die Lösungspunkte dieses Satzes.
- Danach wird nur dieser Satz als gelöst markiert und aus der aktuellen Rotation entfernt.
- Andere Sätze bleiben offen und können weiter gelöst werden.
```

### Teiltreffer-Hinweise: allgemein oder mit Satzbezug

Wenn ein User ein Wort aus einem geheimen Satz trifft, soll die Chatmeldung konfigurierbar sein.

Geplante Modi:

```text
partialHintDisplayMode = off
partialHintDisplayMode = generic
partialHintDisplayMode = with_phrase_number
```

Bedeutung:

```text
off:
- Es gibt keine Teiltreffer-Meldungen.

generic:
- Der User bekommt nur allgemein die Info, dass er ein Wort aus einem geheimen Satz gefunden hat.
- Beispiel: "{user} hat ein Wort aus einem geheimen Satz gefunden."

with_phrase_number:
- Der User bekommt die Info, zu welchem Satz der Treffer gehört.
- Beispiel: "{user} hat ein Wort aus Satz 2 gefunden."
```

Optional soll zusätzlich die Anzahl der gefundenen Wörter angezeigt werden können:

```text
showPartialHitCount = true | false
```

Beispiele:

```text
- "{user} hat 3 Wörter aus einem geheimen Satz gefunden."
- "{user} hat 3 Wörter aus Satz 2 gefunden."
```

### Teiltreffer-Speicherung

Teiltreffer müssen pro Event, Satz, User und Wort eindeutig gespeichert werden.

Fachregel:

```text
- Ein Wort zählt pro User und Satz nur einmal.
- Wiederholt derselbe User dasselbe Wort beim selben Satz, wird es nicht erneut gemeldet.
- Wiederholt derselbe User dasselbe Wort beim selben Satz, bekommt er dafür keine weiteren Wortpunkte.
- Trifft derselbe User später neue Wörter aus demselben Satz, können diese neu gemeldet/gezählt werden.
```

### Wortpunkte: optional konfigurierbar

Zusätzlich zu den Lösungspunkten können gefundene Wörter optional Punkte geben. Das soll im Dashboard konfigurierbar sein.

Fachregel:

```text
- Wortpunkte sind optional.
- Teiltreffer können gemeldet werden, ohne Punkte zu geben.
- Wenn Wortpunkte aktiv sind, bekommt ein User Punkte für neu gefundene Wörter.
- Jedes Wort zählt pro Event/Satz/User nur einmal.
- Optional kann ein Punkte-Limit pro User und Satz gesetzt werden.
- Die komplette Lösung gibt weiterhin separate Lösungspunkte.
```

Geplante Config-Felder:

```text
wordPointsEnabled = true | false
pointsPerNewWord = number
maxWordPointsPerUserPerPhrase = number | null
solutionPointsMode = add_on_top | solution_only
```

Empfohlener Default:

```text
wordPointsEnabled = false oder true nach Event-Typ
pointsPerNewWord = 1
maxWordPointsPerUserPerPhrase = 5
solutionPointsMode = add_on_top
```

### Dashboard-/Config-Konsequenzen

Das Dashboard braucht später nicht nur ein einzelnes Textfeld, sondern eine Satzverwaltung.

Geplante Bedienung:

```text
Text-Spiel konfigurieren
- mehrere geheime Sätze hinzufügen/bearbeiten/löschen
- Satz aktiv/deaktiviert
- Lösungssatz
- erlaubte Antwortvarianten pro Satz
- Lösungspunkte pro Satz
- globale Teiltreffer-Regel
- globale Wortpunkte-Regel
- Anzeige-Modus für Teiltreffer: aus / allgemein / mit Satznummer
- Fortschrittsanzeige: Anzahl Wörter anzeigen ja/nein
- optionaler Cooldown
```

### Text-Config / Multi-Texte

Alle Chatmeldungen müssen später über vorhandene Text-/Varianten-Systeme laufen, nicht hart im Code.

Zu berücksichtigen:

```text
- Chatmeldung bei Teiltreffer allgemein
- Chatmeldung bei Teiltreffer mit Satznummer
- Chatmeldung bei Teiltreffer mit Wortanzahl
- Chatmeldung bei kompletter Lösung
- Chatmeldung wenn Satz bereits gelöst ist
- Chatmeldung bei Eventstart / Eventende
- Chatmeldung bei Zwischenstand / Ranking
```

Vorgabe:

```text
- helper_texts / module_text_variants nutzen.
- Keine parallele Textstruktur bauen.
- Später Dashboard-Editor für Config und Textvarianten einplanen.
```


---

## EVS-6 – Text Multi-Phrase Config Prep

EVS-6 setzt die abgestimmten Mod-Team-Regeln für das Text-Spiel in Dashboard-Vorbereitung und Backend-Validierung um.

### Text-Spiel Regeln

- Ein Text-Spiel kann mehrere geheime Sätze enthalten.
- Jeder Satz ist einzeln lösbar.
- Der erste komplette Löser eines Satzes bekommt die Lösungspunkte.
- Danach wird nur dieser Satz aus der Event-Rotation entfernt.
- Andere Sätze bleiben offen.
- Teiltreffer können optional gemeldet werden.
- Teiltreffer können allgemein oder mit Satznummer gemeldet werden.
- Optional kann die Anzahl gefundener Wörter angezeigt werden.
- Optional können neue gefundene Wörter Punkte geben.
- Jedes Wort zählt pro Event/Satz/User nur einmal.
- Optional gibt es ein Wortpunkte-Limit pro User und Satz.

### Dashboard-Felder

- Mehrere geheime Sätze mit `+ Satz hinzufügen`.
- Pro Satz: Geheimsatz, erlaubte Antworten/Varianten, Punkte für komplette Lösung.
- Globale Text-Spiel-Regeln: Teiltreffer melden, Cooldown, Trefferzahl anzeigen, Wortpunkte aktivieren, Punkte pro Wort, Maximalpunkte pro User/Satz.

### Backend-Felder

Die Backend-Validierung akzeptiert/kennt unter anderem:

- `textConfig.phrases[]`
- `textConfig.partialHintVisibility`
- `textConfig.showPartialCount`
- `textConfig.wordPointsEnabled`
- `textConfig.pointsPerNewWord`
- `textConfig.maxWordPointsPerUserPhrase`
- `textConfig.partialHintCooldownSeconds`

### Noch offen

- Runtime-Chat-Erkennung.
- Speicherung der bereits gefundenen Wörter pro Event/Satz/User.
- Punktevergabe für Worttreffer.
- Entfernen gelöster Sätze aus der laufenden Rotation.
- Config-Dashboard allgemein.
- Text-Config/Multi-Texte im Dashboard über vorhandene Text-Helper.

---

## EVS-7 – Text-Config Dashboard Prep

EVS-7 bereitet die Text-Config / Multi-Texte im Dashboard vor.

### Ziel

Chat- und Systemtexte für das Event-System sollen nicht hart im Code stehen. Sie müssen später dashboardfähig, variantenfähig und über vorhandene Text-Helper verwaltbar sein.

### Backend

Neue bzw. vorbereitete Textkeys:

- `sound.round.started`
- `sound.solved`
- `sound.unresolved`
- `text.partial.general`
- `text.partial.with_sentence`
- `text.word_points.added`
- `text.phrase.solved`
- `event.created`
- `event.not_ready`
- `event.started`
- `event.finished`
- `points.added`
- `ranking.updated`

EVS-7 nutzt:

- `helper_texts.listModuleTextEditor(...)`
- `helper_texts.handleModuleTextEditorPayload(...)`
- `module_text_variants`

Es wird keine parallele Textstruktur aufgebaut.

### Routen

- `GET /api/stream-events/texts` liest Textkategorien, Keys und Varianten.
- `POST /api/stream-events/texts` speichert oder löscht Textvarianten.

### Dashboard

Im Event-System-Dashboard gibt es ein erstes Text-Config-/Multi-Texte-Panel.

Dort können vorbereitet werden:

- bestehende Textvariante bearbeiten
- Variante aktiv/inaktiv setzen
- Gewichtung setzen
- neue Variante hinzufügen
- Variante löschen

### Noch offen

- Runtime nutzt diese Texte noch nicht aktiv.
- Chat-Auswertung kommt später.
- Config-Dashboard für Event-Regeln kommt später.


## EVS-7b – Dashboard Tabs Layout Split

EVS-7b trennt das Event-System im Dashboard in Tabs, damit nicht mehr Eventliste, Konfiguration, Text-Config, Statistik und Overlay-Vorbereitung untereinander auf einer Seite stehen.

Tabs:

```text
Übersicht
Event
Sound-Spiel
Text-Spiel
Texte
Statistik
Overlay
```

Regeln:

- Übersicht zeigt Eventliste, Details, Status, Start/Beenden/Abbrechen und Ranking-Kurzansicht.
- Event zeigt Grunddaten und Spieltypen zum gewählten Event.
- Sound-Spiel zeigt Sound-spezifische Kurzinfos und öffnet bei Bedarf die Event-Bearbeitung.
- Text-Spiel zeigt Text-spezifische Kurzinfos, mehrere Sätze, Teiltreffer und Wortpunkte.
- Texte enthält die Text-Config/Multi-Texte-Verwaltung aus EVS-7.
- Statistik und Overlay sind als eigene Bereiche vorbereitet, bleiben aber in diesem Step ohne Runtime.

Keine Backend-, DB-, Runtime-, Chat-, Playback- oder Overlay-Logik wurde in EVS-7b geändert.


## EVS-7c – Event Overview + Editor Modal Flow Cleanup

EVS-7c korrigiert die Dashboard-Struktur nach Forrests Feedback.

### Neue Hauptlogik

Events sind das Hauptobjekt.

- Ohne Event gibt es kein Sound-Spiel und kein Text-Spiel.
- Sound-Spiel und Text-Spiel sind Konfigurationen innerhalb eines Events.
- Die Event-Bearbeitung passiert weiterhin im eigenen Fenster/Modal.

### Haupttabs ab EVS-7c

- Übersicht
- Events
- Texte
- Config
- Statistik
- Overlay

### Übersicht

Die Übersicht ist nicht mehr die komplette Eventverwaltung.

Sie zeigt nur laufende Events und schnellen Zugriff auf:

- Status
- Statistik ansehen
- Bearbeiten
- Beenden

Wenn kein Event läuft, verweist die Übersicht auf den Tab Events.

### Events

Der Tab Events zeigt alle konfigurierten Events mit Status:

- Entwurf
- Startbereit
- Läuft
- Beendet
- Abgebrochen

Dort können Events ausgewählt, geprüft, gestartet, beendet, abgebrochen und bearbeitet werden.

Bearbeiten öffnet ein separates Editor-Fenster.

### Editor-Fenster

Im Editor-Fenster bleiben die eventbezogenen Einstellungen:

- Grunddaten
- Sound-Spiel aktivieren/deaktivieren
- Sound-Spiel-Konfiguration
- Text-Spiel aktivieren/deaktivieren
- Text-Spiel-Konfiguration
- Speichern

### Texte

Der Tab Texte bleibt global und nicht eventbezogen.

Hier liegen später die Chat-/Bot-Meldungen und Multi-Texte über die vorhandenen Text-Helper.

### Config

Config ist als eigener Haupttab vorbereitet, aber noch ohne produktive Einstelllogik.

Geplant:

- Standardpunkte
- Standard-Zeitlimits
- Standard-Hinweisverhalten
- Wortpunkte-Defaults
- Overlay-Defaults
- Rechte/Freigaben

### Nicht geändert in EVS-7c

- Keine Backend-Logik geändert.
- Keine Datenbank geändert.
- Keine Chat-Runtime geändert.
- Keine Worterkennung geändert.
- Kein Sound-Playback geändert.
- Kein Overlay geändert.


---

## EVS-8 – Config-Dashboard Vorbereitung

Der bisherige Config-Platzhalter wurde zu einem ersten globalen Config-Tab ausgebaut.

### Globale Config

Die Config ist nicht an ein einzelnes Event gebunden. Sie dient als Standard-/Voreinstellungsbereich für neue Events und spätere Runtime-Regeln. Einzelne Events bleiben weiterhin im Event-Editor bearbeitbar.

### Enthaltene Bereiche

- Allgemein
  - Top-Gewinner anzeigen
  - nur ein aktives Event gleichzeitig
  - Übersicht zeigt nur laufende Events
- Sound-Spiel Defaults
  - Antwortzeit
  - Punkte pro Soundlösung
  - Verhalten bei nicht erkannt
  - direkte Wiederholung vermeiden
  - Auflösungs-Video erlauben
- Text-Spiel Defaults
  - Punkte für komplette Lösung
  - Teiltreffer-Hinweise
  - Hinweis allgemein / mit Satznummer / aus
  - gefundene Wortanzahl anzeigen
  - Wort pro User/Satz nur einmal zählen
- Wortpunkte
  - Wortpunkte aktivieren
  - Punkte pro neuem Wort
  - maximales Wortpunkte-Limit pro User/Satz
  - zusätzlicher Hinweis-Cooldown
- Overlay Defaults
  - Top 3 anzeigen
  - aktuelle Runde anzeigen
  - Teiltreffer-Hinweise im Overlay erlauben

### Backend

Neu vorbereitet:

- `GET /api/stream-events/config`
- `POST /api/stream-events/config`
- Tabelle `stream_events_config`

Die Config wird als globaler JSON-Snapshot gespeichert und normalisiert.

### Nicht enthalten

- Noch keine Chat-Runtime.
- Noch keine echte Worterkennung.
- Noch keine automatische Punktevergabe über Chat.
- Noch kein Sound-Playback.
- Noch kein produktives Overlay.
- Rechte/Freigaben sind weiterhin offen.


---

## EVS-9 – EventBus / Heartbeat Integration

EVS-9 macht die bereits geplante Communication-Bus-Anbindung des Event-Systems als eigenen Backend-Step sichtbar und testbar.

### Ziel

`stream_events` nutzt weiterhin den vorhandenen `communication_bus` / `helper_communication`. Es wird kein eigener paralleler Bus gebaut.

### Enthalten

- Modul-Anmeldung am vorhandenen Communication-Bus.
- Heartbeat fuer `stream_events`.
- regelmaessiger Modulstatus ueber den Bus.
- Status-Publish bei wichtigen Backend-Aktionen:
  - Config aktualisiert
  - Texte aktualisiert
  - Event erstellt
  - Event bearbeitet
  - Event validiert
  - Event gestartet
  - Event beendet
  - Event abgebrochen
  - Punkte vergeben
  - Ranking aktualisiert
- Bus-Diagnose-Endpunkt fuer das Event-System:
  - `GET /api/stream-events/bus-status`

### Bus-Status

Der neue Bus-Status zeigt fuer `stream_events`:

- ob der Communication-Bus erreichbar ist
- ob das Modul registriert ist
- ob Heartbeat gestartet wurde
- letzter Heartbeat
- letzter Status-Publish
- Stream-Events-relevante Bus-Events
- Stream-Events-Bus-Client-Eintrag

### Nicht enthalten

- keine Chat-Runtime
- keine Twitch-Chat-Auswertung
- keine Sound-Rotation
- keine Worterkennung
- keine automatische Punktevergabe ueber Chat
- kein Sound-/Video-Playback
- kein Overlay
