# STEP273C – Command Action Types Dashboard

## Ziel

Das Commands-Dashboard wurde von technischer Router-Konfiguration auf eine besser bedienbare Action-Typ-Auswahl vorbereitet.

## Geändert

- `htdocs/dashboard/modules/commands.js`
- `htdocs/dashboard/modules/commands.css`

## Neue UI-Struktur

Im Command-Editor gibt es jetzt einen `Action-Typ` als Dropdown:

- Modul-Command
- Chat-Text posten
- Zufallstext posten
- MP3 / Sound abspielen
- Video abspielen
- HTTP / API aufrufen
- Multi-Action / Ablauf

Technische Felder wie Modul, interne Action, Methode, Ziel-URL und Response liegen jetzt im aufklappbaren Bereich `Erweitert / technische Router-Felder`.

## Wichtig

STEP273C ist bewusst nur die Dashboard-/Konfigurationsbasis.

Noch nicht enthalten:

- zentrale Medienverwaltung
- MP3-/Video-Upload
- echte Sound-/Video-Ausführung über Commands
- Zufallstext-Tab / Textgruppen-Backend
- Multi-Action-Ausführung

Diese Punkte folgen als eigene Steps, damit Commands nicht wieder zur Monsterseite werden.

## Nächste Steps

- STEP274A: zentrale Medienverwaltung Core
- STEP274B: Medienverwaltung Dashboard
- STEP274C: Commands an Medienverwaltung anbinden
