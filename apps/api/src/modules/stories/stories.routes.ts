import { FastifyPluginAsync } from "fastify";
import { CreateStorySchema, PlaceCategoryId } from "@mestory/shared";
import { prisma } from "../../lib/prisma";

export const storiesRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить активные истории города (срок действия 48ч для демо/активности)
  fastify.get("/", async (request) => {
    const query = request.query as { cityId?: string };
    const cityId = query.cityId || "rostov-on-don";

    const stories = await prisma.story.findMany({
      where: {
        cityId,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        place: {
          select: { id: true, name: true, category: true, address: true, coverPhoto: true }
        },
        event: {
          select: { id: true, title: true, priceText: true }
        }
      }
    });

    // Группировка историй по авторам/заведениям для отображения в Story Bar
    const groupedMap = new Map<
      string,
      {
        author: any;
        hasUnseen: boolean;
        stories: any[];
      }
    >();

    for (const s of stories) {
      const key = s.authorId;
      if (!groupedMap.has(key)) {
        groupedMap.set(key, {
          author: s.author,
          hasUnseen: true,
          stories: []
        });
      }
      groupedMap.get(key)!.stories.push({
        id: s.id,
        title: s.title,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        placeId: s.placeId || undefined,
        placeName: s.place?.name,
        placeCategory: s.place?.category as PlaceCategoryId | undefined,
        eventId: s.eventId || undefined,
        eventTitle: s.event?.title,
        author: s.author,
        cityId: s.cityId,
        expiresAt: s.expiresAt.toISOString(),
        viewsCount: s.viewsCount,
        createdAt: s.createdAt.toISOString()
      });
    }

    return {
      groups: Array.from(groupedMap.values()),
      allStories: stories.map((s) => ({
        id: s.id,
        title: s.title,
        mediaUrl: s.mediaUrl,
        mediaType: s.mediaType,
        placeId: s.placeId || undefined,
        placeName: s.place?.name,
        placeCategory: s.place?.category as PlaceCategoryId | undefined,
        eventId: s.eventId || undefined,
        eventTitle: s.event?.title,
        author: s.author,
        cityId: s.cityId,
        expiresAt: s.expiresAt.toISOString(),
        viewsCount: s.viewsCount,
        createdAt: s.createdAt.toISOString()
      }))
    };
  });

  // Создать историю
  fastify.post("/", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = CreateStorySchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const data = parseResult.data;
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    const story = await prisma.story.create({
      data: {
        title: data.title,
        mediaUrl: data.mediaUrl,
        mediaType: data.mediaType,
        placeId: data.placeId || null,
        eventId: data.eventId || null,
        cityId: data.cityId,
        authorId: payload.id,
        expiresAt
      },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        place: true
      }
    });

    return reply.status(201).send(story);
  });

  // Увеличить счетчик просмотров
  fastify.post("/:id/view", async (request) => {
    const { id } = request.params as { id: string };
    await prisma.story.update({
      where: { id },
      data: { viewsCount: { increment: 1 } }
    });
    return { ok: true };
  });
};
