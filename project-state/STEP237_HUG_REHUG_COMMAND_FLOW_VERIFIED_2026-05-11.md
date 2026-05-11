# STEP237 - Hug/Rehug Command-Flow verifiziert

Stand: 2026-05-11

## Ziel

Hug/Rehug nach Dashboard-Insert-Fix und API-Analyse auch im Command-Flow pruefen und als funktionsfaehig dokumentieren.

## Gepruefte Routen

```text
GET /api/hug/routes
GET /api/hug/cmd?action=hug&actorUserId=127709954&actorLogin=forrestcgn&actorDisplay=ForrestCGN&targetLogin=testuser
GET /api/hug/cmd?action=rehug&actorUserId=127709954&actorLogin=forrestcgn&actorDisplay=ForrestCGN&targetLogin=testuser
GET /api/hug/statscmd?requesterUserId=127709954&requesterLogin=forrestcgn&requesterDisplay=ForrestCGN
GET /api/hug/top
GET /api/hug/top?mode=received
GET /api/hug/top?mode=rehug
GET /api/hug/command?command=hug&actorUserId=127709954&actorLogin=forrestcgn&actorDisplay=ForrestCGN&input0=testuser&input1=
GET /api/hug/command?command=rehug&actorUserId=127709954&actorLogin=forrestcgn&actorDisplay=ForrestCGN&input0=testuser&input1=
```

## Ergebnis

### Hug

`/api/hug/cmd?action=hug...` und `/api/hug/command?command=hug...` liefern `ok = true` und erzeugen eine Hug-Ausgabe.

Beispiel:

```text
ForrestCGN zieht testuser einfach mal ganz nah in eine schöne Umarmung 🤗
```

### Rehug

Rehug wurde korrekt blockiert, weil `testuser` ForrestCGN vorher nicht gehuggt hatte.

Das Ergebnis ist fachlich korrekt:

```text
@ForrestCGN, du kannst testuser nur rehuggen, wenn testuser dich vorher gehuggt hat.
```

### Stats

`/api/hug/statscmd` liefert `ok = true` und gibt die Stats fuer ForrestCGN aus.

### Toplisten

Alle drei Toplisten liefern `ok = true`:

```text
/api/hug/top
/api/hug/top?mode=received
/api/hug/top?mode=rehug
```

## Streamer.bot Standard-URLs

### Hug

```text
http://127.0.0.1:8080/api/hug/command?command=hug&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%
```

### Rehug

```text
http://127.0.0.1:8080/api/hug/command?command=rehug&actorUserId=%userId%&actorLogin=%userName%&actorDisplay=%user%&input0=%input0%&input1=%input1%
```

## Streamer.bot Ausgaberegel

Die API-Antwort muss beachtet werden:

```text
result.streamerbot_send = "1" -> result.streamerbot_message per Streamer.bot senden
result.streamerbot_send = "0" -> nichts zusätzlich senden
```

Im aktuellen Test war:

```text
result.sent = true
result.streamerbot_send = "0"
result.chatMessage = ""
```

Das bedeutet: Backend/Bot hat die Ausgabe bereits verarbeitet. Streamer.bot darf nicht blind zusätzlich posten, sonst drohen Doppelposts.

## Bewertung

Hug/Rehug ist nach aktuellem Stand fuer API, Dashboard-Basis, Dashboard-Create/Update/Delete fuer Chatwide-Texte und Command-Flow geprueft.

Status: **geprueft / vorlaeufig STABLE**

## Bewusst nicht geaendert

```text
backend/**
htdocs/**
config/**
data/**
app.sqlite
```

STEP237 ist ein reiner Dokumentationsabschluss fuer den Command-Flow.
