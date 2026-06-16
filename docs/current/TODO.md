# TODO – stream-control-center

Stand: 2026-06-16

## Erledigt / bestätigt

- [x] LC-CORE-LIVE-1.1 Loyalty nutzt `/api/twitch/events/stream-state` als effektive Live-Wahrheit.
- [x] LC-CORE-CLEANUP-1 alte direkte Twitch-Live-Abfrage aus Loyalty entfernt.
- [x] LC-CORE-POINTS-1 bis LC-CORE-POINTS-2C bestätigt.
- [x] Twitch Presence / aktive User für Watch-Punkte bestätigt.
- [x] Loyalty Core live geschaltet.
- [x] StreamElements-Punkteimport durchgeführt.
- [x] Shadow-Punkte geprüft: StreamElements-Import hatte die vorher im neuen System gesammelten Shadow-Punkte nicht addiert.
- [x] Shadow->Live-Migration für normale User durchgeführt.
- [x] Urlug geprüft: `balanceShadow=0`, `balanceLive=1006852`, `activeBalance=1006852`.
- [x] Tronic6 geprüft: `balanceShadow=0`, `balanceLive=12536`, `activeBalance=12536`.
- [x] Test-/Bridge-/Diagnose-User aus produktiver Migration ausgeschlossen.
- [x] Rest-Shadow-Werte für Test-/Bridge-/System-/Ignored-User gezielt genullt.
- [x] Abschlussprüfung: `candidates=0 totalShadow=0`, `excluded=0 excludedShadow=0`.
- [x] LC-CORE-LIVE-CLEANUP-2: Shadow-Modus ausgeblendet und Live-only vorbereitet.
- [x] `/api/loyalty/status` bestätigt: `mode=live`, `enabled=true`, `shadowMode=false`, `pointsState=active`, Version `0.1.24`.
- [x] LC-CORE-LIVE-CLEANUP-3: Status und Dashboard auf Aktiv/Inaktiv bereinigt.
- [x] Hauptstatus bereinigt: `streamElementsStillActive` und `importStatus` stehen nicht mehr oben im normalen Status.
- [x] Dashboard-Wording bereinigt: „Shadow-Runner“ entfernt, Punkte-Core fachlich Aktiv/Inaktiv.
- [x] Raffle produktiv als Mini-Spiel im bestehenden Modul `loyalty_giveaways.js` vorbereitet.
- [x] Dashboard-Tab `Mini-Spiele` für Raffle/Gamble aufgebaut.
- [x] Raffle-Config aus Mini-Spiele herausgezogen und unter `Loyalty -> Einstellungen -> Raffle` eingeordnet.
- [x] Raffle-Texte unter `Loyalty -> Texte -> Raffle` filterbar gemacht.
- [x] Texte-Dropdown zeigt keine globale Option `Alle Textbereiche` mehr.
- [x] Textvarianten-Tabelle zeigt nur noch den ausgewählten Bereich.
- [x] Raffle-Command-Felder aus Raffle-Config entfernt; Commands gehören langfristig ins Command-Modul.
- [x] Raffle-Teilnahmekosten backendseitig eingebaut.
- [x] Raffle-Config speichert `entryCostAmount=10` und `entryCostEnabled=true` korrekt.
- [x] Alte aktive mehrzeilige Text-Sammelvarianten in `chat_raffle`, `chat_giveaway`, `chat_ticket`, `chat_wheel` bereinigt.
- [x] Prüfung auf aktive mehrzeilige Textvarianten in `/api/loyalty/giveaways/texts` liefert keine Ausgabe.
- [x] LC-MINIGAMES-2C0: Raffle-Navigation bereinigt; Config-/Text-Sprungbuttons und Textkey-Chips aus Raffle-Bedienbereich entfernt.
- [x] LC-MINIGAMES-2C1: Raffle-Logs und Statistik eingebaut.
- [x] LC-MINIGAMES-2C1-FIX1: Raffle-Log Status und User klarer gemappt.
- [x] LC-MINIGAMES-2C1-FIX2: Raffle-Logs vollständiger gemappt; alte Gewinne sichtbar, neue Ereignisse vollständiger.
- [x] LC-MINIGAMES-2C2: Raffle-Statistik mit Sortierung und User-Auswahl eingebaut.
- [x] LC-MINIGAMES-2C3: Mini-Spiele Detail-Navigation eingebaut; nicht mehr alle Spiel-Details untereinander.
- [x] LC-MINIGAMES-2C3-FIX1: Mini-Spiel-Auswahl kompakt gemacht und funktional geprüft.

