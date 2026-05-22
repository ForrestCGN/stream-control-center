# STEP_BIRTHDAY_008 – Birthday Command/Overlay Cleanup

Stand: 2026-05-22

## Ziel

Drei konkrete Birthday-Probleme bereinigen:

1. Birthday-Command-Ausgaben dürfen nicht mehrere Textvarianten gleichzeitig posten.
2. `!birthday party @user` darf nur von Mods/Broadcaster/Owner oder konfigurierter Allowlist gestartet werden.
3. Das interne Overlay-Szenenlabel wie `HEART RAIN` darf im normalen Overlay nicht sichtbar sein.

## Betroffene Dateien

```text
backend/modules/birthday.js
backend/modules/commands.js
htdocs/overlays/_overlay-birthday.html
project-state/STEP_BIRTHDAY_008.md
project-state/CURRENT_STATUS.md
project-state/CHANGELOG.md
project-state/FILES.md
project-state/NEXT_STEPS.md
docs/current/CURRENT_SYSTEM_STATUS.md
```

## Änderungen

### backend/modules/birthday.js

- `renderText()` wählt aus mehrzeiligen Legacy-/Variantenwerten genau eine nicht-leere Zeile zufällig aus.
- Dadurch wird verhindert, dass alte DB-Textwerte mit mehreren Varianten als mehrere Chatnachrichten gepostet werden.
- `commandContext()` übernimmt jetzt Rolleninformationen aus dem Command-Payload: `isBroadcaster`, `isMod`, `isVip`, `isSubscriber` und `badges`.
- `canStartParty()` erlaubt Birthday-Partys nur noch für Broadcaster/Owner, Mods oder Logins aus `show.allowedLogins`.
- Normale User-Commands wie `!birthday set`, `!birthday show` und `!birthday delete` bleiben unverändert erlaubt.

### backend/modules/commands.js

- Das zentrale Command-System gibt Rolleninformationen an Zielmodule weiter.
- Ergänzt wurden `userId`, `badges`, `isBroadcaster`, `isOwner`, `isMod`, `isModerator`, `isVip` und `isSubscriber`.
- Das Command-System selbst bleibt unverändert: Parsing, Cooldowns, Permission-Level und Ausführung wurden nicht umgebaut.

### htdocs/overlays/_overlay-birthday.html

- Das interne Szenenlabel (`HEART RAIN`, `CONFETTI STORM` usw.) ist standardmäßig ausgeblendet.
- Das Label wird nur noch im Debug-Modus per `?debug=1` sichtbar.

## Bewusst nicht geändert

- Keine DB-Migration.
- Keine neuen Tabellen.
- Keine Dashboard-Änderung.
- Keine Sound-System-Änderung.
- Keine Birthday-Show-Queue-Änderung.
- Keine Twitch-Presence-Änderung.
- Keine Helper umgebaut.
- Keine Funktionalität entfernt.

## Tests

Lokale Syntaxchecks:

```powershell
node --check backend/modules/birthday.js
node --check backend/modules/commands.js
```

Overlay-Script wurde aus der HTML extrahiert und ebenfalls mit Node geprüft.

## Live-Test nach Deployment

```powershell
Invoke-RestMethod "http://127.0.0.1:8080/api/birthday/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/commands/status"
Invoke-RestMethod "http://127.0.0.1:8080/api/twitch/presence/status"
```

Chat-Test:

```text
!birthday set 16.08.1974
!birthday show
!birthday party @ForrestCGN
```

Erwartung:

- `!birthday set` postet nur eine Textvariante.
- `!birthday party @user` funktioniert für Mods/Broadcaster.
- `!birthday party @user` wird für normale User abgelehnt.
- Im normalen Birthday-Overlay ist kein `HEART RAIN` sichtbar.
- Mit `/overlays/_overlay-birthday.html?debug=1` bleibt das Debug-Label sichtbar.
