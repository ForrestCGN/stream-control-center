# HT3.3.2 – HypeTrain Dashboard Event-Actions Tab-Only Fix

Fix für HT3.3.1: Der Event-Actions-Bereich darf nicht unten an die Übersicht angehängt werden.

## Änderung

- `hypetrain_event_actions.js` fängt den Tab `Event-Actions` im Capture-Handler ab.
- Beim Tab `Event-Actions` werden nur Topline/Tabs und der Event-Actions-Inhalt angezeigt.
- Beim Wechsel zurück auf Übersicht/Config/Texte/Statistik/Tests wird der Event-Actions-Container entfernt.
- Keine Backend-Änderung.
- Keine DB-Änderung.
- Kein Node-Neustart nötig.

## Erwartung

- Übersicht zeigt keine Event-Actions mehr unten.
- Event-Actions zeigt nur den Event-Actions-Tab-Inhalt.