## Aktuell offen / als nächstes testen

- [ ] Raffle-Teilnahmekosten live vollständig testen:
  - [ ] `entryCostAmount=0` -> kostenloser Join.
  - [ ] `entryCostAmount>0` und genug Punkte -> Punkteabzug + Teilnahme.
  - [ ] `entryCostAmount>0` und zu wenig Punkte -> keine Teilnahme + Text über `helper_texts`.
  - [ ] Doppeltes `!join` -> keine zweite Abbuchung.
  - [ ] Raffle Cancel -> bezahlte Teilnahmen werden erstattet.
  - [ ] Normaler Raffle-Abschluss -> keine Erstattung, Gewinner erhalten Auszahlung.
- [ ] Raffle-Logs nach einem neuen echten Raffle-Lauf kontrollieren:
  - [ ] Event=Raffle, Status=Gestartet.
  - [ ] Event=Raffle, Status=Teilnahme.
  - [ ] Event=Raffle, Status=Bezahlt, wenn Kosten aktiv.
  - [ ] Event=Raffle, Status=Gewinn.
  - [ ] Event=Raffle, Status=Beendet.
  - [ ] Event=Raffle, Status=Abgebrochen/Erstattet bei Cancel.
- [ ] Raffle-Statistik nach neuem Raffle-Lauf kontrollieren:
  - [ ] Starter zählt hoch.
  - [ ] Teilnehmer zählen hoch.
  - [ ] Gewinner/Gewonnen stimmen.
  - [ ] User-Dropdown filtert korrekt.
- [ ] Design-Feinschliff Mini-Spiele später separat planen, nicht jetzt im Funktionstest.

## Nächster sinnvoller Arbeitsblock

- [ ] LC-MINIGAMES-2C4 Test/Polish nach echtem Raffle-Lauf:
  - [ ] Logs gegen tatsächlichen Chat-Ablauf prüfen.
  - [ ] Statistik gegen Logs/Transactions prüfen.
  - [ ] Beschriftungen nur wenn nötig weiter glätten.
  - [ ] Keine neue Navigation hinzufügen, wenn vorhandene Tabs reichen.

## Späterer Cleanup

- [ ] DB-Schema-Cleanup nur separat planen und erst nach vollständiger Referenzprüfung:
  - [ ] `balance_shadow`
  - [ ] `total_earned_shadow`
  - [ ] `total_spent_shadow`
- [ ] Alerts weiterhin Shadow/Diagnose beobachten, keine Produktivumschaltung ohne Freigabe.

## Nicht wieder einführen

- [ ] `/api/stream-status/status?forceApi=1` als effektive Live-Wahrheit für Module.
- [ ] Direkte Twitch-Live-Abfrage innerhalb von Loyalty.
- [ ] Lokale Loyalty-Start/Stop-Routen als Stream-Wahrheit.
- [ ] Raffle-Command-Konfiguration direkt in `Einstellungen -> Raffle`.
- [ ] Alte `raffle.*` Chatkeys als produktiven Raffle-Pfad.
- [ ] Mehrzeilige Sammelvarianten als aktive Textvarianten.
- [ ] Produktive SQLite ersetzen/neu bauen.
- [ ] Shadow-Modus als produktiven Loyalty-Betrieb wieder aktivieren.
- [ ] Technische Raffle-Unterevents als einzelne Event-Dropdown-Einträge.
- [ ] Gamble + Raffle + Statistik wieder als lange Seite untereinander anzeigen.
