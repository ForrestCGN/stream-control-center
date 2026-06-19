# Current Status – stream-control-center / Loyalty-Giveaways / CGN-Glücksrad

Stand: 2026-06-19

## Aktueller bestätigter Bereich

Step `LWG_BOUND_WHEEL_FIELD_COUNT_1` wurde live getestet und bestätigt.

Bestätigt:

```text
2+ verfügbare Gewinne  → normaler Glücksrad-Spin mit exakt diesen verfügbaren Feldern
1 verfügbarer Gewinn   → Codepfad vorbereitet: Direktvergabe ohne normalen Wheel-Spin
0 verfügbare Gewinne   → Codepfad vorbereitet: Claim/Spin blockiert
```

Live-Test mit Giveaway `giveaway_1781856708568_9653eba68a211017`:

```text
Vor Test: 8 Bound-Wheel-Felder, davon 7 verfügbar
Claim für urlug → Gewinn Valheim
Spin-Metadata: fieldsCount=7, visualFieldsCount=7, visualMinVisibleSlots=7
Nach Test: Roadside Research=0, Valheim=0, verfügbar=6
```

Damit ist bestätigt: Giveaway-bound Wheels werden nicht mehr optisch auf 12 Felder aufgefüllt.

## Neuer Sofort-Step

Step `LWG_GIVEAWAY_EXCLUSIONS_1` wurde vorbereitet, damit gesperrte Bot-/Mehrfachaccounts nicht gewinnen können.

Neue Config-Datei:

```text
config/loyalty_giveaway_exclusions.json
```

Fachliche Regel:

```text
User dürfen als Entry sichtbar bleiben, sind aber beim Draw nicht eligible und können dadurch nicht gewinnen.
```

Die Datei basiert auf der bereitgestellten Liste `excluded-winner.json` und enthält u. a. `login`, `displayName` und `twitchUserId`. Primär soll später über Twitch-User-ID gearbeitet werden, aktuell greift der Draw-Filter sicher über Login und, falls in Entry-Metadata vorhanden, auch über Twitch-User-ID.

## Modulversionen nach `LWG_GIVEAWAY_EXCLUSIONS_1`

```text
loyalty_giveaways: 0.1.14 / LWG_GIVEAWAY_EXCLUSIONS_1
loyalty_games:     0.2.8  / LWG_BOUND_WHEEL_FIELD_COUNT_1
```

## Wichtiger Bug-Fund

`una_solala` wurde im alten Draw als Gewinner gezogen, obwohl dieser User laut Sperrliste nicht gewinnen darf.

Beobachtung:

```text
Erster Draw: eligibleEntriesCount=5, Gewinner una_solala
Zweiter Draw nach altem Winner: eligibleEntriesCount=4, Gewinner urlug
```

Ursache: Die Sperrliste wurde beim Draw bisher nicht berücksichtigt. `LWG_GIVEAWAY_EXCLUSIONS_1` behebt genau diesen Draw-Eligibility-Teil.

## Später wieder anfassen – Dashboard-Config

Die Gewinn-Sperrliste ist heute bewusst dateibasiert, damit der Stream sicher läuft.

Später muss daraus eine dashboardfähige Verwaltung werden:

- User hinzufügen/entfernen/aktivieren/deaktivieren.
- Twitch-User-ID primär speichern und nutzen.
- Login/DisplayName als Anzeige und Fallback behalten.
- Sichtbar machen, wie viele Entries beim Draw durch Sperrliste ausgeschlossen wurden.
- Optional pro Giveaway zusätzliche Sperren erlauben.

Auch die harte Wheel-Regel muss später dashboardfähig konfigurierbar werden:

- Verhalten bei 1 verbleibendem Gewinn.
- Verhalten bei 0 verbleibenden Gewinnen.
- Exakte Feldanzahl vs. Mindestfeldanzahl getrennt für Bound-Wheels und Standalone-/Preset-Wheels.
