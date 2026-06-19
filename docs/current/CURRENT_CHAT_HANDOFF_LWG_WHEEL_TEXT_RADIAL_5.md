# Current Chat Handoff – LWG Wheel Text Radial 5

Datum: 2026-06-19
Projekt: stream-control-center / Loyalty-Giveaways / Giveaway-bound CGN-Glücksrad
Arbeitsstand: Nach Overlay-Isolation, radialem Wheel-Textlayout und Regression-Test

## Kurzstatus

Das Giveaway-bound Wheel-System ist backendseitig und overlayseitig im aktuellen Teststand grün. Der letzte bestätigte Overlay-Step ist:

```text
LWG-WHEEL-TEXT-RADIAL-5
```

## Bestätigt

- Giveaway-Kopie wird im Dashboard angezeigt.
- Kopieren-Button ist auch bei Entwürfen sichtbar.
- Beim Kopieren wird das gebundene Giveaway-Glücksrad mitkopiert.
- Die Kopie hat ein eigenes Bound-Wheel.
- Die Kopie hatte initial 8 Felder.
- Open → Entries → Close → Draw funktioniert.
- Wheel-Permission wird erzeugt.
- Wheel-Claim funktioniert.
- Spin wird serverseitig erzeugt.
- Winner wird auf `wheel_completed` gesetzt.
- Ergebnisfeld wird im Winner gespeichert.
- Bound-Wheel-Feld `quantityRemaining` wird reduziert.
- Bus/WS liefert den Spin an das Overlay.
- Wheel-Overlay bleibt initial unsichtbar.
- Wheel-Overlay blendet bei Spin ein.
- Wheel-Overlay zeigt Ergebnis und blendet automatisch aus.
- Winner-/Finale-Overlay bleibt beim Wheel-Spin aus.
- Segmenttexte laufen radial mit dem Segment.
- `€` wird korrekt angezeigt.
- Gewinnerbanner zeigt keinen Subtext wie `Steam Key` oder `Guthaben`.
- Lange Namen sind im Gewinnerbanner akzeptabel kleiner.

## Getestete IDs

```text
Giveaway:          giveaway_1781856708568_9653eba68a211017
Bound-Wheel:       giveawaywheel_1781856708568_839fb2b118fc40a3
Winner:            winner_1781857541326_7414ce0176034b92
Permission:        wheelperm_1781857541331_8b32049906e5064d
Echter Spin:       spin_1781857621153_3d98fd8542116333
Echter Gewinn:     Roadside Research
Regression Spin:   wheel_1781861576417_d4d3504840212e5e
Regression Gewinn: Valheim
```

## Letzter Statuscheck

`loyalty_giveaways`:

```text
ok=True
module=loyalty_giveaways
moduleVersion=0.1.12
enabled=True
lastError=
```

`loyalty_games`:

```text
ok=True
module=loyalty_games
moduleVersion=0.2.7
enabled=True
lastError=
```

Wheel:

```text
ok=True
enabled=True
running=False
lastError=
lastResult.selectedFieldLabel=Valheim
lastResult.finishedAt=2026-06-19T09:33:03.432Z
```

## Durchgeführte Overlay-Steps im Chat

```text
LWG_WINNER_OVERLAY_ISOLATION_1
LWG_WHEEL_TEXT_RADIAL_1
LWG_WHEEL_TEXT_RADIAL_2
LWG_WHEEL_TEXT_RADIAL_3
LWG_WHEEL_TEXT_RADIAL_4
LWG_WHEEL_TEXT_RADIAL_5
```

## Aktuelle fachliche Entscheidung – Feldanzahl

Für Giveaway-bound Wheels gilt künftig:

```text
2+ verfügbare Gewinne  → normaler Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → kein normales Rad mehr, letzter Gewinn direkt vergeben / separates Letzter-Gewinn-Overlay
0 verfügbare Gewinne   → Claim/Spin blockieren
```

## Aktuelle Auffälligkeit – 12 sichtbare Felder

Im Test lieferte das Bound-Wheel 8 Felder. Da `Roadside Research` bereits gewonnen wurde, waren fachlich 7 Felder verfügbar. Der Spin zeigte in der Metadata:

```text
fieldsCount=7
visualFieldsCount=12
```

Das bedeutet: Fachlich wird offenbar mit 7 verfügbaren Feldern gezogen, aber visuell wird auf 12 Slots aufgefüllt. Für Giveaway-bound Wheels soll das weg.

Wichtig: Die hochgeladene Live-`loyalty_games.json` enthält kein `minVisibleSlots`. Der Wert 12 kommt vermutlich aus Backend-Default/Fallback, nicht aus der Live-Config.

## Nächster technischer Schritt im neuen Chat

Erst echte Dateien prüfen:

```text
backend/modules/loyalty_games.js
backend/modules/loyalty_games/wheel.js
backend/modules/loyalty_giveaways.js
config/loyalty_games.json
```

Dann planen:

- Wie `minVisibleSlots`/Auffülllogik bei Giveaway-bound Wheels deaktiviert wird.
- Wie bei 1 verbleibendem Gewinn direkt vergeben wird.
- Wie bei 0 verbleibenden Gewinnen sauber blockiert wird.

Nicht direkt umbauen. Erst Datei-/Repo-Stand prüfen, Ziel/Dateien/Tests nennen und auf `go` warten.

## Weitere offene Punkte

- Reset-/Hide-Test: Route `/api/communication-bus/publish` existiert nicht. Echte Diagnose-/Test-Route finden oder geschützte Dashboard-Testfunktion ergänzen.
- Exclusion/Ausschlussliste sauber ins Dashboard integrieren.
- `!gamble` Alias-Bug separat prüfen (`[object`, `object]`).
- Test-Giveaway nach Abschluss löschen oder als Test markieren.
