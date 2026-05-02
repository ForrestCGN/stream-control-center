/* /ws-client.js — robust WS bootstrap for overlays (works with file:// in OBS and http(s) in browser)
Usage in overlay HTML:
  <script src="http://localhost:8080/ws-client.js"></script>
  <script>
    const ws = createOverlaySocket();
    window.addEventListener('overlay-message', (e) => {
      const msg = e.detail;
      // handle {type:'challenge', data:{...}}
    });
  </script>
You can override host via query string: ?ws=localhost:8080  or full ws://... URL
Or set a global before loading: window.OVERLAY_WS_HOST = "localhost:8080";
*/
(function(){
  function pickWsUrl(){
    try{
      const qp = new URLSearchParams((location && location.search) || "");
      const wsParam = qp.get("ws");
      if (wsParam) return (wsParam.startsWith("ws://") || wsParam.startsWith("wss://")) ? wsParam : `ws://${wsParam}`;
    }catch{}
    let host = null;
    try{
      if (location && /^https?:$/.test(location.protocol) && location.host) host = location.host;
    }catch{}
    if (!host) {
      host = (typeof window !== "undefined" && window.OVERLAY_WS_HOST) ? window.OVERLAY_WS_HOST : "localhost:8080";
    }
    const proto = (typeof location !== "undefined" && location.protocol === "https:") ? "wss" : "ws";
    return `${proto}://${host}/`;
  }
  function connect(){
    const url = pickWsUrl();
    const ws = new WebSocket(url);
    ws.addEventListener("open", ()=> console.log("[WS] connected:", url));
    ws.addEventListener("message", (ev)=>{
      try {
        const msg = JSON.parse(ev.data);
        window.dispatchEvent(new CustomEvent("overlay-message", { detail: msg }));
      } catch(e){}
    });
    ws.addEventListener("close", ()=> setTimeout(connect, 2000));
    ws.addEventListener("error", ()=> { try{ ws.close(); }catch{} });
    return ws;
  }
  window.createOverlaySocket = connect;
})();
