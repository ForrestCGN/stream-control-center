"use strict";

// CAN-36.3b cleanup:
// The extra Message-Rotator Read-only tab was removed because the module already has a visible "Diagnose" tab.
// This file is intentionally inert in case a browser or old index.html still references it from cache.
window.CGNMessageRotatorReadonlyDiagnostics = {
  version: "0.1.0-can36-3b-disabled",
  disabled: true,
  reason: "message_rotator_uses_existing_diagnose_tab",
  refresh: function(){ return null; },
  activate: function(){ return null; },
  deactivate: function(){ return null; }
};
