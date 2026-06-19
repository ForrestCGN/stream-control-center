# LWG_CHAT_OUTPUT_1 – Chat-Ausgabe für Ticket/Wheel-Commands

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

## Ziel

`!ticket` sowie `!wheel`/`!rad` sind seit `LWG_CHAT_COMMANDS_1` aktiv und werden fachlich verarbeitet. Dieser Step ergänzt die direkte Chat-Ausgabe für die bereits vorhandenen Runtime-Textvarianten.

## Geändert

Datei:

```text
backend/modules/loyalty_giveaways.js
```

Änderungen:

```text
MODULE_VERSION = 0.1.17
MODULE_BUILD   = LWG_CHAT_OUTPUT_1
```

`buildCommandRuntimeResponse()` sendet direkte Chatmeldungen nun für Message-Keys mit diesen Präfixen:

```text
raffle.*
ticket.*
wheel.*
```

Die Texte werden weiterhin über die vorhandenen Text-/Message-Helper gerendert. Es wurden keine neuen hartcodierten Chattexte ergänzt.

## Nicht geändert

```text
!join / !raffle bleiben Raffle-Commands
Draw-Logik unverändert
Wheel-/Bound-Wheel-Logik unverändert
Exclusion-/Sperrlistenlogik unverändert
DB-Schema unverändert
Dashboard unverändert
Testscript unverändert
```

## Erwartetes Verhalten

Bei erfolgreichem `!ticket` kommt eine vorhandene `ticket.success`-Variante im CGN-/Altersheim-/Rentner-Stil in den Chat.

Bei erfolgreichem `!wheel` oder `!rad` kommt eine vorhandene `wheel.success`-Variante in den Chat.

Fehlerfälle wie `ticket.no_active`, `ticket.invalid_amount`, `wheel.no_permission` werden ebenfalls über vorhandene Varianten ausgegeben.

## Test nach Deployment

1. Backend neu starten.
2. Giveaway öffnen.
3. Mit einem Testuser im Chat `!ticket` schreiben.
4. Erwartung: Entry wird erstellt und eine Chatantwort erscheint.
5. Nach Draw mit Gewinner `!wheel` oder `!rad` schreiben.
6. Erwartung: Wheel-Claim startet und eine Chatantwort erscheint.

## StepDone

```powershell
.\stepdone.cmd "LWG CHAT OUTPUT 1 - Ticket und Wheel Chatmeldungen aktiviert"
```
