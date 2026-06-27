# CURRENT CHAT HANDOFF – Loyalty / Giveaways / Glücksrad – nach LWG-4O.5e

Stand: 2026-06-11
Projekt: ForrestCGN / stream-control-center
Branch/Ziel: GitHub `ForrestCGN/stream-control-center` Branch `dev`, Live-Ziel `D:\Streaming\stramAssets`

## Wichtigste Arbeitsregeln

- Immer echte Dateien / GitHub dev / Live-Stand als Single Source of Truth nehmen.
- Keine Funktionalität entfernen.
- Keine Apply-/Patch-/Regex-Scripte.
- ZIPs immer mit echten Zielpfaden ab Repo-Root liefern.
- Nach Code-/Doku-ZIP StepDone-Befehl nennen.
- Für Live-Tests muss Forrest StepDone vor dem Test ausführen, sonst landet der Stand nicht im Live-System.
- Streamer.bot ist für Loyalty/Giveaways/Glücksrad außen vor.
- Keine SQLite-Datenbank ersetzen oder neu bauen.
- Vor weiteren Umbauten erst stabilisieren, dann planen, dann auf explizites `go` warten.

## Aktueller bestätigter Funktionsstand

### Eventbus / Chat

- Chat-Events laufen zentral über `twitch.chat.message`.
- `twitch_presence` empfängt IRC/PRIVMSG und leitet über `twitch_events` in den Communication Bus.
- `loyalty_giveaways` subscribed auf `channel=twitch.chat`, `action=message`.
- Payload liegt im Bus-Envelope unter `payload.twitch.user.login`; dafür wurde LWG-4O.3c gebaut.

### LWG-4O.3c – Chat Claim Payload Wrapper Alias Fix

Bestätigt durch vollständigen Test:

- `moduleBuild = STEP_LWG_4O_3c`
- Chat-Claim erkennt `forrestcgn` korrekt.
- `seen=1`, `matched=1`, `confirmed=1`, `lastUser=forrestcgn`.
- Wheel-Claim/Spin nach manuellem Claim funktionierte.

StepDone:

```powershell
.\stepdone.cmd "STEP LWG-4O.3c Twitch Payload Wrapper Alias Fix"
```

### LWG-4O.4 – Auto-Claim im Draw-Flow

Bestätigt durch vollständigen Test:

- `moduleBuild = STEP_LWG_4O_4`
- Draw öffnet automatisch ein Claim-Fenster, wenn `chatClaim.enabled=true`.
- Giveaway geht auf `waiting_for_claim`.
- Wheel-Permission wurde bis zur Chat-Bestätigung zurückgehalten.
- Nach Chatmeldung wurde Claim bestätigt.
- Danach wurde Wheel-Permission erstellt.
- Spin funktionierte.

StepDone:

```powershell
.\stepdone.cmd "STEP LWG-4O.4 Auto-Claim im Draw-Flow"
```

### LWG-4O.5 / 4O.5b / 4O.5c / 4O.5d / 4O.5e – Dashboard-Fixes

Es gab mehrere Dashboard-Probleme nach dem Claim-Flow-UX-/Direct-Navigation-Umbau.

#### LWG-4O.5 Dashboard Claim-Flow UX

Ziel war:

- Chat-Claim-Pflicht im Giveaway-Formular steuerbar machen.
- Timeout in Sekunden einstellbar machen.
- Claim-/Winner-Status im Dashboard sichtbar machen.

Problem: Danach waren einige Helper im `loyalty_games.js` nicht vollständig/sauber im Live-Stand vorhanden.

#### LWG-4O.5b Loyalty Direct Navigation Fix

Ziel war erfolgreich:

- Klick auf linke Navigation `Loyalty` öffnet direkt das Loyalty-Modul.
- Keine Zwischenkarte `Loyalty Games` mehr.
- Sidebar-Subtitle wurde zu `Punkte, Giveaways, Glücksrad` geändert.

Wichtig: Diese Direct Navigation ist grundsätzlich drin und im Screenshot sichtbar.

#### LWG-4O.5c / 4O.5d / 4O.5e Hotfix-Kette

Nacheinander wurden fehlende Helper ergänzt:

- `statusLabel` fehlte → LWG-4O.5c
- `getChatClaimSettings` fehlte → LWG-4O.5d
- `claimStatusLabel` fehlte → LWG-4O.5e

Nach LWG-4O.5e öffnet der Giveaways-Tab wieder sichtbar. Screenshot zeigt:

- Links Liste der Giveaways.
- Rechts Formular `Neues Giveaway`.
- Tabs funktionieren: Übersicht, Glücksrad, Presets, Giveaways, Chat/Commands, Verlauf, Hinweise.

StepDone für letzten Hotfix:

```powershell
.\stepdone.cmd "STEP LWG-4O.5e Giveaways Tab claimStatusLabel Fix"
```

## Aktuelles UI-Problem / offene Entscheidung

Im aktuellen Formular sind noch unpassende alte/missverständliche Claim-Texte sichtbar:

- `Gewinner muss sich im Chat melden`
- `Rad erst nach Chatmeldung freigeben`
- `Chat-Claim Timeout (Sek.)`
- `Claim-Modus`

Diese Texte/Optionen passen nicht mehr zur gemeinsam besprochenen Ziel-Logik.

## Gemeinsame fachliche Entscheidung: normale Giveaways

### Normales Giveaway ohne Gewinnbestätigung

