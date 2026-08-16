import { FastifyPluginAsync } from "fastify";
import { CreateCollectionSchema, ToggleBookmarkSchema } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";

export const collectionsRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить публичные подборки
  fastify.get("/", async (request) => {
    const query = request.query as { cityId?: string };
    const cityId = query.cityId || "rostov-on-don";

    const collections = await prisma.collection.findMany({
      where: { cityId, isPublic: true },
      orderBy: { savesCount: "desc" },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        items: {
          include: { place: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    return {
      items: collections.map((c) => ({
        id: c.id,
        title: c.title,
        slug: c.slug,
        description: c.description,
        coverPhoto: c.coverPhoto,
        author: c.author,
        cityId: c.cityId,
        isPublic: c.isPublic,
        placesCount: c.items.length,
        places: c.items.map((item) => ({
          id: item.place.id,
          name: item.place.name,
          category: item.place.category,
          address: item.place.address,
          coverPhoto: item.place.coverPhoto,
          rating: item.place.rating
        })),
        savesCount: c.savesCount,
        createdAt: c.createdAt.toISOString()
      }))
    };
  });

  // Получить подборку по ID или slug
  fastify.get("/:idOrSlug", async (request, reply) => {
    const { idOrSlug } = request.params as { idOrSlug: string };

    const col = await prisma.collection.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }]
      },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        items: {
          include: { place: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    if (!col) {
      return reply.status(404).send({ error: "Подборка не найдена" });
    }

    return {
      id: col.id,
      title: col.title,
      slug: col.slug,
      description: col.description,
      coverPhoto: col.coverPhoto,
      author: col.author,
      cityId: col.cityId,
      isPublic: col.isPublic,
      placesCount: col.items.length,
      places: col.items.map((item) => ({
        id: item.place.id,
        name: item.place.name,
        slug: item.place.slug,
        category: item.place.category,
        address: item.place.address,
        coverPhoto: item.place.coverPhoto,
        summary: item.place.summary,
        rating: item.place.rating,
        tags: parseJson<string[]>(item.place.tags, []),
        lat: item.place.lat,
        lng: item.place.lng
      })),
      savesCount: col.savesCount,
      createdAt: col.createdAt.toISOString()
    };
  });

  // Создать подборку
  fastify.post("/", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = CreateCollectionSchema.safeParse(request.body);
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

    const collection = await prisma.collection.create({
      data: {
        title: data.title,
        slug,
        description: data.description,
        coverPhoto: data.coverPhoto,
        cityId: data.cityId,
        isPublic: data.isPublic,
        authorId: payload.id,
        items: {
          create: data.placeIds.map((placeId, index) => ({
            placeId,
            sortOrder: index
          }))
        }
      },
      include: {
        items: { include: { place: true } }
      }
    });

    return reply.status(201).send({
      id: collection.id,
      title: collection.title,
      slug: collection.slug,
      description: collection.description,
      coverPhoto: collection.coverPhoto,
      cityId: collection.cityId,
      isPublic: collection.isPublic,
      placesCount: collection.items.length,
      places: collection.items.map((item) => ({
        id: item.place.id,
        name: item.place.name,
        slug: item.place.slug,
        category: item.place.category,
        address: item.place.address,
        coverPhoto: item.place.coverPhoto,
        rating: item.place.rating,
        tags: parseJson<string[]>(item.place.tags, [])
      })),
      savesCount: collection.savesCount,
      createdAt: collection.createdAt.toISOString()
    });
  });

  // Закладки / Сохранения (Bookmarks)
  fastify.post("/bookmark", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = ToggleBookmarkSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({ error: "Некорректные данные" });
    }

    const { targetType, targetId, folderName } = parseResult.data;

    const existing = await prisma.bookmark.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: payload.id,
          targetType,
          targetId
        }
      }
    });

    if (existing) {
      await prisma.bookmark.delete({ where: { id: existing.id } });
      if (targetType === "PLACE") {
        await prisma.place.update({ where: { id: targetId }, data: { savesCount: { decrement: 1 } } });
      }
      return { saved: false };
    } else {
      await prisma.bookmark.create({
        data: {
          userId: payload.id,
          targetType,
          targetId,
          folderName
        }
      });
      if (targetType === "PLACE") {
        await prisma.place.update({ where: { id: targetId }, data: { savesCount: { increment: 1 } } });
      }
      return { saved: true };
    }
  });

  // Получить закладки пользователя
  fastify.get("/bookmarks/my", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const bookmarks = await prisma.bookmark.findMany({
      where: { userId: payload.id },
      orderBy: { createdAt: "desc" }
    });

    const placeIds = bookmarks.filter((b) => b.targetType === "PLACE").map((b) => b.targetId);
    const places = await prisma.place.findMany({
      where: { id: { in: placeIds } }
    });

    return {
      places: places.map((p) => ({
        id: p.id,
        name: p.name,
        slug: p.slug,
        category: p.category,
        address: p.address,
        coverPhoto: p.coverPhoto,
        rating: p.rating,
        summary: p.summary
      }))
    };
  });
};
