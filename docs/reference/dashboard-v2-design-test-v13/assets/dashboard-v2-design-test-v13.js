const body = document.body;
const navToggle = document.getElementById('navToggle');
const scrim = document.getElementById('scrim');
const sectionLabel = document.getElementById('sectionLabel');
const pageTitle = document.getElementById('pageTitle');
const heroTitle = document.getElementById('heroTitle');
const heroText = document.getElementById('heroText');
const root = document.getElementById('viewRoot');

let currentSection = 'Live';
let currentModule = 'Übersicht';
let currentTab = 'Dashboard';

function updateScrollState(){
  body.classList.toggle('is-scrolled', window.scrollY > 8);
}
window.addEventListener('scroll', updateScrollState, {passive:true});
updateScrollState();

function setTopbar(section, module, tab){
  currentSection = section || currentSection || 'Dashboard';
  currentModule = module || currentModule || 'Übersicht';
  currentTab = tab || currentTab || 'Übersicht';

  sectionLabel.textContent = currentSection;
  pageTitle.innerHTML = `${currentModule}<span class="tab-part">${currentTab}</span>`;
}

function setPageHeader(eyebrow, title, text){
  const header = document.querySelector('.page-header');
  if (header) header.classList.add('module-page-header');
  const eyebrowEl = document.querySelector('.page-header .cgn-eyebrow');
  if (eyebrowEl) eyebrowEl.textContent = eyebrow || 'Dashboard v2';
  heroTitle.textContent = title;
  heroText.textContent = text;
}

