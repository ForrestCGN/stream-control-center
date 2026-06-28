# START HERE FOR NEW CHAT

Aktueller Stand: `0.2.10I - Modboard Online/Lokal Architekturregel dokumentiert`.

Verbindlich:

```text
Remote-Modboard ist die einzige UI-Wahrheit.
Lokales Dashboard-v2 ist dieselbe Remote-Modboard-App im lokalen Runtime-Profil.
Keine zweite lokale UI, keine separate lokale Navigation, kein eigenes lokales Design.
```

## Zugangsregel

```text
Mods:
immer https://mods.forrestcgn.de/

Forrest/Engel zuhause:
lokal am Streaming-PC/LAN ueber /dashboard-v2

Forrest/Engel unterwegs:
online ueber https://mods.forrestcgn.de/
```

## Brueckenregel

```text
Alles, was den Streaming-PC aktiv betrifft, laeuft am Ende ueber den Stream-PC-Agent.
Der Agent ist der zentrale Executor fuer Stream-PC-Aktionen.
Der Webserver ist die sichere Online-Tuer fuer Mods.
```

## Sync-Regel

```text
User/Rechte duerfen lokal und online geaendert werden.
Beide Seiten synchronisieren sich.
Sperren/Entzug von Rechten muessen online sofort wirken.
Der lokale Stand wird ueber den Agent nachgezogen, sobald verbunden.
```

## Stand 0.2.10H

0.2.10H repariert den Fehler aus 0.2.10G, bei dem CSS/JS nicht geladen wurden. Der lokale Adapter liefert oder leitet Remote-Modboard-Assets fuer `/assets/...` und `/dashboard-v2/assets/...` weiter.

## Stand 0.2.10I

0.2.10I ist Doku-only. Es dokumentiert die Zielarchitektur: eine UI, zwei Zugangswege, Agent als zentraler Executor, Rechte/User-Sync zwischen Online und Lokal.

Weiterarbeit: Erst 0.2.10H Sichttest/stepdone abschliessen. Danach keine neue lokale UI bauen, sondern Module nur noch runtime-faehig fuer Online und Lokal planen.
