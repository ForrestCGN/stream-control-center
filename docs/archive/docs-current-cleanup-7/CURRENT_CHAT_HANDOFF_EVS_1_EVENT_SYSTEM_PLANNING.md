# CURRENT CHAT HANDOFF – EVS-1 Event-System Planung

Stand: 2026-06-12  
Projekt: ForrestCGN / stream-control-center  
STEP-Vorschlag: EVS-1 – Event-System Architektur / Planung  
Art: Planung / Doku, keine Codeänderung

## 1. Ziel

Geplant wird ein modulares Event-System für den Stream, das über das Dashboard verwaltet wird und zwei Spieltypen unterstützen soll:

- Sound-Snippet-Spiel
- Text-/Phrase-Hunt-Spiel

Beide Spieltypen schreiben in eine gemeinsame Eventwertung. Am Ende eines Events sollen die Top 3 Gewinner ermittelt werden.

Das System soll vorhandene Projektstrukturen nutzen und keine parallelen Systeme bauen.

## 2. Verbindliche Grundregeln

- Mehrere Events können vorbereitet und gespeichert werden.
- Es darf nur ein Event gleichzeitig aktiv laufen.
- Pro aktivem Event darf maximal ein Sound-Spiel aktiv sein.
- Pro aktivem Event darf maximal ein Text-Spiel aktiv sein.
- Sound und Text dürfen gleichzeitig im selben Event aktiv sein.
- Mindestens ein Spieltyp muss bei der Event-Erstellung ausgewählt werden.
- Ein Event ist nur startbar, wenn alle ausgewählten Spieltypen vollständig konfiguriert sind.
- Config wird primär über DB + Dashboard gepflegt.
- JSON höchstens als Seed/Fallback, nicht als Hauptsteuerung.
- Multi-Texte werden über bestehende Text-/Message-Strukturen gepflegt.
- Twitch-Chat wird nur bei laufenden/aktiven Spielen ausgewertet.
- Keine Streamer.bot-Abhängigkeit für dieses neue System.
- Keine Funktionalität bestehender Systeme entfernen.
- SQLite produktiv weiter nutzen, Schema aber DB-portabel für spätere MySQL/MariaDB-Unterstützung planen.
- Dashboard muss streamer-/modfreundlich bleiben und darf nicht technisch überladen werden.
- Bei unklaren Bedien-, Rollen-, Konfigurations- oder Ablaufentscheidungen zuerst Forrest fragen.

## 3. Vorhandene Systeme, die genutzt werden sollen

### Communication Bus / EventBus

Verwenden für:

- Modul-Anmeldung
- Heartbeat
- Modulstatus
- Spiel-/Rundenstatus
- Punkteereignisse
- Ranking-Updates
- Overlay-Updates
- Diagnose

Kein neuer Bus, keine parallele Event-Schicht.

### Twitch Events / Chat

Verwenden für:

- Chatnachrichten als Input für aktive Spiele
- EventBus-Subscription auf `twitch.chat.message`
- keine dauerhafte Auswertung, wenn kein Event/Spiel aktiv ist

### Sound-System

Verwenden für:

- Sound-Snippet-Wiedergabe
- Queue/Playback-Regeln
- Stop/Skip/Pause, soweit vorhanden
- kein zweites Sound-Playback-System im Event-Modul

### Media-System / Helper Media

Verwenden für:

- Sounddateien
- optionale Auflösungs-Videos
- Media-Info / Dauer / Video-Audio-Erkennung
- keine eigene Upload-/Dateiverwaltung im Event-System

### Text-/Message-Helper

Verwenden für:

- Chattexte
- Overlaytexte
- Fehlermeldungen
- Ergebnis-/Ranking-Texte
- Varianten pro Text-Key

### Database Core

Verwenden für:

- Schema-Versionierung
- `CREATE TABLE IF NOT EXISTS`
- portable SQL-Helper
- JSON-/Bool-/Datetime-Typhelfer
- spätere MySQL/MariaDB-Kompatibilität vorbereiten

## 4. Dashboard-Konzept

Dashboard soll in zwei Ebenen gedacht werden.

### 4.1 Live-/Stream-Modus

Für schnelle Bedienung im Stream:

