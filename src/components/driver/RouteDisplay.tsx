import { useEffect, useRef, useCallback } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import type { NavInstruction } from './NavigationBar';

interface RouteDisplayProps {
  origin: [number, number];
  destination: [number, number];
  onRouteFound?: (distance: number, duration: number) => void;
  onInstructionsFound?: (instructions: NavInstruction[]) => void;
  followDriver?: boolean;
}

export function RouteDisplay({ origin, destination, onRouteFound, onInstructionsFound, followDriver }: RouteDisplayProps) {
  const map = useMap();
  const routingRef = useRef<any>(null);
  const lastKeyRef = useRef<string>('');

  const onRouteFoundRef = useRef(onRouteFound);
  const onInstructionsFoundRef = useRef(onInstructionsFound);
  useEffect(() => { onRouteFoundRef.current = onRouteFound; }, [onRouteFound]);
  useEffect(() => { onInstructionsFoundRef.current = onInstructionsFound; }, [onInstructionsFound]);

  const handleRoutesFound = useCallback((e: any) => {
    const route = e.routes?.[0];
    if (!route) return;

    if (onRouteFoundRef.current) {
      onRouteFoundRef.current(route.summary.totalDistance, route.summary.totalTime);
    }

    if (onInstructionsFoundRef.current && route.instructions) {
      const navInstructions: NavInstruction[] = route.instructions
        .filter((inst: any) => inst.distance > 0)
        .map((inst: any) => ({
          text: inst.text || '',
          distance: inst.distance || 0,
          type: inst.type || 'Straight',
          road: inst.road || '',
        }));
      onInstructionsFoundRef.current(navInstructions);
    }
  }, []);

  // Create routing control once, then reuse via setWaypoints
  const ensureControl = useCallback(() => {
    if (routingRef.current) return;

    const control = L.Routing.control({
      waypoints: [
        L.latLng(origin[0], origin[1]),
        L.latLng(destination[0], destination[1]),
      ],
      router: L.Routing.osrmv1({
        serviceUrl: 'https://router.project-osrm.org/route/v1',
      }),
      lineOptions: {
        styles: [{ color: '#7c3aed', opacity: 0.9, weight: 6 }],
        extendToWaypoints: true,
        missingRouteTolerance: 10,
      },
      show: false,
      addWaypoints: false,
      fitSelectedRoutes: false,
      showAlternatives: false,
      // @ts-ignore - hide default markers
      createMarker: () => null,
    });

    control.on('routesfound', handleRoutesFound);
    control.addTo(map);
    routingRef.current = control;
  }, [map, handleRoutesFound, origin, destination]);

  // Update waypoints on existing control (no flicker)
  const updateWaypoints = useCallback(() => {
    if (!routingRef.current) return;
    routingRef.current.setWaypoints([
      L.latLng(origin[0], origin[1]),
      L.latLng(destination[0], destination[1]),
    ]);
  }, [origin, destination]);

  // Fit bounds to show driver + destination
  const fitRoute = useCallback(() => {
    if (!followDriver) return;
    if (origin[0] === 0 || destination[0] === 0) return;
    const bounds = L.latLngBounds(
      L.latLng(origin[0], origin[1]),
      L.latLng(destination[0], destination[1])
    );
    map.fitBounds(bounds, { padding: [80, 60], maxZoom: 17, animate: true });
  }, [map, origin, destination, followDriver]);

  // React to origin/destination changes with debounce + reduced sensitivity
  useEffect(() => {
    if (origin[0] === 0 && origin[1] === 0) return;
    if (destination[0] === 0 && destination[1] === 0) return;

    const key = `${origin[0].toFixed(3)},${origin[1].toFixed(3)}-${destination[0].toFixed(3)},${destination[1].toFixed(3)}`;
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;

    const timer = setTimeout(() => {
      if (!routingRef.current) {
        ensureControl();
      } else {
        updateWaypoints();
      }
      fitRoute();
    }, 2000);
    return () => clearTimeout(timer);
  }, [origin, destination, ensureControl, updateWaypoints, fitRoute]);

  // Periodic refresh every 15s using setWaypoints
  useEffect(() => {
    if (origin[0] === 0 || destination[0] === 0) return;
    const interval = setInterval(() => {
      if (routingRef.current) {
        updateWaypoints();
      }
    }, 15000);
    return () => clearInterval(interval);
  }, [origin, destination, updateWaypoints]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (routingRef.current) {
        try { map.removeControl(routingRef.current); } catch { /* */ }
        routingRef.current = null;
      }
    };
  }, [map]);

  return null;
}
