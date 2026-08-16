"use client";

import React, { useState } from "react";
import {
  MapPin,
  Star,
  Bookmark,
  Sparkles,
  ChevronRight,
  Clock,
  Navigation,
  CheckCircle2
} from "lucide-react";
import { Place, PLACE_CATEGORIES } from "@mestory/shared";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";

interface PlaceCardProps {
  place: Place;
  matchReasons?: string[];
  onSelect: (place: Place) => void;
}

export function PlaceCard({ place, matchReasons = [], onSelect }: PlaceCardProps) {
  const { user, openAuthModal } = useAuth();
  const [isSaved, setIsSaved] = useState(false);
  const [savesCount, setSavesCount] = useState(place.savesCount);
  const [photoIndex, setPhotoIndex] = useState(0);

  const category = PLACE_CATEGORIES.find((c) => c.id === place.category);
  const photos = place.photos && place.photos.length > 0 ? place.photos : [place.coverPhoto];

  const handleBookmarkToggle = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!user) {
      openAuthModal();
      return;
    }
    try {
      const res = await api.toggleBookmark("PLACE", place.id);
      setIsSaved(res.saved);
      setSavesCount((prev) => (res.saved ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error("Bookmark toggle error:", err);
    }
  };

  return (
    <div
      onClick={() => onSelect(place)}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between h-full hover:border-amber-500/40 transition-all duration-300 shadow-xl"
    >
      {/* Верхний медиа-блок с фото */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={photos[photoIndex]}
          alt={place.name}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />

        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

        {/* Категория + Дистанция */}
        <div className="absolute top-3.5 left-3.5 flex items-center gap-2 z-10">
          {category && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-black/60 backdrop-blur-md text-white border border-white/10 flex items-center gap-1.5 shadow">
              <span>{category.icon}</span>
              <span>{category.label.split(" ")[0]}</span>
            </span>
          )}

          {place.distanceMeters !== undefined && (
            <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/90 backdrop-blur-md text-slate-950 shadow flex items-center gap-1">
              <Navigation className="w-3 h-3 fill-slate-950" />
              {place.distanceMeters < 1000
                ? `${place.distanceMeters} м`
                : `${(place.distanceMeters / 1000).toFixed(1)} км`}
            </span>
          )}
        </div>

        {/* Кнопка сохранения в закладки */}
        <button
          onClick={handleBookmarkToggle}
          className={`absolute top-3.5 right-3.5 w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md border transition-all z-10 ${
            isSaved
              ? "bg-amber-500 text-slate-950 border-amber-400 shadow-glowAmber scale-110"
              : "bg-black/50 hover:bg-black/75 text-white border-white/20 hover:scale-105"
          }`}
          title={isSaved ? "Сохранено" : "Сохранить место"}
        >
          <Bookmark className={`w-4 h-4 ${isSaved ? "fill-slate-950" : ""}`} />
        </button>

        {/* Индикатор фото, если их несколько */}
        {photos.length > 1 && (
          <div className="absolute bottom-3 right-3.5 z-10 flex items-center gap-1">
            {photos.map((_, idx) => (
              <span
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setPhotoIndex(idx);
                }}
                className={`h-1.5 rounded-full transition-all ${
                  idx === photoIndex ? "w-4 bg-amber-400" : "w-1.5 bg-white/50"
                }`}
              />
            ))}
          </div>
        )}

        {/* Рейтинг и отзывы */}
        <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-2">
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/10 text-xs font-bold text-amber-400 shadow">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span>{place.rating.toFixed(1)}</span>
            <span className="text-white/70 font-normal">({place.reviewsCount})</span>
          </div>

          {place.isVerifiedBusiness && (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[11px] font-semibold backdrop-blur-md">
              <CheckCircle2 className="w-3 h-3" />
              Верифицировано
            </span>
          )}
        </div>
      </div>

      {/* Описание и теги */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          {/* Причины рекомендации */}
          {matchReasons.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {matchReasons.slice(0, 2).map((reason, i) => (
                <span
                  key={i}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md border border-amber-500/20"
                >
                  <Sparkles className="w-2.5 h-2.5 text-amber-400 flex-shrink-0" />
                  <span>{reason}</span>
                </span>
              ))}
            </div>
          )}

          <div>
            <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between leading-snug">
              <span>{place.name}</span>
              <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
            </h3>
            <p className="text-xs text-slate-300/90 mt-1 line-clamp-2 leading-relaxed">
              {place.summary}
            </p>
          </div>

          {/* Адрес и время работы */}
          <div className="space-y-1.5 pt-1 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
              <span className="truncate">{place.address}</span>
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-slate-400">
                <Clock className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>{place.workingHoursText}</span>
              </div>
              {place.averageCheck && (
                <span className="text-amber-300 font-medium">
                  {place.averageCheck}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Теги */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-2 border-t border-white/5">
            {place.tags.slice(0, 3).map((tag, idx) => (
              <span
                key={idx}
                className="text-[11px] px-2.5 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/5"
              >
                #{tag}
              </span>
            ))}
            {place.tags.length > 3 && (
              <span className="text-[11px] px-1.5 py-0.5 text-slate-400">
                +{place.tags.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
