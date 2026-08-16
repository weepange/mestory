import { FastifyPluginAsync } from "fastify";
import { CreateEventSchema, PlaceCategoryId } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";

export const eventsRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить список событий
  fastify.get("/", async (request) => {
    const query = request.query as {
      cityId?: string;
      category?: string;
      tags?: string;
      search?: string;
      upcomingOnly?: string;
    };

    const cityId = query.cityId || "rostov-on-don";
    const where: Record<string, unknown> = {
      cityId
    };

    if (query.category && query.category !== "all") {
      where.category = query.category;
    }

    if (query.upcomingOnly !== "false") {
      where.startDateTime = {
        gte: new Date(Date.now() - 6 * 60 * 60 * 1000)
      };
    }

    if (query.search) {
      where.OR = [
        { title: { contains: query.search } },
        { description: { contains: query.search } },
        { tags: { contains: query.search } }
      ];
    }

    const events = await prisma.event.findMany({
      where,
      orderBy: { startDateTime: "asc" },
      include: {
        organizer: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, isVerifiedCreator: true, cityId: true }
        },
        place: {
          select: { id: true, name: true, address: true, coverPhoto: true }
        }
      }
    });

    const items = events.map((event) => ({
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
      endDateTime: event.endDateTime ? event.endDateTime.toISOString() : undefined,
      isFree: event.isFree,
      priceText: event.priceText,
      ticketUrl: event.ticketUrl || undefined,
      coverPhoto: event.coverPhoto,
      tags: parseJson<string[]>(event.tags, []),
      savesCount: event.savesCount,
      organizer: event.organizer,
      createdAt: event.createdAt.toISOString()
    }));

    return {
      items,
      total: items.length,
      cityId
    };
  });

  // Получить событие по ID или slug
  fastify.get("/:idOrSlug", async (request, reply) => {
    const { idOrSlug } = request.params as { idOrSlug: string };

    const event = await prisma.event.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        organizer: {
          select: { id: true, name: true, handle: true, avatarUrl: true, role: true, isVerifiedCreator: true, cityId: true }
        },
        place: true
      }
    });

    if (!event) {
      return reply.status(404).send({ error: "Событие не найдено" });
    }

    return {
      id: event.id,
      title: event.title,
      slug: event.slug,
      description: event.description,
      category: event.category as PlaceCategoryId,
      cityId: event.cityId,
      placeId: event.placeId,
      placeName: event.placeName || event.place?.name,
      placeAddress: event.placeAddress || event.place?.address,
      lat: event.lat,
      lng: event.lng,
      startDateTime: event.startDateTime.toISOString(),
      endDateTime: event.endDateTime ? event.endDateTime.toISOString() : undefined,
      isFree: event.isFree,
      priceText: event.priceText,
      ticketUrl: event.ticketUrl,
      coverPhoto: event.coverPhoto,
      tags: parseJson<string[]>(event.tags, []),
      savesCount: event.savesCount,
      organizer: event.organizer,
      place: event.place
        ? {
            id: event.place.id,
            name: event.place.name,
            address: event.place.address,
            coverPhoto: event.place.coverPhoto,
            category: event.place.category,
            rating: event.place.rating
          }
        : undefined,
      createdAt: event.createdAt.toISOString()
    };
  });

  // Создать событие
  fastify.post("/", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = CreateEventSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const data = parseResult.data;
    const slug = data.title
      .toLowerCase()
      .replace(/[^a-zа-я0-9]+/g, "-")
      .replace(/^-|-$/g, "") + "-" + Math.random().toString(36).substring(2, 6);

    const event = await prisma.event.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        category: data.category,
        cityId: data.cityId,
        placeId: data.placeId || null,
        lat: data.lat,
        lng: data.lng,
        startDateTime: new Date(data.startDateTime),
        endDateTime: data.endDateTime ? new Date(data.endDateTime) : null,
        isFree: data.isFree,
        priceText: data.priceText,
        ticketUrl: data.ticketUrl || null,
        coverPhoto: data.coverPhoto,
        tags: JSON.stringify(data.tags),
        organizerId: payload.id
      }
    });

    return reply.status(201).send(event);
  });
};
