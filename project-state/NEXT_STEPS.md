# NEXT STEPS - stream-control-center

Stand: 2026-05-06

## Aktueller Stand

SoundAlerts ist bis STEP193.7.2 fuer den naechsten Deploy vorbereitet.

Erledigt:

- Uebersicht mit Kennzahlen und letzten 5 Events.
- Direkte Aktionen aus der Uebersicht.
- Eintraege-Filter fuer Alle/Aktiv/Inaktiv/Datei fehlt/Ignoriert.
- Inaktiv zaehlt nicht mehr automatisch als Einrichtung noetig.
- OBS-Loader-Standard dokumentiert.
- Hero-Leiste ohne Test-Buttons.
- `Bot & Settings` steht in der Tab-Reihenfolge hinten.
- Statistik fokussiert auf abgespielte Sounds, Top-Sounds und Top-User.

## Naechster empfohlener Schritt

### STEP193.8 - SoundAlerts Suche / Feinschliff nur bei Bedarf

Falls die Eintragsliste weiter waechst:

1. Suche nach SoundAlert-Name/Label/Datei.
2. Optional Filter fuer `Auto-zugeordnet`.
3. Optional bessere Upload-Zuweisung.
4. Keine neue Backend-Funktionalitaet, wenn vorhandene Daten reichen.

## Danach moeglich

### Clip-System

- Clip-System bei naechstem Live-Stream testen.
- Danach Streamer.bot-Action auf Backend-Call reduzieren.
- Danach Clip-Dashboard bauen.

## Wichtige Regeln

- SoundAlerts Bridge Version aktuell: `0.1.9`.
- Loeschen/Ignorieren sind direkte Backend-Aktionen.
- Loeschen braucht kein Config-Speichern.
- Ignored-Eintraege werden nicht neu als offene Auto-Eintraege erzeugt.
- Aktuelles Video-Upload-Limit live: `1073741824` Bytes / 1 GB.
- `_SoundAlerts_Loader` bleibt als aktive, stumme 1x1-OBS-Browserquelle geladen.


## Nach STEP193.7.4

- SoundAlerts Events im Live-Dashboard pruefen.
- Falls gewuenscht: Events-Tab spaeter mit Filter `Alle / Abgespielt / Fehler / Kein aktueller Eintrag` erweitern.
- Danach SoundAlerts-Flow weiter live testen.

### SoundAlerts Review Workflow

- `Zur Pruefung` ist der Standard fuer automatisch erkannte, noch nicht freigegebene Eintraege.

## Naechster sinnvoller Schritt nach STEP193.8

- Dashboard live testen: neue Auto-Eintraege, Speichern/Freigeben, Aktiv/Inaktiv-Filter.
- Danach bei Bedarf Feinschliff an Statistik oder Event-Historie.


## STEP193.8.1 Hinweis

Review-Workflow korrigiert: Beim Speichern/Freigeben wird nur der aktuell bearbeitete Eintrag freigegeben. Globale Speicherung gibt keine weiteren Review-Eintraege frei.