function metricCard(label, value, detail, pct, warn=false) {
  return `<article class="cgn-card metric-card"><span>${label}</span><strong>${value}</strong><small>${detail}</small><div class="cgn-progress ${warn ? 'cgn-progress--warn' : ''}"><i style="width:${pct}%"></i></div></article>`;
}
function metrics(items) {
  return `<section class="metric-grid">${items.map(x => metricCard(...x)).join('')}</section>`;
}
function moduleTabs(items, active){
  return `<nav class="module-tabs" aria-label="Modulnavigation">${items.map(item => `<button class="module-tab ${item === active ? 'is-active' : ''}" data-tab="${item}">${item}</button>`).join('')}</nav>`;
}
function note(title, text, chip='Modul-Navi'){
  return `<section class="module-layout-note cgn-card"><div class="module-note-copy"><b>${title}</b><br>${text}</div><span class="cgn-chip cgn-chip--info">${chip}</span></section>`;
}
function adminNote(){
  return `<div class="admin-lock-note"><i>!</i><div><strong>Technische Details bleiben im Admin.</strong><span>Normale Streamer-/Mod-Seiten zeigen nur Status, wichtige Aktionen, Verlauf und einfache Optionen. Tiefe Config, Debug, Rohdaten und gefährliche Aktionen liegen in Admin.</span></div></div>`;
}
function chartCard() {
  return `<article class="cgn-card chart-card span2">
    <div class="card-head"><div><p class="cgn-eyebrow">Statistik</p><h2>Stream-Aktivität</h2></div><span class="cgn-chip cgn-chip--ok">+23%</span></div>
    <div class="fake-chart">
      <svg class="line-svg" viewBox="0 0 900 260" preserveAspectRatio="none">
        <path d="M0,180 C80,40 120,250 210,155 C300,65 330,230 430,128 C535,20 565,230 660,150 C740,80 775,235 900,68" fill="none" stroke="#1bd8ff" stroke-width="8" stroke-linecap="round"/>
        <path d="M0,205 C140,210 175,140 270,125 360,110 420,80 490,48 C560,190 620,150 700,115 C760,80 820,200 900,95" fill="none" stroke="#6d38ff" stroke-width="8" stroke-linecap="round"/>
      </svg>
      <div class="chart-labels"><span>Mo</span><span>Di</span><span>Mi</span><span>Do</span><span>Fr</span><span>Sa</span><span>So</span></div>
    </div>
  </article>`;
}
function timelineCard(title='Ereignisse') {
  return `<article class="cgn-card">
    <div class="card-head"><div><p class="cgn-eyebrow">Timeline</p><h2>${title}</h2></div></div>
    <div class="cgn-timeline">
      <div><i></i><b>Aktion ausgeführt</b><span>vor 4 Sekunden</span></div>
      <div><i></i><b>Status aktualisiert</b><span>vor 18 Sekunden</span></div>
      <div><i></i><b>Eintrag gespeichert</b><span>vor 1 Minute</span></div>
      <div><i></i><b>Modul geöffnet</b><span>vor 3 Minuten</span></div>
    </div>
  </article>`;
}
function moduleTable(title='Modulübersicht') {
  return `<article class="cgn-card span2">
    <div class="card-head"><div><p class="cgn-eyebrow">Tabelle</p><h2>${title}</h2></div><div class="cgn-pagination"><button>‹</button><button class="is-active">1</button><button>2</button><button>›</button></div></div>
    <div class="cgn-table">
      <div class="table-head"><span>Typ</span><span>Name / Status</span><span>User</span><span>Status</span></div>
      <div class="table-row"><span>Aktiv</span><b>Hauptfunktion bereit</b><span><span class="members"><i></i><i></i><i></i></span></span><em class="ok">OK</em></div>
      <div class="table-row"><span>Info</span><b>Letzte Änderung vor wenigen Minuten</b><span><span class="members"><i></i><i></i></span></span><em class="warn">Neu</em></div>
      <div class="table-row"><span>Admin</span><b>Technische Details im Admin-Bereich</b><span><span class="members"><i></i></span></span><em class="warn">Admin</em></div>
    </div>
  </article>`;
}
function settingsCard(simple=true) {
  return `<article class="cgn-card">
    <div class="card-head"><div><p class="cgn-eyebrow">${simple ? 'Einfache Optionen' : 'Admin Config'}</p><h2>${simple ? 'Moduloptionen' : 'Technische Einstellungen'}</h2></div></div>
    <div class="settings-list">
      <label class="switch-row"><span class="switch on"></span> Modul aktiv</label>
      <label class="switch-row"><span class="switch on"></span> Chat-Ausgabe erlaubt</label>
      <label class="switch-row"><span class="switch"></span> Testmodus sichtbar</label>
      <p class="form-help">${simple ? 'Nur Optionen, die Streamer/Mods wirklich verstehen und im Alltag brauchen.' : 'Nur für Owner/Admin: tiefe Config, Diagnose, gefährliche Aktionen.'}</p>
    </div>
  </article>`;
}
function actionCard(rows) {
  return `<article class="cgn-card span2">
    <div class="card-head"><div><p class="cgn-eyebrow">Hauptkarte</p><h2>Wichtige Aktionen</h2></div><span class="cgn-chip cgn-chip--info">Streamer/Mod</span></div>
    <div class="module-list">${rows.map((r,i)=>`<div class="module-row"><span class="module-icon ${['purple','cyan','blue','green'][i%4]}">${r[0]}</span><div><b>${r[1]}</b><small>${r[2]}</small></div><div class="module-actions"><button class="cgn-button">${r[3]}</button><button class="cgn-button cgn-button--ghost">${r[4]}</button></div></div>`).join('')}</div>
  </article>`;
}
function miniActions(rows){
  return `<article class="cgn-card">
    <div class="card-head"><div><p class="cgn-eyebrow">Schnellzugriff</p><h2>Kurze Aktionen</h2></div></div>
    <div class="mini-action-list">${rows.map((r,i)=>`<div class="mini-action"><span class="module-icon ${['purple','cyan','blue','green'][i%4]}">${r[0]}</span><div><b>${r[1]}</b><small>${r[2]}</small></div><button class="cgn-button cgn-button--ghost">${r[3]}</button></div>`).join('')}</div>
  </article>`;
}
function formCard(title='Einfache Bearbeitung'){
  return `<article class="cgn-card">
    <div class="card-head"><div><p class="cgn-eyebrow">Formular</p><h2>${title}</h2></div></div>
    <div class="simple-form">
      <div class="form-row"><label>Name</label><input class="form-control" value="Beispiel-Eintrag"></div>
      <div class="form-row"><label>Kategorie</label><select class="form-control"><option>Standard</option><option>Event</option><option>Sound</option></select></div>
      <div class="form-row"><label>Status</label><select class="form-control"><option>Aktiv</option><option>Inaktiv</option></select></div>
      <p class="form-help">Dropdowns statt technische Freitexte, wenn es sinnvoll ist.</p>
    </div>
  </article>`;
}
function transactionCard() {
  return `<article class="cgn-card">
    <div class="card-head"><div><p class="cgn-eyebrow">Verlauf</p><h2>Letzte Einträge</h2></div></div>
    <div class="txn-list">
      <div class="txn plus"><span class="circle">↑</span><div><strong>Eintrag erstellt</strong><small>Heute, 21:42</small></div><b>OK</b></div>
      <div class="txn minus"><span class="circle">↓</span><div><strong>Aktion blockiert</strong><small>Heute, 21:30</small></div><b>Lock</b></div>
      <div class="txn plus"><span class="circle">↑</span><div><strong>Text gespeichert</strong><small>Heute, 21:20</small></div><b>OK</b></div>
    </div>
  </article>`;
}

