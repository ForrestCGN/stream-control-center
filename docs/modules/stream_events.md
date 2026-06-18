# Stream Events – EVS52.20 Winner Finale No Restart Loop

EVS52.20 korrigiert nur das Winner-Finale-Overlay.

Das Overlay darf ein bereits sichtbares aktives Finale nicht erneut rendern, wenn derselbe Finale-State durch Poll oder Bus nochmal ankommt. Dadurch wird verhindert, dass die Reveal-Timeline immer wieder von vorne startet und Header wie „Glückwunsch“, „Platz 1“, „Platz 2“ wiederholt eingeblendet werden.

Manuelles Beenden aus EVS52.19 bleibt gültig: Das Finale bleibt sichtbar, bis der Ende-Button/Ende-Event es explizit ausblendet.
