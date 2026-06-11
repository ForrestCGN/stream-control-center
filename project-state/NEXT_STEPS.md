# NEXT_STEPS – stream-control-center

Stand: 2026-06-11

## Direkt nächster sinnvoller Schritt

```text
STEP212 / LWG-5.4 – Points Command Runtime kontrolliert testen/freigeben
```

Ziel: Nicht sofort alles aktivieren, sondern zuerst kontrolliert prüfen, ob `!punkte` / `!points` über die Runtime korrekt antwortet.

## Reihenfolge

### 1. STEP210 übernehmen und StepDone ausführen

Falls noch nicht erledigt:

```cmd
.\stepdone.cmd "STEP210 / LWG-5.2 Loyalty API- und Status-Cleanup"
```

Danach Backend neu starten.

### 2. STEP211 Doku übernehmen und StepDone ausführen

Nach Entpacken dieses Doku-Pakets:

```cmd
.\stepdone.cmd "STEP211 / LWG-5.3 Loyalty Safety + Gamble Prepared Dokumentation"
```

### 3. Status nach STEP210/STEP211 kurz prüfen

Nur kleine Ausgaben:

```powershell
$base = "http://127.0.0.1:8080"

Invoke-RestMethod "$base/api/loyalty/status" |
  Select-Object module,version,mode,enabled,currencyName,streamElementsStillActive

Invoke-RestMethod "$base/api/loyalty/games/status" |
  Select-Object module,moduleVersion,moduleBuild,enabled,eventBusReady,lastError
```

### 4. Points Runtime testen, ohne Chat-Command freizugeben

Vor Freigabe nur direkte Runtime/API oder Command-Test-Route verwenden.

Zu prüfen:

```text
- !punkte ohne Target zeigt verfügbare Kekskrümel + Rang.
- !punkte @user wird für normale User blockiert oder nicht erlaubt.
- !punkte @user funktioniert für Mod/Streamer-Kontext.
- !givepoints ist nur mod/streamerfähig.
- !setpoint ist nur streamerfähig.
- Alle Texte kommen über DB/Textvarianten.
```

### 5. Erst danach Command-Aktivierung planen

Nicht sofort alles aktivieren.

Empfohlen:

```text
1. zuerst !punkte / !points aktivieren
2. im Chat prüfen
3. danach !givepoints testen
4. danach !setpoint testen
5. erst später !gamble vorbereiten
```

## Danach

Wenn Points sauber laufen:

```text
STEP213 / LWG-5.5 – Gamble Shadow-Test mit Dummy-Usern
```

Ziel:

```text
- Gamble per API/Runtime im Shadow-Modus testen.
- Percent-Einsatz prüfen.
- Insufficient Balance prüfen.
- Cooldown prüfen.
- Buchungs-/Transaktionshistorie prüfen.
- Ergebnis nicht vorhersagbar, serverseitig.
```

## Später vorgemerkt

```text
Duell: !duell @user 100 / !annehmen / !ablehnen
Raffle: !raffle [points] [duration] / !join / !cancelraffle
Roulette: später eigenes Farb-Roulette, nicht Teil von Gamble
```