function streamEventsPage(active='Übersicht'){
  return moduleTabs(['Übersicht','Events','Teilnehmer','Runden','Finale','Logs'], active) +
  note('Stream-Events', 'Komplexes Modul, aber für Streamer/Mods bleibt es bei Status, wichtigen Aktionen, Verlauf und klaren Tabs.', 'Community') +
  metrics([
    ['Status','Bereit','aktuelles Event erkannt',92],
    ['Teilnehmer','28','Mockdaten',72],
    ['Runden','12','Sound/Text gemischt',55],
    ['Finale','verfügbar','manuell startbar',80]
  ]) +
  `<section class="page-grid">
    ${actionCard([
      ['▶','Event starten/fortsetzen','zeigt nur Alltag-Aktionen, keine Rohdaten','Starten','Status'],
      ['⏭','Runde überspringen','nur mit passender Berechtigung','Skip','Verlauf'],
      ['🏆','Finale öffnen','Auswertung und Overlay-Steuerung','Öffnen','Vorschau']
    ])}
    ${timelineCard('Eventverlauf')}
    ${moduleTable(active === 'Teilnehmer' ? 'Teilnehmer' : active === 'Logs' ? 'Logs' : 'Event-Liste')}
    ${adminNote()}
  </section>`;
}
function shotPage(active='Übersicht'){
  return moduleTabs(['Übersicht','Verlauf','Statistik','Texte','Einstellungen'], active) +
  note('Shot-Alarm', 'Streamer/Mods sehen Start, Stop, offene Shots und Verlauf. Regeln/Trigger-Details liegen in Admin oder geschützten Einstellungen.', 'Aktionen') +
  metrics([
    ['Status','Inaktiv','bereit zum Start',10],
    ['Offene Shots','0','keine fällig',5],
    ['Heute ausgelöst','6','Mockdaten',50],
    ['Erledigt','6','alles erledigt',100]
  ]) +
  `<section class="page-grid">
    ${actionCard([
      ['▶','Shot-Alarm starten','aktiviert Regeln für aktuellen Stream','Starten','Logs'],
      ['■','Shot-Alarm stoppen','deaktiviert neue Auslöser','Stoppen','Status'],
      ['✓','Shot erledigt','markiert offenen Shot als getrunken','Erledigt','Statistik']
    ])}
    ${settingsCard(true)}
    ${moduleTable(active === 'Statistik' ? 'Shot-Statistik' : active === 'Texte' ? 'Textvarianten' : 'Shot-Verlauf')}
    ${timelineCard('Letzte Auslöser')}
  </section>`;
}
function mediaPage(active='Bibliothek'){
  return moduleTabs(['Bibliothek','Sounds','Videos','Bilder','Uploads','Zuordnungen'], active) +
  note('Media', 'Media ist ein Hauptbereich. Innerhalb entscheidet die Modul-Navi, ob man Sounds, Videos, Bilder, Uploads oder Zuordnungen verwaltet.', 'Media') +
  metrics([
    ['Sounds','1.602','Media-System',80],
    ['Videos','183','Reveal/Overlay',58],
    ['Bilder','421','Assets',42],
    ['Uploads','2 aktiv','Mockdaten',30]
  ]) +
  `<section class="page-grid">
    ${moduleTable(active)}
    ${miniActions([
      ['↑','Upload starten','neue Datei hinzufügen','Upload'],
      ['🔊','Sound testen','kurze Vorschau abspielen','Test'],
      ['▣','Zuordnen','Sound/Event/Command verbinden','Picker']
    ])}
    ${formCard('Media-Eintrag bearbeiten')}
    ${timelineCard('Media-Verlauf')}
  </section>`;
}
function loyaltyPage(active='Übersicht'){
  return moduleTabs(['Übersicht','Transaktionen','Ranking','Giveaways','Glücksrad','Texte'], active) +
  note('Loyalty', 'Core, Transaktionen, Ranking und Unterspiele bleiben ähnlich aufgebaut. Tiefe Punkte-Regeln sind Admin/Config.', 'Loyalty') +
  metrics([
    ['Kekskrümel','1.832.557','gesamt importiert',90],
    ['Buchungen','318','heute',72],
    ['Raffles','4','aktiv/abgeschlossen',42],
    ['Korrekturen','2','Admin',20,true]
  ]) +
  `<section class="page-grid">
    ${transactionCard()}
    ${chartCard()}
    ${moduleTable(active)}
    ${timelineCard('Loyalty-Verlauf')}
  </section>`;
}
function adminPage(active='Übersicht'){
  return moduleTabs(['Übersicht','Benutzer','Rollen','Texte','Configs','Diagnose','Audit'], active) +
  note('Admin', 'Hier landen technische Dinge, tiefe Configs, Diagnose, Rechte, Audit und gefährliche Aktionen. Normale Module bleiben dadurch einfach.', 'Admin') +
  metrics([
    ['User','12','mit Dashboard-Zugriff',62],
    ['Rollen','6','Owner/Admin/Mod/Sound-Profi',78],
    ['Locks','0','aktiv',6],
    ['Audit','aktiv','Retention später config',82]
  ]) +
  `<section class="page-grid">
    ${settingsCard(false)}
    ${formCard(active === 'Texte' ? 'Textvarianten verwalten' : 'Admin-Konfiguration')}
    ${moduleTable(active)}
    ${timelineCard('Audit-Log')}
  </section>`;
}
function agentPage(active='Übersicht'){
  return moduleTabs(['Übersicht','Agenten','Allowlist','Aktionen','Logs'], active) +
    note('Remote Agent', 'Auch technische Bereiche werden normal erklärt: Status, erlaubte Aktionen und letzte Ereignisse.', 'Live') +
    metrics([
      ['Agent','Online','stream-pc-main',92],
      ['Latenz','24ms','Mock',82],
      ['Allowlist','8 Actions','erste Version',40],
      ['Fehler','0','letzte Stunde',2]
    ]) + `<section class="page-grid">${moduleTable(active)}${timelineCard('Agent-Verlauf')}${settingsCard(true)}${adminNote()}</section>`;
}
function analyticsPage(active='Statistik'){
  return moduleTabs(['Übersicht','Statistik','Export'], active) +
    note('Statistik-Tab', 'Gleiche Chart-/KPI-Komponenten, egal ob Sound, Event, Loyalty oder Shot-Alarm.', 'Statistik') +
    metrics([
      ['Zuschauerpeak','42','heutiger Stream',68],
      ['Chat-Aktionen','318','davon 64 Commands',78],
      ['Sounds','27','gespielt',56],
      ['Events','18','verarbeitet',45]
    ]) + `<section class="page-grid">${chartCard()}${transactionCard()}${moduleTable('Statistik-Tabelle')}${timelineCard('Statistik-Verlauf')}</section>`;
}
function overviewPage(active='Dashboard'){
  return moduleTabs(['Dashboard','Module','Status','Hinweise'], active) +
  note('Grundprinzip', 'Sidebar zeigt nur Hauptkategorie → Modul. Innerhalb des Moduls gibt es Tabs/Modul-Navi. Keine dritte Ebene links.', 'Layout-Regel') +
  metrics([
    ['Navigation','2 Ebenen','Kategorie → Modul',92],
    ['Modul-Navi','Tabs','innerhalb der Seite',86],
    ['Admin','Technik','zentral gesammelt',78],
    ['Einheitlich','Pflicht','gleiches Seitenmuster',95]
  ]) +
  `<section class="page-grid">
    ${actionCard([
      ['1','Sidebar','Hauptkategorie und Modul wählen','Beispiel','OK'],
      ['2','Modul-Navi','Übersicht, Verlauf, Statistik, Texte…','Tabs','OK'],
      ['3','Admin','Technik, Diagnose, Config, Rechte','Öffnen','Audit']
    ])}
    ${adminNote()}
    ${moduleTable('Einheitliches Seitenmuster')}
    ${timelineCard('Layout-Verlauf')}
  </section>`;
}

