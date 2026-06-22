# Tagebuch-Modul


## HT2.8 – Stream-State für Eintragsfreigabe

Das Tagebuch nutzt für `requireActiveStreamForEntries` nun zusätzlich den zentralen Stream-State aus `twitch_events.getStreamState()`.
Wenn der zentrale Stream-State `live` meldet, dürfen Tagebuch-Einträge geschrieben werden, auch wenn der alte Tagebuch-interne `active_stream`-Wert noch `false` ist. Falls der zentrale Stream-State nicht verfügbar ist, bleibt der bisherige Tagebuch-State als Fallback erhalten.

Damit kann der Stream-State-Override für kontrollierte Tests genutzt werden, ohne die Tagebuch-Schutzregel abzuschalten.
