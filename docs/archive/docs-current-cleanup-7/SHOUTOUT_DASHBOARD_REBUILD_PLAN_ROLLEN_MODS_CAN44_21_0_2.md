# CAN-44.21.0.2 – Shoutout Dashboard Rebuild Plan: Rollen & Mod-Nutzung

Stand: 2026-06-04  
Scope: Ergänzung zur Planung aus CAN-44.21.0 und CAN-44.21.0.1  
Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundsatz

Das Shoutout-Dashboard ist nicht nur für den Streamer gedacht.

Mods sollen normale operative Bereiche nutzen können, ohne automatisch Zugriff auf sensible Admin-/Config-Bereiche zu bekommen.

Verbindliche Regel:

```text
Normale Bedienbereiche müssen mod-tauglich sein.
Admin-/Config-/Diagnose-Funktionen brauchen später klare Rechte.
```

---

## 2. Zielgruppen

### Streamer / Owner

Darf langfristig alles sehen und bedienen:

```text
Übersicht
Shoutout
AutoShoutout
Queues
Texte
Auswertung
Diagnose
Einstellungen
```

Zusätzlich:
- Config ändern
- produktive Schalter ändern
- sensible Diagnose sehen
- später Audit-/Admin-Funktionen nutzen

---

### Moderator / Mod-Team

Soll normale operative Bereiche nutzen können:

```text
Übersicht
Shoutout
AutoShoutout
Queues
Auswertung
```

Je nach späterer Freigabe zusätzlich:

```text
Texte teilweise
Diagnose read-only teilweise
```

Mods sollen z. B. können:

```text
manuelle Shoutouts auslösen
Queues prüfen
ggf. Queue-Einträge retry/remove ausführen, wenn freigegeben
AutoShoutout-Streamer ansehen
ggf. Streamer aktivieren/deaktivieren, wenn freigegeben
Auswertung/Verlauf ansehen
```

Mods sollen nicht automatisch können:

```text
globale Config ändern
Cooldowns/Limits ändern
Start-Szene-Sperre konfigurieren
Token-/Scope-Details vollständig sehen
sensible Admin-Diagnose sehen
Textvarianten ändern, wenn nicht explizit freigegeben
```

---

## 3. Gast / Read-only

Optional später:

```text
Übersicht read-only
Auswertung read-only
```

Keine Aktionen.

---

## 4. Tab-Bewertung nach Rollen

### Übersicht

Mod-tauglich.

```text
Owner: lesen
Mod: lesen
Gast: optional lesen
```

Keine sensiblen Details.

---

### Shoutout

Mod-tauglich.

```text
Owner: manuell auslösen
Mod: manuell auslösen, wenn freigegeben
Gast: kein Zugriff
```

Force/Override kann später separat berechtigt werden.

---

### AutoShoutout

Teilweise mod-tauglich.

```text
Owner: Status + Streamer verwalten
Mod: Status + Streamer ansehen, optional verwalten
Gast: kein Zugriff
```

Wichtig:
AutoShoutout-Config gehört nicht hierhin, sondern in Einstellungen.

---

### Queues

Mod-tauglich, aber Aktionen rechteabhängig.

```text
Owner: lesen + retry/remove
Mod: lesen + optional retry/remove
Gast: kein Zugriff
```

---

### Texte

Nicht automatisch mod-tauglich.

```text
Owner: lesen + bearbeiten
Mod: optional lesen/bearbeiten, wenn freigegeben
Gast: kein Zugriff
```

Texte können Streamwirkung haben, deshalb später eigenes Recht.

---

### Auswertung

Mod-tauglich.

```text
Owner: lesen
Mod: lesen
Gast: optional lesen
```

Keine sensiblen Tokens oder Configs.

---

### Diagnose

Nur eingeschränkt mod-tauglich.

```text
Owner: vollständige Shoutout-Diagnose
Mod: optional vereinfachte Diagnose/read-only
Gast: kein Zugriff
```

Mod-Ansicht darf z. B. zeigen:

```text
EventSub ok/nein
Scopes ok/nein
Blocker ja/nein
```

Aber nicht zwingend alle Token-/Admin-Details.

---

### Einstellungen

Owner/Admin-Bereich.

```text
Owner: lesen + später bearbeiten
Mod: normalerweise kein Zugriff oder read-only nur nach Freigabe
Gast: kein Zugriff
```

---

## 5. Rechte-/Permission-Idee für spätere Umsetzung

Spätere Rechte können granular werden:

```text
shoutout.view
shoutout.run
shoutout.force
shoutout.queues.view
shoutout.queues.manage
shoutout.auto.view
shoutout.auto.manage_streamers
shoutout.texts.view
shoutout.texts.edit
shoutout.analysis.view
shoutout.diagnostics.view
shoutout.diagnostics.sensitive
shoutout.settings.view
shoutout.settings.edit
```

Noch keine Implementierung in diesem CAN.

---

## 6. UI-Regeln für Mod-taugliche Bereiche

1. Labels klar und nicht zu technisch.
2. Gefährliche Aktionen klar kennzeichnen.
3. Config-/Admin-Aktionen nicht in normalen Betriebsbereichen verstecken.
4. Keine sensiblen Tokens, Secrets oder internen Admin-Daten in Mod-Bereichen.
5. Bei fehlenden Rechten Buttons nicht nur kaputt anzeigen, sondern ausblenden oder deaktivieren mit Hinweis.
6. Später alle Aktionen auditierbar machen.

---

## 7. Auswirkung auf den Rebuild

Beim Neuaufbau muss jeder Bereich geprüft werden:

```text
Ist das ein normaler Bedienbereich?
Ist das eine Admin-/Config-Aktion?
Ist das für Mods sinnvoll?
Braucht es eigenes Recht?
Gibt es dieselbe Information schon in einem anderen Tab?
```

Diese Prüfung ist ab CAN-44.21.1 verbindlich.
