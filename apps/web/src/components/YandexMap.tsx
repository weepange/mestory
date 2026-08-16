"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { MapPin, Navigation, Sparkles } from "lucide-react";
import { Place, PLACE_CATEGORIES } from "@mestory/shared";
import { useAuth } from "@/lib/auth-context";

interface YandexMapProps {
  places: Place[];
  selectedPlaceId?: string;
  onSelectPlace: (place: Place) => void;
  center?: { lat: number; lng: number };
  zoom?: number;
}

export function YandexMap({
  places,
  selectedPlaceId,
  onSelectPlace,
  center,
  zoom = 13
}: YandexMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const { selectedCity, userLocation, requestUserLocation } = useAuth();

  const activeCenter = center || {
    lat: selectedCity.center.lat,
    lng: selectedCity.center.lng
  };

  const renderPlacemarks = useCallback((map: any, ymaps: any) => {
    map.geoObjects.removeAll();

    places.forEach((place) => {
      const isSelected = place.id === selectedPlaceId;
      const catConfig = PLACE_CATEGORIES.find((c) => c.id === place.category);
      const iconEmoji = catConfig?.icon || "📍";

      // Кастомный макет метки
      const customLayout = ymaps.templateLayoutFactory.createClass(
        `<div style="
          transform: translate(-50%, -100%);
          display: flex;
          align-items: center;
          gap: 4px;
          background: ${isSelected ? "#F59E0B" : "rgba(22, 27, 34, 0.95)"};
          color: ${isSelected ? "#0B0E14" : "#F8FAFC"};
          padding: 6px 10px;
          border-radius: 9999px;
          border: 2px solid ${isSelected ? "#FFFFFF" : "#F59E0B"};
          box-shadow: 0 8px 24px rgba(0,0,0,0.5);
          font-weight: 700;
          font-size: 12px;
          font-family: sans-serif;
          white-space: nowrap;
          cursor: pointer;
          transition: transform 0.2s ease;
        ">
          <span>${iconEmoji}</span>
          <span>${place.name}</span>
          <span style="opacity: 0.75; font-size: 11px;">⭐ ${place.rating}</span>
        </div>`
      );

      const placemark = new ymaps.Placemark(
        [place.lat, place.lng],
        {
          hintContent: place.name,
          balloonContent: `<strong>${place.name}</strong><br/>${place.address}`
        },
        {
          iconLayout: customLayout,
          iconPane: "overlaps"
        }
      );

      placemark.events.add("click", () => {
        onSelectPlace(place);
      });

      map.geoObjects.add(placemark);
    });
  }, [places, selectedPlaceId, onSelectPlace]);

  useEffect(() => {
    let isSubscribed = true;

    const initMap = () => {
      if (!mapContainerRef.current || mapInstanceRef.current) return;
      const ymaps = (window as any).ymaps;

      const map = new ymaps.Map(
        mapContainerRef.current,
        {
          center: [activeCenter.lat, activeCenter.lng],
          zoom,
          controls: ["zoomControl", "fullscreenControl"]
        },
        {
          searchControlProvider: "yandex#search",
          suppressMapOpenBlock: true
        }
      );

      mapInstanceRef.current = map;
      setIsLoaded(true);
      renderPlacemarks(map, ymaps);
    };

    const loadYandexMaps = () => {
      if ((window as any).ymaps) {
        (window as any).ymaps.ready(() => {
          if (isSubscribed) initMap();
        });
        return;
      }

      const script = document.createElement("script");
      script.src = "https://api-maps.yandex.ru/2.1/?lang=ru_RU";
      script.async = true;
      script.onload = () => {
        if ((window as any).ymaps) {
          (window as any).ymaps.ready(() => {
            if (isSubscribed) initMap();
          });
        }
      };
      document.head.appendChild(script);
    };

    loadYandexMaps();

    return () => {
      isSubscribed = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
        mapInstanceRef.current = null;
      }
    };
  }, [selectedCity.id, activeCenter.lat, activeCenter.lng, zoom, renderPlacemarks]);

  // Обновление меток при изменении мест или выбранного места
  useEffect(() => {
    if (mapInstanceRef.current && (window as any).ymaps) {
      renderPlacemarks(mapInstanceRef.current, (window as any).ymaps);
    }
  }, [renderPlacemarks]);

  const handleCenterUserLocation = () => {
    requestUserLocation();
    if (userLocation && mapInstanceRef.current) {
      mapInstanceRef.current.setCenter([userLocation.lat, userLocation.lng], 14, {
        duration: 500
      });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[400px] rounded-3xl overflow-hidden glass-panel border border-white/10 shadow-2xl">
      <div ref={mapContainerRef} className="w-full h-full min-h-[400px]" />

      {/* Floating Map Controls */}
      <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
        <button
          onClick={handleCenterUserLocation}
          className="p-3 rounded-2xl bg-[#161B22]/90 hover:bg-[#161B22] border border-white/15 text-amber-400 backdrop-blur-xl shadow-xl transition-all hover:scale-105 active:scale-95"
          title="Моё местоположение"
        >
          <Navigation className="w-5 h-5" />
        </button>
      </div>

      {/* Информационный бейдж города */}
      <div className="absolute bottom-4 left-4 z-20 pointer-events-none">
        <div className="px-3.5 py-2 rounded-2xl bg-[#161B22]/90 border border-white/15 backdrop-blur-xl shadow-xl flex items-center gap-2 text-xs font-semibold text-white">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Яндекс.Карты • {selectedCity.name}</span>
          <span className="text-amber-400">({places.length} мест)</span>
        </div>
      </div>
    </div>
  );
}
