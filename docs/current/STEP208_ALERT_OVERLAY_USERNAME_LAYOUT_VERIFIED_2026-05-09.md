# STEP208 – Alert Overlay Username Layout verified

Stand: 2026-05-09
Projekt: stream-control-center
Bereich: Alert-System / Overlay-Design

## Ziel

Der Username im Alert-Overlay soll bei Twitch-Bits-Alerts stabil und würdig dargestellt werden:

- kein harter Umbruch mitten im Namen
- kein `...` bei Support-Alerts
- vollständige Anzeige auch bei maximal langen Twitch-Namen
- saubere Value-Zeile: `cheert mit <amount> Bits`
- keine Änderung an TTS, Sound-System, Queue, Backend oder Alert-Regeln

## Ausgangsproblem

Bei langen Usernamen wie `CrazyMeerschweinchenTV` wurde der Name im Overlay unschön umgebrochen:

- der Name brach mitten im Wort um
- die Card wirkte unruhig
- bei langen Supporter-Namen war die Darstellung nicht angemessen

Nach dem ersten Fix wurde zwar der Umbruch verhindert, aber der Name wurde mit Ellipsis gekürzt. Das wurde verworfen, weil bei Support-Alerts der Name vollständig sichtbar bleiben soll.

## Umgesetzte Schritte

### STEP208 – Username Layout Fix

- Username/Headline als einzeilige Darstellung vorbereitet
- Bits-Value auf `cheert mit <amount> Bits` geändert
- harte Wortumbrüche reduziert

### STEP208.1 – Runtime Fit

- Username wird nach dem Rendern per JS geprüft
- Schriftgröße wird automatisch reduziert
- Value-Zeile bleibt einzeilig

### STEP208.2 – No Ellipsis

- Ellipsis für Usernamen entfernt
- Username wird stärker verkleinert, statt gekürzt zu werden
- Ziel: vollständiger Supporter-Name

### STEP208.3 – Full Username Row

- Spezialfall für sehr lange Twitch-Bits-Namen ab ca. 23 Zeichen
- linker Buchstaben-Kreis wird in diesem Fall ausgeblendet
- Username erhält die volle Kartenbreite
- Ziel: 25-Zeichen-Namen vollständig anzeigen

## Betroffene Datei

```text
htdocs/overlays/_overlay-alerts-v2.html
```

## Getestete Namen

```text
CrazyMeerschweinchenTV
CrazyMeerschweinchenTV123
```

`CrazyMeerschweinchenTV123` wurde als 25-Zeichen-Test genutzt.

## Testbefehl

```powershell
$payload = @{
  source = "twitch"
  type = "bits"
  user = "CrazyMeerschweinchenTV123"
  user_login = "crazymeerschweinchentv123"
  amount = 1500
  message = "Test mit maximal langem Usernamen. Der Name soll vollständig sichtbar bleiben."
  raw = @{
    eventsub_type = "channel.cheer"
    bits = 1500
    message = "Test mit maximal langem Usernamen. Der Name soll vollständig sichtbar bleiben."
    is_anonymous = $false
  }
} | ConvertTo-Json -Depth 20

Invoke-RestMethod `
  -Method Post `
  -Uri "http://127.0.0.1:8080/api/alerts/twitch" `
  -ContentType "application/json" `
  -Body $payload |
  ConvertTo-Json -Depth 30
```

## Kontrollbefehl

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/alerts/events?limit=1" |
  Select-Object -ExpandProperty events |
  Select-Object id, user_display, user_login, amount, message |
  ConvertTo-Json -Depth 10
```

Bestätigtes Event:

```text
user_display: CrazyMeerschweinchenTV123
user_login: crazymeerschweinchentv123
amount: 1500
```

## Erwartung im Overlay

```text
CrazyMeerschweinchenTV123
cheert mit 1500 Bits
Test mit maximal langem Usernamen. Der Name soll vollständig sichtbar bleiben.
```

Wichtig:

- kein `...`
- kein Abschneiden
- kein Umbruch im Namen
- bei sehr langen Namen darf der linke Initial-Kreis aus Platzgründen verschwinden

## Nicht geändert

- keine Backend-Logik
- keine TTS-Logik
- keine Sound-System-Logik
- keine Queue-Logik
- keine Datenbank
- keine Alert-Regeln
- keine Secrets

## Status

Der Overlay-Username-Fix gilt nach erfolgreichem 25-Zeichen-Test als abgeschlossen.

