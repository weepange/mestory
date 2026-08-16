import { FastifyPluginAsync } from "fastify";
import { CreatePlaceSchema, PlaceCategoryId } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";
import { calculateDistanceMeters } from "../../lib/geo";

export const placesRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить список мест с фильтрами и гео-поиском
  fastify.get("/", async (request) => {
    const query = request.query as {
      cityId?: string;
      category?: string;
      tags?: string;
      search?: string;
      lat?: string;
      lng?: string;
      radiusKm?: string;
      isOpenNow?: string;
      limit?: string;
    };

    const cityId = query.cityId || "rostov-on-don";
    const userLat = query.lat ? parseFloat(query.lat) : undefined;
    const userLng = query.lng ? parseFloat(query.lng) : undefined;
    const radiusMeters = query.radiusKm ? parseFloat(query.radiusKm) * 1000 : undefined;
    const limit = query.limit ? parseInt(query.limit, 10) : 50;

    const where: Record<string, unknown> = {
      cityId
    };

    if (query.category && query.category !== "all") {
      where.category = query.category;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search } },
        { summary: { contains: query.search } },
        { description: { contains: query.search } },
        { address: { contains: query.search } },
        { tags: { contains: query.search } }
      ];
    }

    const places = await prisma.place.findMany({
      where,
      take: limit,
      orderBy: [{ rating: "desc" }, { savesCount: "desc" }],
      include: {
        businessOwner: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, cityId: true }
        }
      }
    });

    let items = places.map((place) => {
      let distanceMeters: number | undefined = undefined;
      if (userLat !== undefined && userLng !== undefined) {
        distanceMeters = calculateDistanceMeters(userLat, userLng, place.lat, place.lng);
      }

      return {
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
        tags: parseJson<string[]>(place.tags, []),
        rating: place.rating,
        reviewsCount: place.reviewsCount,
        savesCount: place.savesCount,
        distanceMeters,
        isVerifiedBusiness: place.isVerifiedBusiness,
        businessOwnerId: place.businessOwnerId || undefined,
        createdAt: place.createdAt.toISOString()
      };
    });

    // Фильтрация по радиусу, если задан
    if (radiusMeters && userLat !== undefined && userLng !== undefined) {
      items = items.filter((item) => item.distanceMeters !== undefined && item.distanceMeters <= radiusMeters);
      items.sort((a, b) => (a.distanceMeters ?? 0) - (b.distanceMeters ?? 0));
    }

    return {
      items,
      total: items.length,
      cityId
    };
  });

  // Получить детальную карточку места
  fastify.get("/:idOrSlug", async (request, reply) => {
    const { idOrSlug } = request.params as { idOrSlug: string };

    const place = await prisma.place.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        businessOwner: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, cityId: true, isVerifiedCreator: true }
        },
        events: {
          where: { startDateTime: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } },
          take: 5,
          orderBy: { startDateTime: "asc" }
        },
        posts: {
          take: 10,
          orderBy: { createdAt: "desc" },
          include: {
            author: {
              select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
            }
          }
        }
      }
    });

    if (!place) {
      return reply.status(404).send({ error: "Место не найдено" });
    }

    return {
      id: place.id,
      name: place.name,
      slug: place.slug,
      summary: place.summary,
      description: place.description,
      category: place.category as PlaceCategoryId,
      cityId: place.cityId,
      address: place.address,
      lat: place.lat,
      lng: place.lng,
      workingHoursText: place.workingHoursText,
      phone: place.phone,
      website: place.website,
      telegram: place.telegram,
      vk: place.vk,
      priceRange: place.priceRange,
      averageCheck: place.averageCheck,
      photos: parseJson<string[]>(place.photos, []),
      coverPhoto: place.coverPhoto,
      tags: parseJson<string[]>(place.tags, []),
      rating: place.rating,
      reviewsCount: place.reviewsCount,
      savesCount: place.savesCount,
      isVerifiedBusiness: place.isVerifiedBusiness,
      events: place.events.map((ev) => ({
        id: ev.id,
        title: ev.title,
        slug: ev.slug,
        startDateTime: ev.startDateTime.toISOString(),
        priceText: ev.priceText,
        coverPhoto: ev.coverPhoto
      })),
      reviews: place.posts.map((post) => ({
        id: post.id,
        author: post.author,
        rating: post.rating,
        content: post.content,
        photos: parseJson<string[]>(post.photos, []),
        likesCount: post.likesCount,
        createdAt: post.createdAt.toISOString()
      })),
      createdAt: place.createdAt.toISOString()
    };
  });

  // Добавить новое место (автор или бизнес)
  fastify.post("/", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = CreatePlaceSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const data = parseResult.data;
    const slug = data.name
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);

    const place = await prisma.place.create({
      data: {
        name: data.name,
        slug,
        summary: data.summary,
        description: data.description,
        category: data.category,
        cityId: data.cityId,
        address: data.address,
        lat: data.lat,
        lng: data.lng,
        workingHoursText: data.workingHoursText,
        phone: data.phone || null,
        website: data.website || null,
        telegram: data.telegram || null,
        vk: data.vk || null,
        priceRange: data.priceRange,
        averageCheck: data.averageCheck || null,
        photos: JSON.stringify(data.photos),
        coverPhoto: data.coverPhoto,
        tags: JSON.stringify(data.tags),
        businessOwnerId: payload.id
      }
    });

    return reply.status(201).send({
      ...place,
      photos: parseJson<string[]>(place.photos, []),
      tags: parseJson<string[]>(place.tags, [])
    });
  });
};
