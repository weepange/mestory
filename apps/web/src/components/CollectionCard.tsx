"use client";

import React from "react";
import Link from "next/link";
import { Layers, Bookmark, Sparkles, ChevronRight, User } from "lucide-react";
import { CollectionItem } from "@mestory/shared";

interface CollectionCardProps {
  collection: CollectionItem;
  onSelect?: (col: CollectionItem) => void;
}

export function CollectionCard({ collection, onSelect }: CollectionCardProps) {
  return (
    <div
      onClick={() => onSelect?.(collection)}
      className="glass-card rounded-3xl overflow-hidden cursor-pointer group flex flex-col justify-between h-full hover:border-amber-500/40 transition-all duration-300 shadow-xl"
    >
      {/* Верхний медиа-блок */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-900">
        <img
          src={collection.coverPhoto}
          alt={collection.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30 pointer-events-none" />

        {/* Бейдж подборки */}
        <div className="absolute top-3.5 left-3.5 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/95 text-slate-950 flex items-center gap-1.5 backdrop-blur-md shadow-lg">
            <Layers className="w-3.5 h-3.5" />
            <span>Подборка • {collection.placesCount} мест</span>
          </span>
        </div>

        {/* Бейдж автора */}
        <div className="absolute bottom-3 left-3.5 z-10 flex items-center gap-2">
          <img
            src={
              collection.author.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
            }
            alt={collection.author.name}
            className="w-6 h-6 rounded-full object-cover border border-white/40 shadow-sm"
          />
          <span className="text-xs font-semibold text-white/95 drop-shadow">
            Автор @{collection.author.handle}
          </span>
        </div>
      </div>

      {/* Контентная часть */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div className="space-y-2">
          <div className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
            <Sparkles className="w-3 h-3" />
            <span>Тематический гид</span>
          </div>

          <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between leading-snug">
            <span>{collection.title}</span>
            <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-2" />
          </h3>

          <p className="text-xs text-slate-300/90 line-clamp-2 leading-relaxed">
            {collection.description}
          </p>
        </div>

        {/* Нижний колонтитул */}
        <div className="pt-3 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
          <span className="text-amber-300 font-medium flex items-center gap-1">
            ⭐ Выбор жителей
          </span>
          <span className="flex items-center gap-1 text-slate-300">
            <Bookmark className="w-3.5 h-3.5 text-amber-400" />
            <span>{collection.savesCount} сохранений</span>
          </span>
        </div>
      </div>
    </div>
  );
}
