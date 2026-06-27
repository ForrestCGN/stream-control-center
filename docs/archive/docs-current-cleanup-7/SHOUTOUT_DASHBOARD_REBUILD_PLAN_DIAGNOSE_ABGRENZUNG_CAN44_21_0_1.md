# CAN-44.21.0.1 – Shoutout Dashboard Rebuild Plan: Diagnose-Abgrenzung

Stand: 2026-06-04  
Scope: Ergänzung zur Planung aus CAN-44.21.0  
Keine Code-, Backend-, DB- oder Runtime-Änderung.

---

## 1. Grundsatz

Im Dashboard gibt es bereits einen übergeordneten Admin-/Diagnosebereich.

Deshalb darf der Shoutout-Diagnose-Tab **keine zweite allgemeine Systemdiagnose** werden.

Verbindliche Regel:

```text
Admin-Diagnose = systemweite Diagnose
Shoutout-Diagnose = nur Shoutout-fachliche Diagnose
```

Keine Doppelung von Registry-, Modul-, Health- oder globalen Backend-Diagnosen im Shoutout-Dashboard.

---

## 2. Admin-Diagnose bleibt zuständig für

Der Admin-/Diagnosebereich ist die zentrale Stelle für:

```text
Systemweiter Backend-Status
Diagnose-Registry
Registry-Coverage
loadedModules / missingLoadedModules
Routen- und Modulübersicht
allgemeine Healthchecks
globale API-/Backend-Probleme
Communication Bus / EventBus Diagnose
systemweite Recovery-/Statusübersicht
```

Diese Inhalte werden **nicht** im Shoutout-Diagnose-Tab nachgebaut.

---

## 3. Shoutout-Diagnose ist zuständig für

Der Shoutout-Diagnose-Tab zeigt nur Diagnosen, die direkt für das Shoutout-System relevant sind:

```text
Twitch OAuth / User-Token für Shoutouts
benötigte Twitch-Scopes
EventSub Shoutout-Subscriptions
channel.shoutout.receive
channel.shoutout.create
Live-Gate für Official Shoutout
Produktionscheck für Shoutout-Betrieb
Live-Test / echte beobachtete Shoutout-Events
Shoutout-spezifische Blocker
Shoutout-spezifische Warnungen
```

Ziel ist: Forrest soll im Shoutout-Modul sehen können, warum Shoutouts nicht funktionieren oder nicht produktionsbereit sind.

---

## 4. Was NICHT in Shoutout-Diagnose gehört

```text
allgemeine Moduldiagnose
allgemeine Diagnostics Registry
Coverage-Tabellen
globale Module-Healthchecks
vollständige Routenlisten
alle Backend-Module
Admin-Systemstatus
allgemeine Recovery-Diagnose
EventBus-Gesamtübersicht
```

Falls solche Informationen nötig sind, zeigt der Shoutout-Diagnose-Tab höchstens einen kurzen Hinweis:

```text
Für systemweite Diagnose siehe Admin > Diagnose.
```

Kein Duplikat der Admin-Ansicht.

---

## 5. Auswirkung auf Zieltab „Diagnose“

Der Shoutout-Tab „Diagnose“ bleibt bestehen, aber mit engem Scope:

```text
Diagnose
├─ Produktionscheck
│  ├─ OAuth / Token
│  ├─ Scopes
│  ├─ EventSub-Verbindung für Shoutouts
│  └─ Shoutout-Subscriptions
├─ Live-Test
│  ├─ Testplan
│  ├─ beobachtete Shoutout-Events
│  └─ Empfehlung
└─ Blocker & Warnungen
   ├─ nur Shoutout-spezifisch
   └─ kein globaler Admin-Diagnose-Dump
```

---

## 6. Neue verbindliche Doppelungsregel

Für den Shoutout-Dashboard-Rebuild gilt zusätzlich:

```text
Diagnose-Daten werden nur dort detailliert gezeigt, wo sie fachlich hingehören.
Systemweite Diagnose bleibt im Admin-Bereich.
Shoutout-Diagnose zeigt nur Shoutout-spezifische Diagnose.
```

Kurzzusammenfassungen sind erlaubt, wenn sie Orientierung geben.

Beispiel erlaubt:

```text
EventSub: verbunden
Scopes: OK
Blocker: 0
```

Beispiel nicht erlaubt:

```text
vollständige diagnostics registry
loadedModules-Liste
missingLoadedModules-Tabelle
alle Modulrouten
```

---

## 7. Umsetzungshinweis für spätere CAN-Steps

Bei CAN-44.21.8 „Diagnose neu gruppieren“ muss diese Abgrenzung geprüft werden.

Prüffragen:

```text
Ist diese Information Shoutout-spezifisch?
Wird sie bereits im Admin-Diagnosebereich angezeigt?
Ist hier nur eine kurze Zusammenfassung nötig?
Wäre ein Link/Hinweis auf Admin > Diagnose ausreichend?
```

Wenn die Antwort „nicht Shoutout-spezifisch“ lautet, gehört der Inhalt nicht in den Shoutout-Diagnose-Tab.
