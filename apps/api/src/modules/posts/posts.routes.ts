import { FastifyPluginAsync } from "fastify";
import { CreatePostSchema } from "@mestory/shared";
import { prisma, parseJson } from "../../lib/prisma";

export const postsRoutes: FastifyPluginAsync = async (fastify) => {
  // Получить последние обзоры и посты
  fastify.get("/", async (request) => {
    const query = request.query as { placeId?: string; authorId?: string };

    const where: Record<string, unknown> = {};
    if (query.placeId) where.placeId = query.placeId;
    if (query.authorId) where.authorId = query.authorId;

    const posts = await prisma.post.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 20,
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        place: {
          select: { id: true, name: true, category: true, address: true, coverPhoto: true }
        }
      }
    });

    return {
      items: posts.map((p) => ({
        id: p.id,
        author: p.author,
        place: p.place,
        rating: p.rating,
        content: p.content,
        photos: parseJson<string[]>(p.photos, []),
        tags: parseJson<string[]>(p.tags, []),
        likesCount: p.likesCount,
        savesCount: p.savesCount,
        createdAt: p.createdAt.toISOString()
      }))
    };
  });

  // Создать отзыв/пост
  fastify.post("/", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const payload = request.user as { id: string };
    const parseResult = CreatePostSchema.safeParse(request.body);
    if (!parseResult.success) {
      return reply.status(400).send({
        error: "Validation failed",
        details: parseResult.error.flatten()
      });
    }

    const data = parseResult.data;

    const post = await prisma.post.create({
      data: {
        authorId: payload.id,
        placeId: data.placeId || null,
        rating: data.rating || null,
        content: data.content,
        photos: JSON.stringify(data.photos),
        tags: JSON.stringify(data.tags)
      },
      include: {
        author: {
          select: { id: true, name: true, handle: true, avatarUrl: true, isVerifiedCreator: true, role: true, cityId: true }
        },
        place: true
      }
    });

    if (data.placeId) {
      await prisma.place.update({
        where: { id: data.placeId },
        data: { reviewsCount: { increment: 1 } }
      });
    }

    return reply.status(201).send({
      id: post.id,
      author: post.author,
      place: post.place,
      rating: post.rating,
      content: post.content,
      photos: parseJson<string[]>(post.photos, []),
      tags: parseJson<string[]>(post.tags, []),
      likesCount: post.likesCount,
      savesCount: post.savesCount,
      createdAt: post.createdAt.toISOString()
    });
  });

  // Лайк поста
  fastify.post("/:id/like", async (request, reply) => {
    try {
      await request.jwtVerify();
    } catch {
      return reply.status(401).send({ error: "Требуется авторизация" });
    }

    const { id } = request.params as { id: string };
    const payload = request.user as { id: string };

    const existing = await prisma.like.findUnique({
      where: {
        userId_targetType_targetId: {
          userId: payload.id,
          targetType: "POST",
          targetId: id
        }
      }
    });

    if (existing) {
      await prisma.like.delete({ where: { id: existing.id } });
      await prisma.post.update({ where: { id }, data: { likesCount: { decrement: 1 } } });
      return { liked: false };
    } else {
      await prisma.like.create({
        data: {
          userId: payload.id,
          targetType: "POST",
          targetId: id
        }
      });
      await prisma.post.update({ where: { id }, data: { likesCount: { increment: 1 } } });
      return { liked: true };
    }
  });
};