Ablauf:

1. Giveaway öffnen.
2. Zuschauer nehmen teil.
3. Teilnahme schließen.
4. Gewinner ziehen.
5. Gewinner ist sofort gültig.
6. Giveaway beenden.

### Normales Giveaway mit Gewinnbestätigung

Option soll heißen:

```text
Gewinner muss Gewinn bestätigen
```

Hilfetext:

```text
Der gezogene Gewinner muss innerhalb der angegebenen Zeit eine Nachricht im Twitch-Chat schreiben. Erst dann gilt der Gewinn als bestätigt.
```

Ablauf:

1. Giveaway öffnen.
2. Zuschauer nehmen teil.
3. Teilnahme schließen.
4. Gewinner ziehen.
5. System wartet auf Chatmeldung des gezogenen Gewinners.
6. Gewinner meldet sich → Gewinn bestätigt.
7. Gewinner meldet sich nicht → Streamer/Mod kann nächsten Gewinner ziehen; bisheriger Gewinner wird übersprungen/nicht bestätigt.

Wichtig:

- Kein Szenario mit mehreren gleichzeitigen Claim-Fenstern für normale Giveaways.
- C2 wurde ausdrücklich gestrichen.
- Es gibt immer nur einen aktiven Gewinner, der gerade bestätigen muss.

## Gemeinsame fachliche Entscheidung: Wheel-Giveaways

Bei Wheel-Giveaways ist das Drehen selbst die Bestätigung.

Daher:

- Kein zusätzlicher Chat-Claim für Wheel-Giveaways.
- Keine Option `Gewinner muss Gewinn bestätigen` für Wheel-Giveaways anzeigen.
- Keine Option `Rad erst nach Chatmeldung freigeben` anzeigen.
- Kein Timer nötig.

Ablauf Wheel-Giveaway:

1. Giveaway öffnen.
2. Zuschauer nehmen teil.
3. Teilnahme schließen.
4. Gewinner ziehen.
5. Gewinner darf Rad drehen.
6. Gewinner dreht → Rad bestimmt Gewinn → Gewinner abgeschlossen.

Wenn der Gewinner nicht dreht und der Streamer weiterziehen will:

- Der Streamer soll **in diesem Moment per Button entscheiden**, nicht über eine vorherige feste Einstellung.

Geplante UI-Aktion bei `Nächsten Gewinner ziehen`:

Dialog/Buttons:

```text
Was soll mit dem bisherigen Gewinner passieren?

[Bisherigen Gewinner ersetzen]
[Zusätzlichen Gewinner ziehen]
[Abbrechen]
```

Button-Bedeutung:

### Bisherigen Gewinner ersetzen

- Der bisherige Gewinner wird übersprungen.
- Er kann nicht mehr am Rad drehen.
- Es wird ein neuer Gewinner gezogen.

### Zusätzlichen Gewinner ziehen

- Der bisherige Gewinner bleibt dabei.
- Er darf später weiterhin drehen.
- Zusätzlich wird ein weiterer Gewinner gezogen.

Begriffe wie `Drehrecht`, `Permission`, `revoked`, `pending`, `offene Drehung` sollen in der UI vermieden werden.

## Sofort nächster sinnvoller Step

Nicht direkt neue Logik bauen. Zuerst UI/Formular sauberziehen und stabilisieren:

### LWG-4O.5f – Giveaway Form Claim/Wheel UI Cleanup

Ziele:

- Bei normalem Giveaway:
  - Checkbox `Gewinner muss Gewinn bestätigen` anzeigen.
  - Timeout nur anzeigen, wenn diese Checkbox aktiv ist.
  - Claim-Modus ggf. vorerst verstecken oder nur als einfache Info `Irgendeine Chatnachricht` anzeigen.
- Bei Wheel-Giveaway:
  - Keine Chat-Claim-Felder anzeigen.
  - Kein `Rad erst nach Chatmeldung freigeben` anzeigen.
  - Optional Hilfetext: `Beim Glücksrad-Giveaway bestätigt der Gewinner durch das Drehen des Rads.`
- Keine Backend-/DB-Änderung, solange nicht nötig.
- Erst aktuelle echte `htdocs/dashboard/modules/loyalty_games.js` prüfen.
- Vor Lieferung statisch prüfen, ob alle lokal referenzierten Helper-Funktionen existieren.
- Syntaxcheck `node -c htdocs/dashboard/modules/loyalty_games.js`.

## Wichtiger Hinweis zum letzten Verlauf

Forrest ist genervt, weil die letzten Dashboard-Fixes mehrfach nacheinander fehlende Helper erzeugt haben. Im nächsten Chat unbedingt zuerst stabilisieren, nicht weiter improvisieren.

Satz für den nächsten Chat:

> Wir machen mit dem Loyalty/Giveaways/Glücksrad weiter. Bitte lies zuerst `docs/current/CURRENT_CHAT_HANDOFF_LOYALTY_LWG_4O_5E_TO_NEXT_CHAT.md`. Aktueller Live-Stand ist nach LWG-4O.5e: Loyalty Direct Navigation funktioniert, Giveaways-Tab öffnet wieder, aber das Giveaway-Formular muss fachlich bereinigt werden. Wichtig: Kein weiterer Blind-Fix. Erst echte Datei prüfen, alle Helper prüfen, dann LWG-4O.5f UI-Cleanup bauen. StepDone ist nötig, damit ich live testen kann.
