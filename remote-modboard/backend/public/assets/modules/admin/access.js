'use strict';

(function retireAdminAccessNavigation() {
  function removeAccessNavigation() {
    document.querySelectorAll('#nav-admin .nav-link[data-page="access"]').forEach((button) => button.remove());
  }

  function installStyle() {
    if (document.getElementById('rdap115bRetiredAccessNavStyle')) return;

    const style = document.createElement('style');
    style.id = 'rdap115bRetiredAccessNavStyle';
    style.textContent = `
      #nav-admin .nav-link[data-page="access"]{display:none!important}
    `;
    document.head.appendChild(style);
  }

  function install() {
    installStyle();
    removeAccessNavigation();
  }

  install();
  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('rdap:module-registry-ready', install);
})();