- Aktives Event sehen
- Event starten/beenden
- aktuelles Sound-Spiel sehen
- nächste Sound-Runde starten
- aktuelles Text-Spiel sehen
- Text-Spiel pausieren/aktivieren
- Countdown/Antwortzeit sehen
- Lösung anzeigen
- Punkte/Rangliste anzeigen
- Top 3 anzeigen
- Runde abbrechen
- optional Auflösungs-Video abspielen

### 4.2 Setup-/Admin-Modus

Für Vorbereitung:

- Event erstellen/bearbeiten
- Spieltypen auswählen: Sound und/oder Text
- Sound-Spiel per extra Fenster konfigurieren
- Text-Spiel per extra Fenster konfigurieren
- Punkte-Regeln konfigurieren
- Multi-Texte pflegen
- Statistiken ansehen
- Event duplizieren
- alte Events archivieren
- manuelle Punktkorrektur, falls freigegeben

Detailkonfiguration soll über eigene Dialoge/Modals laufen, ähnlich wie bei vorhandenen Giveaway-/Glücksrad-Flows.

## 5. Event-Erstellung

Ablauf:

1. Event-Grunddaten eingeben
   - Name
   - Beschreibung optional
   - Preise optional
   - Sichtbarkeit Ranking optional
2. Spieltyp auswählen:
   - Sound-Snippet-Spiel
   - Text-/Phrase-Hunt-Spiel
3. Gewählte Spieltypen konfigurieren
4. System prüft Startbereitschaft
5. Event als Entwurf speichern oder startbereit markieren
6. Start erst erlauben, wenn Validierung OK ist

Validierung:

- Kein Spieltyp gewählt -> nicht gültig
- Sound gewählt, aber keine Snippets -> nicht gültig
- Sound gewählt, aber keine Antwortvarianten/Punkte-Regel -> nicht gültig
- Text gewählt, aber keine Phrase/Sätze -> nicht gültig
- Text gewählt, aber keine akzeptierte Antwort/Punkte-Regel -> nicht gültig
- Alle gewählten Spieltypen vollständig -> startbar

Fehler müssen verständlich sein, z. B.:

- „Sound-Spiel ist ausgewählt, aber es wurde noch kein Schnipsel hinzugefügt.“
- „Text-Spiel ist ausgewählt, aber es wurde noch kein Geheimsatz angelegt.“
- „Punkte-Regel fehlt.“

## 6. Sound-Snippet-Spiel

### 6.1 Konfigurierbare Daten

Pro Sound-Snippet:

- Anzeigename
- Kategorie
- Audio-Media-Referenz
- erlaubte Antworten
- Antwortzeit
- Punkte
- optionales Auflösungs-Video über Media-System
- aktiv/inaktiv
- Schwierigkeit optional

Pro Event/Sound-Spiel:

- Antwortzeit Standard
- Punkte erster richtiger User
- Punkte zweiter richtiger User
- Punkte dritter richtiger User
- Punkte weitere richtige User
- mehrere richtige Antworten erlaubt
- verwendete Snippets nach Lösung entfernen
- Verhalten bei nicht erkannter Runde
- direkte Wiederholung verhindern

### 6.2 Rotation

Status pro Event-Snippet:

- offen
- läuft gerade
- erkannt
- nicht erkannt
- aus Rotation entfernt

Regeln:

- korrekt erkannt -> als erkannt markieren und aus aktueller Event-Rotation entfernen
- nicht erkannt -> je nach Konfig:
  - später erneut einreihen
  - aus Rotation entfernen
  - manuell entscheiden
- direkte Wiederholung vermeiden, z. B. erst nach X anderen Snippets erneut erlauben
- Rotation ist eventbezogen, nicht global

### 6.3 Auflösungs-Video

Optional:

- Nach korrekter Lösung kann ein passendes Video abgespielt werden.
- Datei/Upload kommt aus dem vorhandenen Media-System.
- Event-System speichert nur Media-Referenz.
- Wiedergabe bevorzugt über vorhandenes Sound-/Media-System.
- V1-Empfehlung: Button „Auflösungs-Video abspielen“, Auto-Play später optional.

## 7. Text-/Phrase-Hunt-Spiel

### 7.1 Konfigurierbare Daten

Pro Phrase/Text:

- Geheimer Satz
- akzeptierte Antwortvarianten
- Hinweiswörter/Tokens
- Punkte erster Löser
- Punkte weitere Löser
- Folgeantwort-Zeitfenster
- mehrfach lösbar ja/nein
- aktiv/inaktiv
- Hinweise aktiv ja/nein

