# CURRENT CHAT HANDOFF – EVS-13b User Statistics Detail Modal + AutoReload

Stand: 2026-06-13

## Ziel

Die User-Statistik im Event-System soll nicht inline die Statistik-Seite füllen, sondern bei Auswahl eines Users ein eigenes Detail-Popup öffnen. Das Popup zeigt die Statistik des Users im aktuellen Event und aktualisiert sich bei Bedarf automatisch im Hintergrund, ohne die Dashboard-Seite neu zu laden.

## Änderungen

Betroffene Dateien:

- `htdocs/dashboard/modules/stream_events.js`
- `htdocs/dashboard/modules/stream_events.css`
- `docs/current/CURRENT_CHAT_HANDOFF_EVS_13B_USER_STATS_MODAL_AUTOREFRESH.md`
- `project-state/*`

## Dashboard-Verhalten

Im Statistik-Tab:

- User-Dropdown bleibt sichtbar.
- Auswahl eines Users öffnet ein User-Detail-Popup.
- Der bisherige Inline-User-Report auf der Statistik-Seite wird nicht mehr direkt darunter angezeigt.
- Button `User-Details öffnen` öffnet den aktuell ausgewählten User erneut.

Im Popup:

- Header mit User und aktuellem Event.
- Übersicht: Punkte, Worttreffer, Satzlösungen, Events.
- Gefundene Wörter mit Event, Satznummer, Wort, Punkten, Zeitpunkt und Chatnachricht.
- Gelöste Sätze mit Event, Satznummer, Punkten, Zeitpunkt und Chatnachricht.
- Sound-Spiel-Bereich als vorbereiteter Platzhalter.
- Timeline: Wann, wie, wo, welche Punkte.
- Inhalt ist scrollbar.
- Footer bleibt erreichbar.

## AutoReload

- AutoReload läuft nur, solange das User-Detail-Popup offen ist.
- Intervall: 5 Sekunden.
- Es wird nur per `fetch`/API der Popup-Inhalt aktualisiert.
- Kein Browser-Reload.
- Kein kompletter Dashboard-Seitenreload.
- Popup bleibt offen.
- Scrollposition im Popup wird vor dem Refresh gespeichert und danach wiederhergestellt.
- AutoReload kann im Popup an-/ausgeschaltet werden.
- Zusätzlich gibt es `Jetzt aktualisieren`.

## Backend

Keine Backend-Änderung in diesem Step. EVS-13-Routen bleiben gültig:

- `GET /api/stream-events/statistics/users`
- `GET /api/stream-events/statistics/users?eventUid=<eventUid>`
- `GET /api/stream-events/statistics/user/:login`
- `GET /api/stream-events/statistics/user/:login?eventUid=<eventUid>`

## Nicht geändert

- Keine direkte Twitch-Chat-Ausgabe.
- Keine neue Bus-Struktur.
- Keine DB-Änderung.
- Keine Sound-Runtime.
- Keine Overlay-Runtime.

## Test

Syntaxcheck:

```powershell
node -c .\htdocs\dashboard\modules\stream_events.js
node -c .\backend\modules\stream_events.js
```

Danach:

```powershell
.\stepdone.cmd "EVS-13b User Statistics Detail Modal AutoRefresh"
```

Dashboard-Test:

1. `http://127.0.0.1:8080/dashboard`
2. Event-System öffnen.
3. Statistik-Tab öffnen.
4. Userliste laden.
5. User im Dropdown auswählen.
6. Popup muss öffnen.
7. Popup muss scrollbar sein.
8. AutoReload darf die Seite nicht neu laden.
9. Neue Treffer sollten nach einigen Sekunden im Popup auftauchen.
