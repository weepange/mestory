"use client";

import React, { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Sparkles,
  Users,
  Layers,
  Star,
  Bookmark,
  MessageSquare,
  Share2,
  Check
} from "lucide-react";
import { Header } from "@/components/Header";
import { CollectionCard } from "@/components/CollectionCard";
import { PlaceDetailDrawer } from "@/components/PlaceDetailDrawer";
import { AuthModal } from "@/components/AuthModal";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";

export default function AuthorProfilePage() {
  const params = useParams();
  const handle = params.handle as string;
  const { user, openAuthModal } = useAuth();

  const [author, setAuthor] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(0);
  const [selectedPlaceId, setSelectedPlaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!handle) return;
    setIsLoading(true);
    api
      .getUserProfile(handle)
      .then((data) => {
        setAuthor(data);
        setFollowersCount(data.followersCount || 0);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [handle]);

  const handleFollowToggle = async () => {
    if (!user) {
      openAuthModal();
      return;
    }
    if (!author) return;

    try {
      const res = await api.toggleFollow(author.id);
      setIsFollowing(res.following);
      setFollowersCount((prev) => (res.following ? prev + 1 : Math.max(0, prev - 1)));
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14]">
      <Header />

      <main className="flex-1 max-w-5xl w-full mx-auto px-4 sm:px-6 py-8 space-y-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-amber-400 hover:underline"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Вернуться в ленту</span>
        </Link>

        {isLoading ? (
          <div className="flex items-center justify-center p-16">
            <div className="animate-spin w-8 h-8 border-2 border-amber-400 border-t-transparent rounded-full" />
          </div>
        ) : author ? (
          <div className="space-y-8">
            {/* Карточка профиля автора */}
            <div className="glass-panel rounded-3xl p-6 sm:p-8 relative overflow-hidden border border-white/10 shadow-2xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-5">
                  <div className="stories-gradient-ring p-1">
                    <img
                      src={
                        author.avatarUrl ||
                        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&q=80"
                      }
                      alt={author.name}
                      className="w-20 h-20 rounded-full object-cover border-2 border-[#0B0E14]"
                    />
                  </div>

                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h1 className="text-xl sm:text-2xl font-bold font-display text-white">
                        {author.name}
                      </h1>
                      {author.isVerifiedCreator && (
                        <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[11px] font-semibold flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-amber-400" />
                          Автор
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-amber-400 font-medium">
                      @{author.handle}
                    </p>
                    <p className="text-xs text-slate-300 max-w-lg leading-relaxed pt-1">
                      {author.bio || "Исследователь городских пространств и гастрономии"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-stretch sm:self-auto">
                  <button
                    onClick={handleFollowToggle}
                    className={`flex-1 sm:flex-none px-6 py-2.5 rounded-2xl text-xs font-bold transition-all shadow ${
                      isFollowing
                        ? "bg-white/10 text-white border border-white/20 hover:bg-white/15"
                        : "bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 hover:from-amber-400 hover:to-amber-500 shadow-glowAmber"
                    }`}
                  >
                    {isFollowing ? "Вы подписаны ✓" : "Подписаться"}
                  </button>
                </div>
              </div>

              {/* Метрики автора */}
              <div className="grid grid-cols-3 gap-4 pt-6 mt-6 border-t border-white/10 text-center">
                <div>
                  <p className="text-lg font-bold text-white">{followersCount}</p>
                  <p className="text-[11px] text-slate-400">Подписчиков</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {author.collections?.length || 0}
                  </p>
                  <p className="text-[11px] text-slate-400">Подборок</p>
                </div>
                <div>
                  <p className="text-lg font-bold text-white">
                    {author.posts?.length || 0}
                  </p>
                  <p className="text-[11px] text-slate-400">Обзоров мест</p>
                </div>
              </div>
            </div>

            {/* Подборки автора */}
            {author.collections && author.collections.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-400" />
                  <span>Авторские подборки ({author.collections.length})</span>
                </h2>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  {author.collections.map((col: any) => (
                    <CollectionCard
                      key={col.id}
                      collection={{
                        ...col,
                        author: {
                          id: author.id,
                          name: author.name,
                          handle: author.handle,
                          avatarUrl: author.avatarUrl,
                          role: author.role,
                          cityId: author.cityId
                        }
                      }}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Обзоры автора */}
            {author.posts && author.posts.length > 0 && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-amber-400" />
                  <span>Обзоры и рекомендации</span>
                </h2>

                <div className="space-y-4">
                  {author.posts.map((post: any) => (
                    <div
                      key={post.id}
                      className="glass-card rounded-3xl p-5 space-y-3"
                    >
                      {post.place && (
                        <div
                          onClick={() => setSelectedPlaceId(post.place.id)}
                          className="flex items-center justify-between p-3 rounded-2xl bg-white/5 hover:bg-white/10 cursor-pointer border border-white/5 transition-colors"
                        >
                          <div>
                            <p className="text-xs font-bold text-white">
                              {post.place.name}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {post.place.address}
                            </p>
                          </div>
                          {post.rating && (
                            <span className="text-xs font-bold text-amber-400">
                              ⭐ {post.rating}
                            </span>
                          )}
                        </div>
                      )}

                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {post.content}
                      </p>

                      {post.photos && post.photos.length > 0 && (
                        <div className="flex gap-2 overflow-x-auto">
                          {post.photos.map((ph: string, i: number) => (
                            <img
                              key={i}
                              src={ph}
                              alt=""
                              className="w-32 h-24 rounded-xl object-cover"
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="p-12 text-center text-slate-400">
            Автор не найден
          </div>
        )}
      </main>

      <PlaceDetailDrawer
        placeId={selectedPlaceId}
        onClose={() => setSelectedPlaceId(null)}
      />

      <AuthModal />
    </div>
  );
}
