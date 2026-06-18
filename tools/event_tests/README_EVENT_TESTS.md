# Event-System Test-Scripts

Ziel: Testevent erstellen, falsche/richtige Antworten simulieren, Ranking auffüllen, Event beenden und Winner-Finale/Auswertung starten.

## Vorbereitung

Node muss laufen:

```powershell
http://127.0.0.1:8080
```

Optional andere Base-URL:

```powershell
$env:EVS_BASE_URL = "http://127.0.0.1:8080"
```

## Reihenfolge manuell

```powershell
cd D:\Git\stream-control-center\tools\event_tests

.\01_backend_check.ps1
.\02_create_combined_test_event.ps1
.\03_prepare_sound_round.ps1
.\04_send_wrong_answers.ps1
.\05_send_correct_text_answers.ps1
.\06_seed_ranking_10_users.ps1
.\07_finish_event.ps1
.\08_start_finale.ps1
```

## Alles in einem

```powershell
.\09_full_flow_test.ps1
```

## Aufräumen

```powershell
.\10_cleanup_sound_test_state.ps1
```

## Overlay

Während des Finale-Tests offen lassen:

```text
http://127.0.0.1:8080/overlays/stream_events/event_winner_overlay.html?v=4935
```

## Sicherheit

Die Scripts nutzen vorhandene Test-Helper-Routen mit `confirm=1`.
Sie legen Testevents mit Test-Markierung an und senden nichts direkt in Twitch.
