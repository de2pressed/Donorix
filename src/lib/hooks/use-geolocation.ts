"use client";

import { useEffect, useState } from "react";

export function useGeolocation() {
  const [state, setState] = useState<{
    latitude: number | null;
    longitude: number | null;
    loading: boolean;
    error: string | null;
  }>({
    latitude: null,
    longitude: null,
    loading: true,
    error: null,
  });

  useEffect(() => {
    if (!navigator.geolocation) {
      setState((current) => ({ ...current, loading: false, error: "Geolocation unavailable" }));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        setState({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null,
        }),
      (error) =>
        setState({
          latitude: null,
          longitude: null,
          loading: false,
          error: error.message,
        }),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 },
    );
  }, []);

  return state;
}