const pages = {
  overview: {
    module:'Übersicht',
    tab:'Dashboard',
    eyebrow:'Dashboard v2 / Navigation',
    title:'Einheitlicher Seitenaufbau mit Modul-Navi.',
    text:'Sidebar zeigt Hauptkategorie und Modul. Die Topbar zeigt zusätzlich den aktiven Tab.',
    html: overviewPage
  },
  events: {
    module:'Stream-Events',
    tab:'Übersicht',
    eyebrow:'Community / Events',
    title:'Stream-Events',
    text:'Status, Runden, Teilnehmer, Finale und Verlauf im gleichen Modul-Muster.',
    html: streamEventsPage
  },
  shot: {
    module:'Shot-Alarm',
    tab:'Übersicht',
    eyebrow:'Aktionen',
    title:'Shot-Alarm',
    text:'Einfache Bedienung für Streamer/Mods. Regeln und technische Details bleiben geschützt.',
    html: shotPage
  },
  media: {
    module:'Medienbibliothek',
    tab:'Bibliothek',
    eyebrow:'Media',
    title:'Medienbibliothek',
    text:'Sounds, Videos, Bilder, Uploads und Zuordnungen über eine klare Modul-Navi.',
    html: mediaPage
  },
  loyalty: {
    module:'Core',
    tab:'Übersicht',
    eyebrow:'Loyalty',
    title:'Loyalty',
    text:'Kekskrümel, Transaktionen, Ranking und Unterspiele bleiben einheitlich.',
    html: loyaltyPage
  },
  transactions: {
    module:'Transaktionen',
    tab:'Transaktionen',
    eyebrow:'Loyalty',
    title:'Loyalty-Transaktionen',
    text:'Buchungen und Verlauf als klarer Unterbereich innerhalb von Loyalty.',
    html: () => loyaltyPage('Transaktionen')
  },
  settings: {
    module:'Einstellungen',
    tab:'Übersicht',
    eyebrow:'Admin',
    title:'Admin-Einstellungen',
    text:'Tiefe Configs, Diagnose, Rechte und gefährliche Aktionen liegen im Admin.',
    html: adminPage
  },
  users: {
    module:'Benutzer & Rechte',
    tab:'Benutzer',
    eyebrow:'Admin',
    title:'Benutzer & Rechte',
    text:'Rechte und Freigaben zentral verwalten, nicht pro Modul verteilt.',
    html: () => adminPage('Benutzer')
  },
  audit: {
    module:'Audit-Log',
    tab:'Audit',
    eyebrow:'Admin',
    title:'Audit-Log',
    text:'Nachvollziehbarkeit und technische Details bleiben im geschützten Admin-Bereich.',
    html: () => adminPage('Audit')
  },
  agent: {
    module:'Remote Agent',
    tab:'Übersicht',
    eyebrow:'Live',
    title:'Remote Agent',
    text:'Status, erlaubte Aktionen und letzte Ereignisse des Stream-PC-Agenten.',
    html: agentPage
  },
  analytics: {
    module:'Statistiken',
    tab:'Statistik',
    eyebrow:'Live',
    title:'Statistiken',
    text:'Charts, KPI-Karten, Tabellen und Export später im gleichen Muster.',
    html: analyticsPage
  },
  default: {
    module:'Modul',
    tab:'Übersicht',
    eyebrow:'Dashboard v2',
    title:'Beispielseite',
    text:'Dieses Muster gilt später für fast alle Module.',
    html: overviewPage
  }
};

