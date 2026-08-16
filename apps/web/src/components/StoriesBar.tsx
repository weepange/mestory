"use client";

import React, { useState } from "react";
import { Plus, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import { StoryViewerModal } from "./StoryViewerModal";

interface StoryGroup {
  author: {
    id: string;
    name: string;
    handle: string;
    avatarUrl?: string;
  };
  hasUnseen: boolean;
  stories: {
    id: string;
    title: string;
    mediaUrl: string;
    mediaType: "IMAGE" | "VIDEO";
    placeId?: string;
    placeName?: string;
    eventId?: string;
    eventTitle?: string;
    author: any;
    viewsCount: number;
  }[];
}

interface StoriesBarProps {
  groups: StoryGroup[];
  onOpenCreateStory?: () => void;
  onPlaceSelect?: (placeId: string) => void;
}

export function StoriesBar({
  groups,
  onOpenCreateStory,
  onPlaceSelect
}: StoriesBarProps) {
  const { user, openAuthModal } = useAuth();
  const [activeGroupIndex, setActiveGroupIndex] = useState<number | null>(null);

  return (
    <div className="w-full py-4 border-b border-white/5 bg-background/50 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center gap-4 overflow-x-auto no-scrollbar pb-1">
          {/* Кнопка "Добавить историю" */}
          <div className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group">
            <button
              onClick={() => {
                if (!user) {
                  openAuthModal();
                } else {
                  onOpenCreateStory?.();
                }
              }}
              className="relative w-16 h-16 rounded-full bg-white/5 border border-dashed border-white/25 hover:border-amber-400/60 flex items-center justify-center transition-all group-hover:scale-105 group-hover:bg-white/10"
            >
              <Plus className="w-6 h-6 text-amber-400 group-hover:scale-110 transition-transform" />
              <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-amber-500 flex items-center justify-center shadow-lg">
                <Sparkles className="w-3 h-3 text-slate-950" />
              </div>
            </button>
            <span className="text-[11px] font-medium text-slate-300 group-hover:text-amber-400 transition-colors">
              История
            </span>
          </div>

          {/* Истории авторов и заведений */}
          {groups.map((group, index) => {
            const firstStory = group.stories[0];
            const author = group.author;

            return (
              <div
                key={author.id || index}
                onClick={() => setActiveGroupIndex(index)}
                className="flex flex-col items-center gap-1.5 flex-shrink-0 cursor-pointer group"
              >
                <div className="stories-gradient-ring group-hover:scale-105 transition-transform">
                  <div className="p-0.5 bg-[#0B0E14] rounded-full">
                    <img
                      src={
                        author.avatarUrl ||
                        firstStory?.mediaUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                      }
                      alt={author.name}
                      className="w-14 h-14 rounded-full object-cover"
                    />
                  </div>
                </div>
                <span className="text-[11px] font-medium text-slate-200 max-w-[70px] truncate text-center group-hover:text-amber-400 transition-colors">
                  {author.name.split(" ")[0]}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Полноэкранный плеер историй */}
      {activeGroupIndex !== null && (
        <StoryViewerModal
          groups={groups}
          initialGroupIndex={activeGroupIndex}
          onClose={() => setActiveGroupIndex(null)}
          onPlaceSelect={(placeId) => {
            setActiveGroupIndex(null);
            onPlaceSelect?.(placeId);
          }}
        />
      )}
    </div>
  );
}
