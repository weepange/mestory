"use client";

import React from "react";
import { Calendar, MapPin, Ticket, Sparkles, ChevronRight } from "lucide-react";
import { EventItem } from "@mestory/shared";

interface EventCardProps {
  event: EventItem;
  onSelect?: (event: EventItem) => void;
}

export function EventCard({ event, onSelect }: EventCardProps) {
  const dateObj = new Date(event.startDateTime);
  const formattedDate = dateObj.toLocaleDateString("ru-RU", {
    day: "numeric",
    month: "long"
  });
  const formattedTime = dateObj.toLocaleTimeString("ru-RU", {
    hour: "2-digit",
    minute: "2-digit"
  });

  return (
    <div
      onClick={() => onSelect?.(event)}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between h-full hover:border-amber-500/40 transition-all duration-300 shadow-xl"
    >
      {/* Верхний медиа-блок с фото */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={event.coverPhoto}
          alt={event.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-black/30 pointer-events-none" />

        {/* Дата события бейдж */}
        <div className="absolute top-3.5 left-3.5 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-indigo-600/90 text-white text-xs font-bold backdrop-blur-md shadow-lg border border-indigo-400/30">
          <Calendar className="w-3.5 h-3.5" />
          <span>
            {formattedDate} в {formattedTime}
          </span>
        </div>

        {/* Цена */}
        <div className="absolute top-3.5 right-3.5 z-10">
          <span
            className={`px-3 py-1.5 rounded-full text-xs font-bold backdrop-blur-md border shadow-lg ${
              event.isFree
                ? "bg-emerald-500/90 text-slate-950 border-emerald-400"
                : "bg-black/70 text-amber-400 border-amber-400/40"
            }`}
          >
            {event.priceText}
          </span>
        </div>

        {/* Организатор */}
        <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-2">
          <img
            src={
              event.organizer.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
            }
            alt={event.organizer.name}
            className="w-6 h-6 rounded-full object-cover border border-white/40 shadow-sm"
          />
          <span className="text-xs font-semibold text-white/95 drop-shadow">
            @{event.organizer.handle}
          </span>
        </div>
      </div>

      {/* Контентная часть */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-indigo-400">
            <Sparkles className="w-3 h-3" />
            <span>Афиша городских событий</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors leading-snug">
            {event.title}
          </h3>

          <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed">
            {event.description}
          </p>

          {event.placeName && (
            <div className="flex items-center gap-2 text-xs text-slate-300 pt-1">
              <MapPin className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span className="truncate">{event.placeName}</span>
            </div>
          )}
        </div>

        {event.ticketUrl && (
          <div className="pt-2 border-t border-white/5">
            <a
              href={event.ticketUrl}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-white flex items-center justify-center gap-1.5 transition-all border border-white/15"
            >
              <Ticket className="w-3.5 h-3.5" />
              <span>Регистрация / Билеты</span>
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
