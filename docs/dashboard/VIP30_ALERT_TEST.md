# VIP30 Dashboard – Alert-Test

Stand: 2026-06-06  
STEP: 8.18.2

## Button

Im Dashboard-Tab `Aktionen`:

```txt
VIP30 Alert testen
```

## Testuser

Neu gibt es ein Eingabefeld:

```txt
Anzeigename/Login zum Auflösen
```

Beispiele:

```txt
AkiGhosty
ForrestCGN
EngelCGN
```

Der Name wird an den Backend-Testendpunkt übergeben. Das Backend versucht, daraus über Twitch `/helix/users` den echten Avatar zu laden.

## Rückmeldung

Nach dem Test zeigt das Dashboard:

```txt
User
Avatar: geladen / Fallback / Fehlergrund
Sound
Textset
Dauer
```
