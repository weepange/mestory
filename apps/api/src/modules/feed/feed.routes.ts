import { FastifyPluginAsync } from "fastify";
import { FeedRecommendationCard, PlaceCategoryId } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";
import {
  calculateDistanceMeters,
  getGeoProximityScore,
  getTagMatchScore
} from "../../lib/geo";

export const feedRoutes: FastifyPluginAsync = async (fastify) => {
  fastify.get("/", async (request) => {
    let currentUserId: string | undefined;
    let userInterests: string[] = [];

    // Попытка извлечь текущего пользователя из JWT
    try {
      await request.jwtVerify();
      const payload = request.user as { id: string };
      currentUserId = payload.id;
      const user = await prisma.user.findUnique({
        where: { id: currentUserId },
        select: { interests: true }
      });
      if (user) {
        userInterests = parseJson<string[]>(user.interests, []);
      }
    } catch {
      // Гостевой режим
    }

    const query = request.query as {
      cityId?: string;
      category?: string;
      tags?: string;
      lat?: string;
      lng?: string;
      search?: string;
    };

    const cityId = query.cityId || "rostov-on-don";
    const userLat = query.lat ? parseFloat(query.lat) : undefined;
    const userLng = query.lng ? parseFloat(query.lng) : undefined;

    if (query.tags) {
      const extraTags = query.tags.split(",").map((t) => t.trim()).filter(Boolean);
      userInterests = Array.from(new Set([...userInterests, ...extraTags]));
    }

    // 1. Получаем места
    const placesWhere: Record<string, unknown> = { cityId };
    if (query.category && query.category !== "all") {
      placesWhere.category = query.category;
    }
    if (query.search) {
      placesWhere.OR = [
        { name: { contains: query.search } },
        { summary: { contains: query.search } },
        { tags: { contains: query.search } }
      ];
    }

    const places = await prisma.place.findMany({
      where: placesWhere,
      include: {
        businessOwner: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, isVerifiedCreator: true, cityId: true }
        }
      }
    });

    // 2. Получаем актуальные события
    const events = await prisma.event.findMany({
      where: {
        cityId,
        startDateTime: { gte: new Date(Date.now() - 6 * 60 * 60 * 1000) }
      },
      include: {
        organizer: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, isVerifiedCreator: true, cityId: true }
        },
        place: true
      }
    });

    // 3. Получаем авторские подборки
    const collections = await prisma.collection.findMany({
      where: { cityId, isPublic: true },
      take: 6,
      orderBy: { savesCount: "desc" },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, isVerifiedCreator: true, cityId: true }
        },
        items: {
          include: { place: true },
          take: 3
        }
      }
    });

    const feedCards: FeedRecommendationCard[] = [];

    // Скоринг мест
    for (const place of places) {
      const placeTags = parseJson<string[]>(place.tags, []);
      let distanceMeters: number | undefined;
      let geoScore = 50; // базовый вес

      if (userLat !== undefined && userLng !== undefined) {
        distanceMeters = calculateDistanceMeters(userLat, userLng, place.lat, place.lng);
        geoScore = getGeoProximityScore(distanceMeters);
      }

      const { score: tagScore, matchedTags } = getTagMatchScore(placeTags, userInterests);
      const ratingScore = Math.min(100, Math.round(place.rating * 20));
      const engagementScore = Math.min(100, place.savesCount * 5 + place.reviewsCount * 3);
      const verifiedBonus = place.isVerifiedBusiness ? 15 : 0;

      // Формула гибридного ранжирования
      const totalScore = Math.round(
        geoScore * 0.35 +
        tagScore * 0.30 +
        ratingScore * 0.20 +
        engagementScore * 0.10 +
        verifiedBonus * 0.05
      );

      const matchReasons: string[] = [];
      if (distanceMeters !== undefined && distanceMeters <= 1500) {
        matchReasons.push(
          distanceMeters < 1000 ? `${distanceMeters} м от вас` : `${(distanceMeters / 1000).toFixed(1)} км от вас`
        );
      }
      if (matchedTags.length > 0) {
        matchReasons.push(`По вашим интересам: ${matchedTags.slice(0, 2).join(", ")}`);
      }
      if (place.rating >= 4.8) {
        matchReasons.push(`Высокий рейтинг ⭐ ${place.rating}`);
      }
      if (place.savesCount >= 10) {
        matchReasons.push(`В сохраненных у ${place.savesCount} жителей`);
      }

      feedCards.push({
        type: "PLACE",
        id: `place-${place.id}`,
        score: totalScore,
        matchReasons: matchReasons.length > 0 ? matchReasons : ["Популярное место в городе"],
        place: {
          id: place.id,
          name: place.name,
          slug: place.slug,
          summary: place.summary,
          description: place.description,
          category: place.category as PlaceCategoryId,
          cityId: place.cityId as any,
          address: place.address,
          lat: place.lat,
          lng: place.lng,
          workingHoursText: place.workingHoursText,
          phone: place.phone || undefined,
          website: place.website || undefined,
          telegram: place.telegram || undefined,
          vk: place.vk || undefined,
          priceRange: place.priceRange as any,
          averageCheck: place.averageCheck || undefined,
          photos: parseJson<string[]>(place.photos, []),
          coverPhoto: place.coverPhoto,
          tags: placeTags,
          rating: place.rating,
          reviewsCount: place.reviewsCount,
          savesCount: place.savesCount,
          distanceMeters,
          isVerifiedBusiness: place.isVerifiedBusiness,
          createdAt: place.createdAt.toISOString()
        }
      });
    }

    // Скоринг событий
    for (const event of events) {
      const eventTags = parseJson<string[]>(event.tags, []);
      const { score: tagScore, matchedTags } = getTagMatchScore(eventTags, userInterests);
      const isSoon =
        new Date(event.startDateTime).getTime() - Date.now() < 3 * 24 * 60 * 60 * 1000;
      const timeScore = isSoon ? 95 : 60;
      const totalScore = Math.round(tagScore * 0.4 + timeScore * 0.4 + (event.savesCount * 4));

      const matchReasons: string[] = ["Афиша города"];
      if (isSoon) matchReasons.push("Скоро состоится");
      if (matchedTags.length > 0) matchReasons.push(matchedTags[0]);

      feedCards.push({
        type: "EVENT",
        id: `event-${event.id}`,
        score: totalScore,
        matchReasons,
        event: {
          id: event.id,
          title: event.title,
          slug: event.slug,
          description: event.description,
          category: event.category as PlaceCategoryId,
          cityId: event.cityId as any,
          placeId: event.placeId || undefined,
          placeName: event.placeName || event.place?.name,
          placeAddress: event.placeAddress || event.place?.address,
          lat: event.lat,
          lng: event.lng,
          startDateTime: event.startDateTime.toISOString(),
          endDateTime: event.endDateTime?.toISOString(),
          isFree: event.isFree,
          priceText: event.priceText,
          ticketUrl: event.ticketUrl || undefined,
          coverPhoto: event.coverPhoto,
          tags: eventTags,
          savesCount: event.savesCount,
          organizer: event.organizer,
          createdAt: event.createdAt.toISOString()
        }
      });
    }

    // Добавляем авторские подборки
    for (const col of collections) {
      feedCards.push({
        type: "COLLECTION",
        id: `collection-${col.id}`,
        score: 75 + col.savesCount * 2,
        matchReasons: [`Авторская подборка от @${col.author.handle}`, `${col.items.length} мест`],
        collection: {
          id: col.id,
          title: col.title,
          slug: col.slug,
          description: col.description,
          coverPhoto: col.coverPhoto,
          author: col.author,
          cityId: col.cityId as any,
          isPublic: col.isPublic,
          placesCount: col.items.length,
          savesCount: col.savesCount,
          createdAt: col.createdAt.toISOString()
        }
      });
    }

    // Сортируем ленту по итоговому скору
    feedCards.sort((a, b) => b.score - a.score);

    return {
      items: feedCards,
      total: feedCards.length,
      hasMore: false,
      cityId
    };
  });
};
