"use client";

import React from "react";
import Link from "next/link";
import { Layers, Bookmark, Sparkles, ChevronRight } from "lucide-react";
import { CollectionItem } from "@mestory/shared";

interface CollectionCardProps {
  collection: CollectionItem;
  onSelect?: (col: CollectionItem) => void;
}

export function CollectionCard({ collection, onSelect }: CollectionCardProps) {
  return (
    <div
      onClick={() => onSelect?.(collection)}
      className="glass-card rounded-3xl p-5 cursor-pointer group flex flex-col justify-between"
    >
      <div className="relative aspect-[16/9] w-full rounded-2xl overflow-hidden mb-4 bg-slate-900">
        <img
          src={collection.coverPhoto}
          alt={collection.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

        <div className="absolute top-3 left-3 z-10">
          <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-500/90 text-slate-950 flex items-center gap-1.5 backdrop-blur-md shadow">
            <Layers className="w-3.5 h-3.5" />
            <span>Подборка • {collection.placesCount} мест</span>
          </span>
        </div>

        <div className="absolute bottom-3 left-3 z-10 flex items-center gap-2">
          <img
            src={
              collection.author.avatarUrl ||
              "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
            }
            alt={collection.author.name}
            className="w-6 h-6 rounded-full object-cover border border-white/50"
          />
          <span className="text-xs font-medium text-white/90 drop-shadow">
            Автор @{collection.author.handle}
          </span>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-base font-bold text-white group-hover:text-amber-400 transition-colors flex items-center justify-between">
          <span>{collection.title}</span>
          <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-amber-400 group-hover:translate-x-1 transition-all" />
        </h3>

        <p className="text-xs text-slate-400 line-clamp-2 leading-relaxed">
          {collection.description}
        </p>

        <div className="pt-2 flex items-center justify-between text-xs text-slate-400 border-t border-white/5">
          <span className="text-amber-300 font-medium">
            ⭐ Выбор жителей города
          </span>
          <span className="flex items-center gap-1">
            <Bookmark className="w-3.5 h-3.5" />
            {collection.savesCount} сохранений
          </span>
        </div>
      </div>
    </div>
  );
}
