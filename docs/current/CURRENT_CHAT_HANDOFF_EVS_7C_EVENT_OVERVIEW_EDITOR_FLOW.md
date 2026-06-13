# CURRENT CHAT HANDOFF – EVS-7c Event Overview + Editor Modal Flow Cleanup

Stand: EVS-7c

## Ziel

Dashboard-Flow korrigiert: Events sind das Hauptobjekt. Sound-Spiel und Text-Spiel sind keine eigenständigen Hauptbereiche, sondern werden innerhalb eines Events bearbeitet.

## Umsetzung

- Haupttabs reduziert/neu sortiert:
  - Übersicht
  - Events
  - Texte
  - Config
  - Statistik
  - Overlay
- Übersicht zeigt nur laufende Events.
- Events-Tab zeigt alle konfigurierten Events mit Status.
- Bearbeiten öffnet weiterhin das separate Event-Editor-Fenster.
- Config-Tab ist als Platzhalter vorbereitet.
- Texte bleiben global und nicht eventbezogen.

## Wichtig

Forrests aktuelle Vorgabe:

- Übersicht eher nur laufende Events mit Statistikmöglichkeit.
- Eventliste mit Entwurf/Status auf der Event-Seite.
- Config-Tab fehlt noch und muss später richtig ausgebaut werden.

## Nicht geändert

- Backend
- Datenbank
- Runtime
- Chat-Auswertung
- Sound-Playback
- Overlay

## Nächste Schritte

- Dashboard testen.
- Eventliste/Modal-Flow prüfen.
- Danach Config-Tab planen.
- Später Runtime für Sound/Text und Event-Statistiken.
