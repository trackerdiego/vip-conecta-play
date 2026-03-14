declare module 'leaflet-routing-machine' {
  // Side-effect import that extends L namespace
}

declare namespace L {
  namespace Routing {
    function control(options?: any): any;
    function osrmv1(options?: any): any;
    interface Control extends L.Control {}
  }
}
