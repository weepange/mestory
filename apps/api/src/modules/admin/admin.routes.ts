import { FastifyPluginAsync } from "fastify";
import { prisma, parseJson } from "../../lib/prisma";

export const adminRoutes: FastifyPluginAsync = async (fastify) => {
  // Middleware для проверки прав Администратора
  fastify.addHook("preHandler", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string; role?: string };
    const user = await prisma.user.findUnique({
      where: { id: payload.id },
      select: { role: true }
    });

    if (!user || user.role !== "ADMIN") {
      return reply.status(403).send({ error: "Доступ запрещен. Требуются права Администратора." });
    }
  });

  // 1. Сводная статистика платформы (Overview KPI)
  fastify.get("/stats", async () => {
    const [
      totalUsers,
      totalCreators,
      totalBusinesses,
      totalPlaces,
      verifiedPlaces,
      totalEvents,
      totalStories,
      totalCollections,
      totalPosts,
      totalBookmarks,
      pendingVerifications
    ] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { isVerifiedCreator: true } }),
      prisma.user.count({ where: { role: "BUSINESS" } }),
      prisma.place.count(),
      prisma.place.count({ where: { isVerifiedBusiness: true } }),
      prisma.event.count(),
      prisma.story.count(),
      prisma.collection.count(),
      prisma.post.count(),
      prisma.bookmark.count(),
      prisma.businessProfile.count({ where: { status: "PENDING" } })
    ]);

    return {
      users: {
        total: totalUsers,
        creators: totalCreators,
        businesses: totalBusinesses
      },
      places: {
        total: totalPlaces,
        verified: verifiedPlaces
      },
      content: {
        events: totalEvents,
        stories: totalStories,
        collections: totalCollections,
        reviews: totalPosts,
        bookmarks: totalBookmarks
      },
      verifications: {
        pending: pendingVerifications
      }
    };
  });

  // 2. Места и Заведения (Places CRUD)
  fastify.get("/places", async (request) => {
    const { search, category, isVerified } = request.query as {
      search?: string;
      category?: string;
      isVerified?: string;
    };

    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { address: { contains: search } },
        { summary: { contains: search } }
      ];
    }
    if (category && category !== "all") {
      where.category = category;
    }
    if (isVerified !== undefined && isVerified !== "") {
      where.isVerifiedBusiness = isVerified === "true";
    }

    const items = await prisma.place.findMany({
      where,
      include: {
        businessOwner: {
          select: { id: true, name: true, handle: true, email: true }
        },
        _count: {
          select: { events: true, stories: true, posts: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      total: items.length,
      items: items.map((p) => ({
        ...p,
        photos: parseJson<string[]>(p.photos, []),
        tags: parseJson<string[]>(p.tags, [])
      }))
    };
  });

  fastify.post("/places", async (request, reply) => {
    const data = request.body as any;
    if (!data.name || !data.category || !data.address) {
      return reply.status(400).send({ error: "Заполните обязательные поля: название, категория, адрес" });
    }

    const slug =
      data.slug ||
      data.name
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);

    const place = await prisma.place.create({
      data: {
        name: data.name,
        slug,
        summary: data.summary || data.name,
        description: data.description || data.name,
        category: data.category,
        cityId: data.cityId || "rostov-on-don",
        address: data.address,
        lat: data.lat || 47.2225,
        lng: data.lng || 39.7187,
        workingHoursText: data.workingHoursText || "10:00 – 22:00",
        phone: data.phone || null,
        website: data.website || null,
        telegram: data.telegram || null,
        vk: data.vk || null,
        priceRange: data.priceRange || "MODERATE",
        averageCheck: data.averageCheck || null,
        coverPhoto:
          data.coverPhoto ||
          "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=1200&q=80",
        photos: JSON.stringify(data.photos || []),
        tags: JSON.stringify(data.tags || []),
        rating: data.rating || 5.0,
        isVerifiedBusiness: Boolean(data.isVerifiedBusiness),
        businessOwnerId: data.businessOwnerId || null
      }
    });

    return reply.status(201).send(place);
  });

  fastify.patch("/places/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;

    const updated = await prisma.place.update({
      where: { id },
      data: {
        ...(data.name !== undefined && { name: data.name }),
        ...(data.summary !== undefined && { summary: data.summary }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.category !== undefined && { category: data.category }),
        ...(data.address !== undefined && { address: data.address }),
        ...(data.lat !== undefined && { lat: data.lat }),
        ...(data.lng !== undefined && { lng: data.lng }),
        ...(data.workingHoursText !== undefined && { workingHoursText: data.workingHoursText }),
        ...(data.phone !== undefined && { phone: data.phone }),
        ...(data.website !== undefined && { website: data.website }),
        ...(data.telegram !== undefined && { telegram: data.telegram }),
        ...(data.averageCheck !== undefined && { averageCheck: data.averageCheck }),
        ...(data.priceRange !== undefined && { priceRange: data.priceRange }),
        ...(data.coverPhoto !== undefined && { coverPhoto: data.coverPhoto }),
        ...(data.rating !== undefined && { rating: data.rating }),
        ...(data.isVerifiedBusiness !== undefined && { isVerifiedBusiness: data.isVerifiedBusiness }),
        ...(data.businessOwnerId !== undefined && { businessOwnerId: data.businessOwnerId }),
        ...(data.tags !== undefined && { tags: JSON.stringify(data.tags) })
      }
    });

    return updated;
  });

  fastify.delete("/places/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    await prisma.place.delete({ where: { id } });
    return { success: true, message: "Заведение удалено" };
  });

  // 3. События и Афиша (Events CRUD)
  fastify.get("/events", async () => {
    const items = await prisma.event.findMany({
      include: {
        place: { select: { id: true, name: true, address: true } },
        organizer: { select: { id: true, name: true, handle: true, avatarUrl: true } }
      },
      orderBy: { startDateTime: "desc" }
    });

    return {
      total: items.length,
      items: items.map((e) => ({
        ...e,
        tags: parseJson<string[]>(e.tags, [])
      }))
    };
  });

  fastify.post("/events", async (request, reply) => {
    const payload = request.user as { id: string };
    const data = request.body as any;

    if (!data.title || !data.startDateTime) {
      return reply.status(400).send({ error: "Укажите название и дату события" });
    }

    const slug =
      data.slug ||
      data.title
        .toLowerCase()
        .replace(/[^a-z0-9а-яё]/gi, "-")
        .replace(/-+/g, "-")
        .replace(/^-|-$/g, "") + "-" + Math.floor(Math.random() * 1000);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description || "",
        category: data.category || "events",
        cityId: data.cityId || "rostov-on-don",
        placeId: data.placeId || null,
        placeName: data.placeName || null,
        placeAddress: data.placeAddress || null,
        lat: data.lat || 47.2225,
        lng: data.lng || 39.7187,
        startDateTime: new Date(data.startDateTime),
        isFree: Boolean(data.isFree),
        priceText: data.priceText || (data.isFree ? "Вход свободный" : "По билетам"),
        ticketUrl: data.ticketUrl || null,
        coverPhoto:
          data.coverPhoto ||
          "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?w=1200&q=80",
        tags: JSON.stringify(data.tags || []),
        organizerId: data.organizerId || payload.id
      }
    });

    return reply.status(201).send(event);
  });

  fastify.patch("/events/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as any;

    const updated = await prisma.event.update({
      where: { id },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.priceText !== undefined && { priceText: data.priceText }),
        ...(data.isFree !== undefined && { isFree: data.isFree }),
        ...(data.ticketUrl !== undefined && { ticketUrl: data.ticketUrl }),
        ...(data.coverPhoto !== undefined && { coverPhoto: data.coverPhoto }),
        ...(data.startDateTime !== undefined && { startDateTime: new Date(data.startDateTime) })
      }
    });

    return updated;
  });

  fastify.delete("/events/:id", async (request) => {
    const { id } = request.params as { id: string };
    await prisma.event.delete({ where: { id } });
    return { success: true, message: "Событие удалено" };
  });

  // 4. Истории и Модерация (Stories)
  fastify.get("/stories", async () => {
    const items = await prisma.story.findMany({
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        place: { select: { id: true, name: true } },
        event: { select: { id: true, title: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return { total: items.length, items };
  });

  fastify.delete("/stories/:id", async (request) => {
    const { id } = request.params as { id: string };
    await prisma.story.delete({ where: { id } });
    return { success: true, message: "История удалена (модерация)" };
  });

  // 5. Подборки (Collections)
  fastify.get("/collections", async () => {
    const items = await prisma.collection.findMany({
      include: {
        author: { select: { id: true, name: true, handle: true, avatarUrl: true } },
        _count: { select: { items: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      total: items.length,
      items: items.map((c) => ({
        ...c,
        placesCount: c._count.items
      }))
    };
  });

  fastify.delete("/collections/:id", async (request) => {
    const { id } = request.params as { id: string };
    await prisma.collection.delete({ where: { id } });
    return { success: true, message: "Подборка удалена" };
  });

  // 6. Пользователи и Роли (Users)
  fastify.get("/users", async (request) => {
    const { search, role } = request.query as { search?: string; role?: string };
    const where: any = {};
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { handle: { contains: search } },
        { email: { contains: search } }
      ];
    }
    if (role && role !== "all") {
      where.role = role;
    }

    const items = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        handle: true,
        email: true,
        phone: true,
        role: true,
        isVerifiedCreator: true,
        avatarUrl: true,
        bio: true,
        cityId: true,
        createdAt: true,
        _count: {
          select: {
            places: true,
            stories: true,
            collections: true,
            posts: true,
            followers: true
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { total: items.length, items };
  });

  fastify.patch("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const data = request.body as {
      role?: string;
      isVerifiedCreator?: boolean;
      name?: string;
      bio?: string;
    };

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(data.role !== undefined && { role: data.role }),
        ...(data.isVerifiedCreator !== undefined && { isVerifiedCreator: data.isVerifiedCreator }),
        ...(data.name !== undefined && { name: data.name }),
        ...(data.bio !== undefined && { bio: data.bio })
      },
      select: {
        id: true,
        name: true,
        handle: true,
        role: true,
        isVerifiedCreator: true
      }
    });

    return updated;
  });

  fastify.delete("/users/:id", async (request, reply) => {
    const { id } = request.params as { id: string };
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return reply.status(404).send({ error: "Пользователь не найден" });

    await prisma.user.delete({ where: { id } });
    return { success: true, message: "Пользователь удален" };
  });

  // 7. Заявки на верификацию бизнеса
  fastify.get("/business-verifications", async () => {
    const items = await prisma.businessProfile.findMany({
      include: {
        user: {
          select: {
            id: true,
            name: true,
            handle: true,
            email: true,
            places: { select: { id: true, name: true, address: true, isVerifiedBusiness: true } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return { total: items.length, items };
  });

  fastify.post("/business-verifications/:id/approve", async (request) => {
    const { id } = request.params as { id: string };
    const profile = await prisma.businessProfile.update({
      where: { id },
      data: { status: "VERIFIED" }
    });

    // Также верифицируем все привязанные заведения этого пользователя
    await prisma.place.updateMany({
      where: { businessOwnerId: profile.userId },
      data: { isVerifiedBusiness: true }
    });

    return { success: true, profile };
  });

  fastify.post("/business-verifications/:id/reject", async (request) => {
    const { id } = request.params as { id: string };
    const profile = await prisma.businessProfile.update({
      where: { id },
      data: { status: "REJECTED" }
    });

    return { success: true, profile };
  });
};