### 7.2 Spielverhalten

- Chat wird nur ausgewertet, wenn Text-Spiel aktiv ist.
- Hinweiswörter können Chat-Hinweise auslösen.
- Vollständige Lösung vergibt Punkte.
- Max. eine Lösung pro User pro Phrase.
- Ob eine Phrase nur einmal global oder mehrfach innerhalb eines Zeitfensters lösbar ist, bleibt Konfig.

Empfehlung für V1:

- Hinweiswörter geben keine Punkte, nur Hinweise.
- Erster Löser bekommt Hauptpunkte.
- Weitere Löser optional innerhalb X Sekunden reduzierte Punkte.

## 8. Gemeinsame Punktewertung

Zentrales Ledger statt Einzelwertungen.

Jede Punktebuchung enthält:

- Event-ID
- Spieltyp / Quelle
- Runde / Phrase / Snippet optional
- User Login
- User DisplayName
- Punkte
- Grund
- Zeitstempel
- Metadaten JSON
- created_by/source

Beispiele:

- Sound-Snippet korrekt erkannt
- Text-Phrase gelöst
- manueller Bonus
- manuelle Korrektur

Ranking wird aus dem Ledger berechnet.

## 9. Statistiken

Getrennt von der Live-Wertung.

### Pro Event

- Anzahl Sound-Runden
- erkannte / nicht erkannte Snippets
- Lösungsquote
- durchschnittliche Antwortzeit
- Text-Phrasen gelöst / ungelöst
- Top-Spieler
- Punkte nach Quelle
- Top 3 Gewinner

### Global / Langzeit optional

- Snippet wie oft gespielt
- Snippet wie oft erkannt
- Snippet-Erkennungsquote
- schnellste Antwort je Snippet
- schwerste/leichteste Snippets
- Phrase wie oft gelöst
- User mit meisten richtigen Antworten
- User mit schnellsten Antworten

Statistiken sollen aus Historien-/Result-Tabellen berechnet werden, nicht als unkontrollierte Zähler verstreut im Code.

## 10. Overlay-/Playback-Konzept

Bevorzugt:

- 1 zentrales Event-Overlay für sichtbare Eventinformationen
- Sound/Video-Playback über vorhandenes Sound-/Media-System
- keine unnötigen Spezial-Overlays

Event-Overlay zeigt je nach Zustand:

- Event gestartet
- Sound-Runde läuft
- Antwortzeit-Countdown
- richtige Lösung
- Punktevergabe
- Text-Hunt-Hinweis
- Ranking
- Top 3 Gewinner

Offen nach Repo-/Live-Prüfung:

- Kann das vorhandene Sound-/Media-System Video sauber im Stream abspielen?
- Oder braucht das Event-Overlay eine kleine Player-Erweiterung?
- Standard für V1 sollte möglichst wenig OBS-Quellen erfordern.

## 11. Vorgeschlagene Backend-Module

### stream_events.js

Zentral:

- Events
- Spielzuordnung
- Start/Stop
- Punkte
- Ranking
- Top 3
- Status
- Diagnostics
- Bus-Anmeldung/Heartbeat

### event_sound_snippets.js oder Unterstruktur stream_events/sound_snippets.js

- Sound-Snippet-Konfig
- Rotation
- Rundenstatus
- Antwortauswertung
- Punkte an stream_events
- Media-/Sound-System-Anbindung

### event_phrase_hunt.js oder Unterstruktur stream_events/phrase_hunt.js

- Phrases
- Tokens
- Antwortauswertung
- Punkte an stream_events
- Chat-Hinweise

Empfehlung für V1 nach vorhandener Strukturprüfung:

- zunächst ein Backend-Modul `backend/modules/stream_events.js`
- interne Services/Unterordner nur bei Bedarf:
  - `backend/modules/stream_events/store.js`
  - `backend/modules/stream_events/sound_game.js`
  - `backend/modules/stream_events/text_game.js`
  - `backend/modules/stream_events/scoring.js`

Nicht zu früh zu viele Dateien bauen.

