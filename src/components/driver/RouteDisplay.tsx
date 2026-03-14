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
  const routingRef = useRef<L.Routing.Control | null>(null);
  const lastCalcRef = useRef<string>('');

  const onRouteFoundRef = useRef(onRouteFound);
  const onInstructionsFoundRef = useRef(onInstructionsFound);
  useEffect(() => { onRouteFoundRef.current = onRouteFound; }, [onRouteFound]);
  useEffect(() => { onInstructionsFoundRef.current = onInstructionsFound; }, [onInstructionsFound]);

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

  const calcRoute = useCallback(() => {
    const key = `${origin[0].toFixed(4)},${origin[1].toFixed(4)}-${destination[0].toFixed(4)},${destination[1].toFixed(4)}`;
    if (key === lastCalcRef.current) return;
    lastCalcRef.current = key;

    // Remove previous
    if (routingRef.current) {
      try { map.removeControl(routingRef.current); } catch { /* */ }
      routingRef.current = null;
    }

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

    control.on('routesfound', (e: any) => {
      const route = e.routes?.[0];
      if (!route) return;

      if (onRouteFoundRef.current) {
        onRouteFoundRef.current(route.summary.totalDistance, route.summary.totalTime);
      }

      // Extract turn-by-turn instructions
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
    });

    control.addTo(map);
    routingRef.current = control;
  }, [origin, destination, map]);

  // Recalc on mount and when origin/destination change (debounced)
  useEffect(() => {
    if (origin[0] === 0 && origin[1] === 0) return;
    if (destination[0] === 0 && destination[1] === 0) return;

    const timer = setTimeout(() => {
      calcRoute();
      fitRoute();
    }, 500);
    return () => clearTimeout(timer);
  }, [calcRoute, fitRoute]);

  // Periodic recalc every 15s (more responsive)
  useEffect(() => {
    if (origin[0] === 0 || destination[0] === 0) return;
    const interval = setInterval(() => {
      lastCalcRef.current = ''; // force recalc
      calcRoute();
    }, 15000);
    return () => clearInterval(interval);
  }, [calcRoute]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (routingRef.current) {
        try { map.removeControl(routingRef.current); } catch { /* */ }
      }
    };
  }, [map]);

  return null;
}
