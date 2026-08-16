"use client";

import React, { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import {
  X,
  ChevronLeft,
  ChevronRight,
  MapPin,
  Eye,
  Sparkles,
  Heart,
  Share2,
  Volume2,
  VolumeX,
  Pause,
  Play
} from "lucide-react";
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
  const [mounted, setMounted] = useState(false);
  const [groupIndex, setGroupIndex] = useState(initialGroupIndex);
  const [storyIndex, setStoryIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isLiked, setIsLiked] = useState(false);

  const currentGroup = groups[groupIndex];
  const currentStory = currentGroup?.stories[storyIndex];
  const progressTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    // Блокировка скролла страницы при открытых историях
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Отправка просмотра истории
  useEffect(() => {
    if (currentStory?.id) {
      api.viewStory(currentStory.id).catch(() => {});
    }
  }, [currentStory?.id]);

  const handleNext = React.useCallback(() => {
    setProgress(0);
    setIsLiked(false);
    if (currentGroup && storyIndex < currentGroup.stories.length - 1) {
      setStoryIndex(storyIndex + 1);
    } else if (groupIndex < groups.length - 1) {
      setGroupIndex(groupIndex + 1);
      setStoryIndex(0);
    } else {
      onClose();
    }
  }, [currentGroup, storyIndex, groupIndex, groups.length, onClose]);

  const handlePrev = React.useCallback(() => {
    setProgress(0);
    setIsLiked(false);
    if (storyIndex > 0) {
      setStoryIndex(storyIndex - 1);
    } else if (groupIndex > 0) {
      setGroupIndex(groupIndex - 1);
      setStoryIndex(groups[groupIndex - 1].stories.length - 1);
    }
  }, [storyIndex, groupIndex, groups]);

  // Таймер прогресса (5 секунд на показ слайда)
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const interval = 50;
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
  }, [isPaused, currentStory, handleNext]);

  // Горячие клавиши
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") handleNext();
      if (e.key === "ArrowLeft") handlePrev();
      if (e.key === " ") setIsPaused((prev) => !prev);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNext, handlePrev, onClose]);

  if (!mounted || !currentGroup || !currentStory) return null;

  const modalContent = (
    <div className="fixed inset-0 z-[9999] bg-black/95 backdrop-blur-3xl flex items-center justify-center p-0 sm:p-4 select-none">
      {/* Кнопка закрытия */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 sm:top-6 sm:right-6 w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-all z-50 hover:scale-105 active:scale-95"
        title="Закрыть (Esc)"
      >
        <X className="w-6 h-6" />
      </button>

      {/* Навигация к предыдущей группе историй на десктопе */}
      <button
        onClick={handlePrev}
        disabled={groupIndex === 0 && storyIndex === 0}
        className="hidden md:flex absolute left-8 lg:left-16 top-1/2 -translate-y-1/2 w-13 h-13 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all disabled:opacity-20 disabled:cursor-not-allowed z-40 hover:scale-110 active:scale-95 p-3"
      >
        <ChevronLeft className="w-7 h-7" />
      </button>

      {/* Навигация к следующей группе историй на десктопе */}
      <button
        onClick={handleNext}
        className="hidden md:flex absolute right-8 lg:right-16 top-1/2 -translate-y-1/2 w-13 h-13 rounded-full bg-white/10 hover:bg-white/20 text-white items-center justify-center transition-all z-40 hover:scale-110 active:scale-95 p-3"
      >
        <ChevronRight className="w-7 h-7" />
      </button>

      {/* Основной контейнер сторис (Instagram 9:16 формат) */}
      <div
        className="relative w-full h-full sm:h-[90vh] sm:max-h-[820px] sm:max-w-[430px] sm:rounded-[32px] overflow-hidden shadow-[0_0_80px_rgba(0,0,0,0.9)] bg-black border sm:border-white/15 flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Фоновое фото / видео */}
        <img
          src={currentStory.mediaUrl}
          alt={currentStory.title}
          className="absolute inset-0 w-full h-full object-cover select-none pointer-events-none"
        />

        {/* Затемняющие градиенты сверху и снизу для читаемости текста */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/85 via-transparent to-black/90 pointer-events-none" />

        {/* ----------------- ВЕРХНЯЯ ПАНЕЛЬ ----------------- */}
        <div className="relative z-30 p-4 pt-4 sm:pt-5 space-y-3">
          {/* Индикаторы прогресса */}
          <div className="flex items-center gap-1.5">
            {currentGroup.stories.map((_: any, idx: number) => (
              <div
                key={idx}
                className="flex-1 h-1 rounded-full bg-white/30 overflow-hidden"
              >
                <div
                  className="h-full bg-amber-400 rounded-full transition-all duration-75"
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

          {/* Автор и статистика */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-0.5 rounded-full bg-gradient-to-tr from-amber-500 to-rose-500">
                <img
                  src={
                    currentGroup.author.avatarUrl ||
                    "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                  }
                  alt={currentGroup.author.name}
                  className="w-10 h-10 rounded-full object-cover border-2 border-black"
                />
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold text-white leading-none">
                    {currentGroup.author.name}
                  </span>
                  {currentGroup.author.isVerifiedCreator && (
                    <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  )}
                </div>
                <span className="text-xs font-medium text-amber-400/90">
                  @{currentGroup.author.handle}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 text-xs text-white/80 bg-white/10 px-2.5 py-1 rounded-full backdrop-blur-md">
                <Eye className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentStory.viewsCount + 1}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ----------------- НЕВИДИМЫЕ КЛИК-ЗОНЫ ДЛЯ СВАЙПА ----------------- */}
        <div className="relative flex-1 flex z-20">
          <div
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            className="w-1/3 h-full cursor-pointer"
            title="Назад"
          />
          <div
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            className="w-2/3 h-full cursor-pointer"
            title="Вперед"
          />
        </div>

        {/* ----------------- НИЖНЯЯ ПАНЕЛЬ ----------------- */}
        <div className="relative z-30 p-5 pt-0 space-y-3">
          {/* Заголовок истории */}
          <h3 className="text-lg sm:text-xl font-bold text-white leading-snug drop-shadow-[0_2px_10px_rgba(0,0,0,0.8)]">
            {currentStory.title}
          </h3>

          {/* Инстаграм-стиль: привязанная карточка места с прямым переходом */}
          {currentStory.placeId && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (onPlaceSelect && currentStory.placeId) {
                  onPlaceSelect(currentStory.placeId);
                }
              }}
              className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-black/60 hover:bg-black/80 border border-white/20 backdrop-blur-xl transition-all group active:scale-98 shadow-xl"
            >
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 flex items-center justify-center border border-amber-500/40 text-amber-400">
                  <MapPin className="w-5 h-5" />
                </div>
                <div className="text-left">
                  <p className="text-xs font-bold text-white group-hover:text-amber-300 transition-colors">
                    {currentStory.placeName || "Смотреть заведение"}
                  </p>
                  <p className="text-[11px] text-slate-300">
                    Маршрут и отзывы в Яндекс.Картах
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-amber-400 group-hover:translate-x-1 transition-transform" />
            </button>
          )}

          {/* Instagram-style панель быстрых реакций */}
          <div className="flex items-center gap-2 pt-1">
            <div className="flex-1 px-4 py-2.5 rounded-full bg-white/10 border border-white/15 backdrop-blur-md text-xs text-white/60">
              Ответить автору...
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setIsLiked(!isLiked);
              }}
              className={`p-2.5 rounded-full border backdrop-blur-md transition-all active:scale-75 ${
                isLiked
                  ? "bg-rose-500/20 border-rose-500/40 text-rose-500"
                  : "bg-white/10 border-white/15 text-white hover:text-rose-400"
              }`}
            >
              <Heart
                className={`w-5 h-5 ${isLiked ? "fill-rose-500" : ""}`}
              />
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