## 12. Vorgeschlagene Dashboard-Dateien

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`

Dashboard-Dialoge im selben Modul:

- Event erstellen/bearbeiten
- Sound-Spiel konfigurieren
- Text-Spiel konfigurieren
- Ranking/Statistik öffnen
- Multi-Texte öffnen oder später zentraler Texte-Tab

Keine technische Tabellenwüste in der Hauptansicht.

## 13. Vorgeschlagene Overlay-Datei

- `htdocs/overlays/events/event_overlay.html`

Nur wenn technisch nötig später zusätzlich:

- `htdocs/overlays/events/event_media_player.html`

Aber V1-Ziel bleibt: möglichst ein Event-Overlay.

## 14. Vorgeschlagene DB-Tabellen

Namen vor finaler Umsetzung noch prüfen.

- `stream_events`
- `stream_event_games`
- `stream_event_rounds`
- `stream_event_score_entries`
- `stream_event_participants`
- `stream_event_settings`
- `stream_event_sound_snippets`
- `stream_event_sound_answers`
- `stream_event_sound_rotation`
- `stream_event_phrase_entries`
- `stream_event_phrase_answers`
- `stream_event_phrase_tokens`
- `stream_event_phrase_user_tokens`

Portabilitätsregeln:

- Typhelfer aus `backend/core/database.js` verwenden.
- `database.primaryKeyAutoIncrementSql()`
- `database.textTypeSql({ long: true })`
- `database.boolTypeSql()`
- `database.dateTimeTypeSql()`
- `database.jsonTypeSql()`
- keine SQLite-only Abfragen ohne Not.
- vorhandene produktive DB niemals ersetzen.

## 15. Vorgeschlagene API-Routen

### Status / Diagnose

- `GET /api/stream-events/status`
- `GET /api/stream-events/routes`
- `GET /api/stream-events/diagnostics`

### Events

- `GET /api/stream-events`
- `GET /api/stream-events/:eventUid`
- `POST /api/stream-events`
- `PUT /api/stream-events/:eventUid`
- `POST /api/stream-events/:eventUid/start`
- `POST /api/stream-events/:eventUid/stop`
- `POST /api/stream-events/:eventUid/archive`

### Spiel-Konfig

- `GET /api/stream-events/:eventUid/games`
- `PUT /api/stream-events/:eventUid/games/sound`
- `PUT /api/stream-events/:eventUid/games/text`
- `GET /api/stream-events/:eventUid/validation`

### Sound-Spiel

- `GET /api/stream-events/:eventUid/sound/snippets`
- `POST /api/stream-events/:eventUid/sound/snippets`
- `PUT /api/stream-events/:eventUid/sound/snippets/:snippetUid`
- `POST /api/stream-events/:eventUid/sound/round/start`
- `POST /api/stream-events/:eventUid/sound/round/finish`
- `POST /api/stream-events/:eventUid/sound/round/abort`
- `POST /api/stream-events/:eventUid/sound/video/play`

### Text-Spiel

- `GET /api/stream-events/:eventUid/text/phrases`
- `POST /api/stream-events/:eventUid/text/phrases`
- `PUT /api/stream-events/:eventUid/text/phrases/:phraseUid`
- `POST /api/stream-events/:eventUid/text/pause`
- `POST /api/stream-events/:eventUid/text/resume`

### Scoreboard

- `GET /api/stream-events/:eventUid/ranking`
- `GET /api/stream-events/:eventUid/score-entries`
- `POST /api/stream-events/:eventUid/score/manual`
- `POST /api/stream-events/:eventUid/winners/finalize`

## 16. Vorgeschlagene Bus-Events

Finale Namen erst nach vorhandenen Mustern prüfen.

- `stream_events.event.created`
- `stream_events.event.updated`
- `stream_events.event.started`
- `stream_events.event.stopped`
- `stream_events.event.finished`
- `stream_events.validation.updated`
- `stream_events.points.added`
- `stream_events.ranking.updated`
- `stream_events.winners.finalized`

Sound:

- `stream_events.sound.round.started`
- `stream_events.sound.answer.correct`
- `stream_events.sound.answer.received`
- `stream_events.sound.round.finished`
- `stream_events.sound.round.failed`
- `stream_events.sound.snippet.removed_from_rotation`
- `stream_events.sound.video.requested`

Text:

- `stream_events.text.token.found`
- `stream_events.text.phrase.solved`
- `stream_events.text.status.updated`

Consumed:

- `twitch.chat.message`
- optional später `sound.finished` / `sound.started`, wenn Playback-Acks gebraucht werden

## 17. Textkeys / Multi-Texte

Text-Modul:

- `stream_events`

Kategorien:

- `chat_event`
- `chat_sound`
- `chat_text`
- `chat_score`
- `overlay_event`
- `overlay_sound`
- `overlay_text`
- `dashboard_validation`
- `errors`

Beispiel-Keys:

- `event.started`
- `event.finished`
- `event.no_active`
- `sound.round.started`
- `sound.round.correct_first`
- `sound.round.correct_followup`
- `sound.round.none_correct`
- `sound.round.solution`
- `text.token.found.single`
- `text.token.found.multi`
- `text.phrase.solved`
- `score.points_added`
- `ranking.top3`
- `validation.sound_missing_snippets`
- `validation.text_missing_phrases`

Texte immer dashboardfähig und variantenfähig halten.

## 18. Tests für spätere Schritte

### Nach Backend-Basis

```powershell
node -c .\backend\modules\stream_events.js
$s = Invoke-RestMethod "http://127.0.0.1:8080/api/stream-events/status"
$s | Select-Object ok,module,moduleVersion,health,lastError
```

### Nach Dashboard

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
```

