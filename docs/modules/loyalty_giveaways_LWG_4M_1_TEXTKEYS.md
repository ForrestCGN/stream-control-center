# LWG-4M.1 geplante Textkeys

Neue oder zu prüfende Textkeys:

## Giveaway Workflow
- `giveaway.closed`
- `giveaway.close_failed`
- `giveaway.draw_started`
- `giveaway.draw_no_entries`
- `giveaway.draw_winner`
- `giveaway.draw_wheel_permission_created`
- `giveaway.draw_not_closed`
- `giveaway.entries_closed`

## Beispieltexte

### giveaway.closed
```text
Die Lostrommel wird jetzt versiegelt. Keine neuen Tickets mehr – die Heimleitung zählt gleich aus.
```

### giveaway.draw_not_closed
```text
Erst wird die Lostrommel geschlossen, dann wird ausgelost. Ordnung muss sein.
```

### giveaway.draw_no_entries
```text
Die Heimleitung hat in die Trommel geschaut: Kein einziges Ticket drin.
```

### giveaway.draw_wheel_permission_created
```text
{winner}, du hast gewonnen. Dein Rad-Freigabeschein liegt bereit – mit !wheel oder !rad darfst du drehen.
```

Alle Texte müssen DB-/helper_texts-basiert und variantenfähig bleiben.
