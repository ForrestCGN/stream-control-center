# NEXT_STEPS

Stand: RDAP45C_REMOTE_AUTH_DEPLOY_SAFETY_LOGIN_ACTIVE_LIVE_CONFIRMED_DOCS  
Datum: 2026-06-26

## Naechster empfohlener Step

```text
RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN
```

## Ziel RDAP46

```text
Nach RDAP44/RDAP45C den naechsten kleinen Schritt bewusst planen.
Admin-Notizen-Zieluser-Auswahl ist live.
Login/Deploy-Safety ist wieder konsistent.
```

## Moegliche Richtungen

```text
1. Admin-Notizen Zieluser-Auswahl komfortabler machen.
2. Echte Admin-User-Detailseite planen.
3. Admin-Note Update separat planen.
4. Admin-Note Deactivate separat planen.
5. Permission-Verwaltung separat planen, nicht mit Admin-Notizen vermischen.
```

## Empfehlung

```text
Zuerst ein kleiner Plan-/Doku-Step:
RDAP46_ADMIN_NOTE_NEXT_SMALL_STEP_PLAN
```

Darin klaeren:

```text
Welche Funktion bringt sichtbaren Nutzen?
Welche bestehende Struktur wird erweitert?
Welche Rechte braucht der Step?
Welche Writes waeren betroffen?
Welche Safety-Gates bleiben aus?
```

## Nicht direkt als naechstes tun

```text
Kein physisches Delete.
Keine Permission-Verwaltung nebenbei.
Keine Community-Read-Anbindung fuer Admin-Notizen.
Keine Agent-/OBS-/Sound-/Overlay-/Command-Steuerung.
Keine freien Shell-/Datei-/Prozess-/URL-Ausfuehrungen.
Keine DB-Migration ohne separaten Plan.
```

## Aktueller Login-/Safety-Stand

```text
Twitch-Login aktiv/freigegeben.
twitch/start HTTP 302 ist korrekt.
twitch/callback ohne gueltigen OAuth-State HTTP 403 ist Pflicht.
Deploy-Safety akzeptiert diesen Zustand seit RDAP45B.
```

## RDAP44 bleibt abgeschlossen

```text
Admin-Notizen haben Zieluser-Auswahl.
Default bleibt ForrestCGN / tw:127709954.
Read/Create nutzen den ausgewaehlten Zieluser.
RDAP44 ist live funktional bestaetigt.
```