Manuell:

```text
Dashboard -> Event-System
Event als Entwurf erstellen
Sound auswählen -> Validierung zeigt fehlende Snippets
Text auswählen -> Validierung zeigt fehlende Phrases
Konfig öffnen -> speichern
Event wird startbereit
```

### Nach Bus

```powershell
$r = Invoke-RestMethod "http://127.0.0.1:8080/api/diagnostics/registry"
$r.coverage | Select-Object ok,registryEntries,loadedModules,coveredLoadedModules,missingLoadedModules,registryOnlyEntries
$r.coverage.missingLoadedModuleRows
$r.coverage.registryOnlyRows
```

### Nach Chat-Anbindung

- Chatnachricht ohne aktives Event wird ignoriert.
- Chatnachricht mit aktivem Text-Spiel wird ausgewertet.
- Chatnachricht mit aktiver Sound-Runde wird ausgewertet.
- Commands werden nicht gestört.

## 19. Offene Entscheidungen vor EVS-2

Diese Punkte müssen Forrest gefragt werden, bevor Code gebaut wird:

1. Soll Ranking live sichtbar sein oder nur im Dashboard?
2. Soll das Event-Overlay dauerhaft sichtbar sein oder nur bei Aktionen?
3. Dürfen Mods Punkte manuell korrigieren oder nur Owner/Admin?
4. Soll ein Sound-Auflösungs-Video automatisch laufen oder nur per Button?
5. Sollen Text-Phrases global nur einmal lösbar sein oder mehrere Löser im Zeitfenster erlauben?
6. Sollen Sound-Snippets nach „nicht erkannt“ standardmäßig später wiederkommen?
7. Wie viele andere Snippets müssen mindestens dazwischen liegen, bevor ein nicht erkanntes Snippet wiederkommen darf?
8. Sollen Preise nur als Freitext gespeichert werden oder später strukturiert?
9. Soll ein Event dupliziert werden können?
10. Soll es Event-Vorlagen geben?

Empfehlung für V1:

- Ranking live im Dashboard, Overlay optional.
- Event-Overlay nur bei Aktionen plus optional kleine Rangliste.
- Punktkorrektur nur Owner/Admin.
- Video nach Lösung zuerst nur per Button.
- Text-Phrases: erster Löser voll, weitere optional 60 Sekunden reduziert.
- Nicht erkannte Snippets: später wieder einreihen, aber nicht direkt.
- Mindestens 3 andere Snippets Abstand.
- Preise als Freitext in V1.
- Event duplizieren sinnvoll, aber nach Basis.

## 20. Nicht geändert

Dieser EVS-1-Plan ändert nichts an:

- bestehender Giveaway-Logik
- bestehender Loyalty-Logik
- bestehendem Sound-System
- bestehendem Media-System
- Twitch-Commands
- Streamer.bot
- produktiver SQLite-Datenbank
- OBS-Quellen
- Overlays

## 21. Nächster Schritt

EVS-2 sollte kein riesiger Komplettbau werden.

Sinnvoller nächster Schritt:

1. echte Dateien noch einmal lokal/live gegen GitHub-dev prüfen
2. finale Dateiliste bestätigen
3. minimale Backend-Basis `stream_events` planen:
   - Statusroute
   - Schema-Skeleton
   - Event-Entwurf speichern
   - Validierung
   - Bus-Registrierung/Heartbeat
   - keine Chat-/Playback-Logik
4. auf Forrests Go warten
