"use client";

import React, { useState, useEffect, useRef } from "react";
import { X, ChevronLeft, ChevronRight, MapPin, Eye, Sparkles } from "lucide-react";
import { api } from "@/lib/api";

interface StoryViewerModalProps {
  groups: any[];
  initialGroupIndex: number;
  onClose: () => void;
  onPlaceSelect?: (placeId: string) => void;
}

export function StoryViewerModal({
  groups,
  initialGroupIndex,
  onClose,
  onPlaceSelect
}: StoryViewerModalProps) {
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const progressTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Отправка события просмотра
  useEffect(() => {
    if (currentStory?.id) {
      api.viewStory(currentStory.id).catch(() => {});
    }
  }, [currentStory?.id]);

  // Таймер прогресса (5 секунд на историю)
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = 50; // каждые 50мс
    const step = 100 / (5000 / interval);

    progressTimerRef.current = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          handleNext();
          return 0;
        }
        return prev + step;
      });
    }, interval);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [groupIndex, storyIndex, isPaused, currentStory]);

  const handleNext = () => {
    setProgress(0);
    if (storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  };

  const handlePrev = () => {
    setProgress(0);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [groupIndex, storyIndex]);

  if (!currentGroup || !currentStory) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-2xl flex items-center justify-center p-2 sm:p-4">
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors z-50"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Навигация влево/вправо на десктопе */}
      <button
        onClick={handlePrev}
        disabled={groupIndex === 0 && storyIndex === 0}
        className="hidden md:flex absolute left-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors disabled:opacity-30 disabled:cursor-not-allowed z-40"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-colors z-40"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Контейнер сторис */}
      <div
        className="relative w-full max-w-sm sm:max-w-md h-[85vh] max-h-[780px] rounded-3xl overflow-hidden shadow-2xl bg-slate-900 border border-white/15 flex flex-col justify-between select-none"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Фоновое медиа */}
        <img
          src={currentStory.mediaUrl}
          alt={currentStory.title}
          className="absolute inset-0 w-full h-full object-cover"
        />

        {/* Градиентные тени */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-transparent to-black/90 pointer-events-none" />

        {/* Прогресс-бары */}
        <div className="relative z-20 p-4 pb-2">
          <div className="flex items-center gap-1.5 mb-3">
            {currentGroup.stories.map((_: any, idx: number) => (
              <div
                key={idx}
                className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full bg-amber-400 transition-all duration-75"
                  style={{
                    width:
                      idx === storyIndex
                        ? `${progress}%`
                        : idx < storyIndex
                        ? "100%"
                        : "0%"
                  }}
                />
              </div>
            ))}
          </div>

          {/* Автор истории */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <img
                src={
                  currentGroup.author.avatarUrl ||
                  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                }
                alt={currentGroup.author.name}
                className="w-9 h-9 rounded-full object-cover border border-amber-400/60 shadow"
              />
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-semibold text-white leading-none">
                    {currentGroup.author.name}
                  </span>
                  {currentGroup.author.isVerifiedCreator && (
                    <Sparkles className="w-3 h-3 text-amber-400" />
                  )}
                </div>
                <span className="text-xs text-amber-300/80">
                  @{currentGroup.author.handle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-1 text-xs text-white/70 bg-black/40 px-2.5 py-1 rounded-full backdrop-blur-md">
              <Eye className="w-3.5 h-3.5 text-slate-300" />
              <span>{currentStory.viewsCount + 1}</span>
            </div>
          </div>
        </div>

        {/* Невидимые кликабельные зоны для свайпа/переключения тапом */}
        <div className="relative flex-1 flex z-10">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-1/3 h-full cursor-pointer"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-2/3 h-full cursor-pointer"
          />
        </div>

        {/* Нижний блок: Заголовок и привязка к месту */}
        <div className="relative z-20 p-5 space-y-3">
          <h3 className="text-lg font-bold text-white leading-snug drop-shadow-md">
            {currentStory.title}
          </h3>

          {/* Карточка привязанного заведения */}
          {currentStory.placeId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPlaceSelect && currentStory.placeId) {
                  onPlaceSelect(currentStory.placeId);
                }
              }}
              className="w-full flex items-center justify-between p-3 rounded-2xl bg-white/15 hover:bg-white/25 border border-white/20 backdrop-blur-xl transition-all group active:scale-98"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-500/30 flex items-center justify-center border border-amber-500/40">
                  <MapPin className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-semibold text-white group-hover:text-amber-300 transition-colors">
                    {currentStory.placeName || "Посмотреть заведение"}
                  </p>
                  <p className="text-[11px] text-white/70">
                    Открыть карточку и маршрут
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-amber-400 group-hover:translate-x-0.5 transition-transform" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