let activeViewKey = 'overview';

function bindModuleTabs(viewKey){
  document.querySelectorAll('.module-tab').forEach(button => {
    button.addEventListener('click', () => {
      const tab = button.dataset.tab || button.textContent.trim();
      const page = pages[viewKey] || pages.default;
      document.querySelectorAll('.module-tab').forEach(item => item.classList.remove('is-active'));
      button.classList.add('is-active');
      setTopbar(currentSection, page.module, tab);

      // Re-render content with selected tab for demo pages, so cards/tables can reflect the active tab.
      root.innerHTML = page.html(tab);
      bindModuleTabs(viewKey);
    });
  });
}

function render(viewKey, sectionFromNav, moduleFromNav) {
  activeViewKey = viewKey || 'overview';
  const page = pages[activeViewKey] || pages.default;
  const section = sectionFromNav || currentSection || 'Dashboard';
  const module = page.module || moduleFromNav || 'Modul';
  const tab = page.tab || 'Übersicht';

  setTopbar(section, module, tab);
  setPageHeader(page.eyebrow, page.title, page.text);
  root.innerHTML = page.html(tab);
  bindModuleTabs(activeViewKey);
}

function isDrawerMode(){ return window.matchMedia('(max-width: 1180px)').matches; }
navToggle.addEventListener('click', () => {
  if (isDrawerMode()) body.classList.toggle('nav-open');
  else body.classList.toggle('nav-collapsed');
});
scrim.addEventListener('click', () => body.classList.remove('nav-open'));
document.addEventListener('keydown', event => { if (event.key === 'Escape') body.classList.remove('nav-open'); });

document.querySelectorAll('.nav-group').forEach(button => {
  button.addEventListener('click', () => {
    const target = document.getElementById(button.dataset.target);
    document.querySelectorAll('.nav-group').forEach(item => { if (item !== button) item.classList.remove('is-open'); });
    document.querySelectorAll('.nav-sub').forEach(item => { if (item !== target) item.classList.remove('is-open'); });
    const willOpen = !button.classList.contains('is-open');
    button.classList.toggle('is-open', willOpen);
    target.classList.toggle('is-open', willOpen);
  });
});

document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    document.querySelectorAll('.nav-link').forEach(item => item.classList.remove('is-active'));
    link.classList.add('is-active');

    render(link.dataset.view || 'default', link.dataset.section || 'Dashboard', link.dataset.title || 'Modul');

    if (isDrawerMode()) body.classList.remove('nav-open');
  });
});

window.addEventListener('resize', () => {
  if (!isDrawerMode()) body.classList.remove('nav-open');
});

render('overview', 'Live', 'Übersicht');
