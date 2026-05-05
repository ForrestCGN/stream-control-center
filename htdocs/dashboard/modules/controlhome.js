(function(){
  const root = document.getElementById('controlhomeModule');
  if (!root) return;

  const modules = [
    { id:'alerts', label:'Alerts V2', status:'aktiv', text:'Twitch/Ko-fi/Tipeee Alerts, Regeln, Designs, Texte, Sounds.', open:'alerts' },
    { id:'obs', label:'OBS', status:'aktiv', text:'Szenen, Quellen, Stats und Detailansicht.', open:'obs' },
    { id:'overlays', label:'Overlays', status:'geplant', text:'Start/Pause/Ende, Overlay-Vorschau und Stream-Ausgabe.' },
    { id:'system', label:'System', status:'vorbereitet', text:'Sound-System, TTS, Bot-Systeme, Message-Rotator, Automationen, Integrationen.' },
    { id:'community', label:'Community', status:'teilaktiv', text:'Hug, VIP, Tagebuch und Todo sind aktiv; Chat-Overlay, Deathcounter, Challenges und Commands sind vorbereitet.', open:'tagebuch' },
    { id:'admin', label:'Rollen & Rechte', status:'vorbereitet', text:'User, Mod, SuperMod, Streamer, Local Admin, Owner.' }
  ];

  function render(){
    root.innerHTML = `
      <div class="module-grid controlhome-grid">
        <section class="card glass span-12 controlhome-hero">
          <span class="role-badge">Control-Bereich</span>
          <h2>Übersicht</h2>
          <p>Hier werden die Module konfiguriert. Live-Bedienung bleibt getrennt im Stream-Desk, Systemfunktionen liegen im System-Bereich; sensible Verwaltung bleibt im Admin-Bereich.</p>
        </section>
        <section class="card glass span-12">
          <h2>Module</h2>
          <div class="controlhome-modules">
            ${modules.map(m => `
              <article class="quick-card controlhome-module-card">
                <div class="controlhome-module-head"><h3>${window.CGN.esc(m.label)}</h3><span class="pill">${window.CGN.esc(m.status)}</span></div>
                <p>${window.CGN.esc(m.text)}</p>
                ${m.open ? `<button data-open-module="${window.CGN.esc(m.open)}">Öffnen</button>` : '<button disabled>Noch nicht aktiv</button>'}
              </article>`).join('')}
          </div>
        </section>
        <section class="card glass span-12">
          <h2>Feste Rechte-Regel</h2>
          <div class="placeholder-note">Mods/SuperMods dürfen über das Dashboard bei Twitch nur Aktionen ausführen, die ihr eigener Twitch-Account im Kanal auch ausführen darf. Dashboard-Rollen erweitern keine Twitch-Rechte. Jede Mod-Aktion wird geloggt.</div>
        </section>
      </div>`;
    root.querySelectorAll('[data-open-module]').forEach(btn => btn.addEventListener('click', () => window.CGN.setActiveModule(btn.dataset.openModule)));
  }

  async function loadAll(){ render(); }
  window.addEventListener('cgn:module-show', event => { if (event.detail?.module === 'controlhome') loadAll(); });
  window.ControlHomeModule = { loadAll };
  loadAll();
})();
