# LWG-EVENING-COPY-EXCLUDE-1

Ziel: Heute Abend Giveaway/Glücksrad stabil nutzbar machen, ohne Backend-Großumbau.

## Enthalten

- `htdocs/dashboard/modules/loyalty_giveaways.js`
  - sichtbarer Button **Kopieren** in wichtigen Giveaway-Ansichten
  - nutzt vorhandene Backend-Route `POST /api/loyalty/giveaways/:giveawayUid/copy`

- `htdocs/dashboard/modules/loyalty_giveaways.css`
  - unverändert mitgeliefert, damit die Dashboard-Dateien zusammen bleiben

- `tools/lwg_resolve_excluded_winners.ps1`
  - löst die Gewinn-Ausschlussliste über vorhandene Twitch-Route `/api/twitch/user/resolve?login=...` auf
  - schreibt eine JSON-Datei mit `login`, `displayName`, `twitchUserId`

- `tools/lwg_apply_winner_exclusion_to_entries.js`
  - setzt für ausgeschlossene aktive Teilnehmer eines konkreten Giveaways `ticket_weight = 0`
  - Teilnehmer bleiben sichtbar, können aber von der bestehenden Draw-Logik nicht gezogen werden
  - direkt vor dem Ziehen erneut ausführen, falls später noch jemand joined

## Gewinn-Ausschlussliste

una_solala, crazy_gamming_network, profi_dieb_muerte, feuerstern_56, ninety8nine, ursulaaaaaana, fresche_gedanken, scavliwei, psychologin_ttv, sangre_roja_que_fluye

## Einspielen

ZIP ab Repo-Root entpacken.

Danach:

```powershell
.\stepdone.cmd "LWG-EVENING-COPY-EXCLUDE-1 Giveaway kopieren und Gewinn-Ausschluss Notfalltools"
```

Wenn Dashboard-Dateien live deployed werden müssen, danach wie üblich deployen/Node bzw. Browser reloaden.

## Twitch-IDs auflösen

```powershell
cd D:\Git\stream-control-center
.\tools\lwg_resolve_excluded_winners.ps1
```

Die erzeugte Datei heißt z.B. `lwg_excluded_winners_resolved_20260619_123456.json`.

## Gewinn-Ausschluss auf ein Giveaway anwenden

Giveaway-UID aus Dashboard/API nehmen, dann:

```powershell
cd D:\Git\stream-control-center
node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=DEINE_GIVEAWAY_UID --list=.\lwg_excluded_winners_resolved_YYYYMMDD_HHMMSS.json
```

Testlauf ohne Änderung:

```powershell
node .\tools\lwg_apply_winner_exclusion_to_entries.js --giveaway=DEINE_GIVEAWAY_UID --list=.\lwg_excluded_winners_resolved_YYYYMMDD_HHMMSS.json --dry-run
```

Wichtig: Direkt vor **Teilnahme schließen / Gewinner ziehen** nochmal ausführen.
