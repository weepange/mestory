import Fastify from "fastify";
import cors from "@fastify/cors";
import jwt from "@fastify/jwt";
import swagger from "@fastify/swagger";
import swaggerUi from "@fastify/swagger-ui";
import multipart from "@fastify/multipart";
import dotenv from "dotenv";

import { authRoutes } from "./modules/auth/auth.routes";
import { placesRoutes } from "./modules/places/places.routes";
import { eventsRoutes } from "./modules/events/events.routes";
import { storiesRoutes } from "./modules/stories/stories.routes";
import { feedRoutes } from "./modules/feed/feed.routes";
import { collectionsRoutes } from "./modules/collections/collections.routes";
import { postsRoutes } from "./modules/posts/posts.routes";
import { usersRoutes } from "./modules/users/users.routes";
import { businessRoutes } from "./modules/business/business.routes";
import { adminRoutes } from "./modules/admin/admin.routes";

dotenv.config();

const server = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "info" : "warn"
  }
});

async function main() {
  // CORS
  await server.register(cors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  });

  // Multipart for photo uploads
  await server.register(multipart, {
    limits: {
      fileSize: 15 * 1024 * 1024 // 15 MB
    }
  });

  // JWT
  await server.register(jwt, {
    secret: process.env.JWT_SECRET || "mestory-secret-jwt-key-rostov-on-don-2026"
  });

  // OpenAPI Swagger documentation
  await server.register(swagger, {
    swagger: {
      info: {
        title: "Mestory API",
        description: "Высокопроизводительный REST API для городской платформы Mestory (Web + Mobile)",
        version: "1.0.0"
      },
      host: `localhost:${process.env.PORT || 4000}`,
      schemes: ["http", "https"],
      consumes: ["application/json"],
      produces: ["application/json"]
    }
  });

  await server.register(swaggerUi, {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false
    }
  });

  // Глобальный безопасный обработчик ошибок
  server.setErrorHandler((error, request, reply) => {
    server.log.error(error);
    const statusCode = error.statusCode || 500;
    const message =
      statusCode === 500 && process.env.NODE_ENV === "production"
        ? "Внутренняя ошибка сервера"
        : error.message;

    reply.status(statusCode).send({
      error: message,
      statusCode
    });
  });

  // Healthcheck
  server.get("/health", async () => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      service: "mestory-api",
      version: "1.0.0"
    };
  });

  // Регистрация модулей API
  await server.register(authRoutes, { prefix: "/api/auth" });
  await server.register(placesRoutes, { prefix: "/api/places" });
  await server.register(eventsRoutes, { prefix: "/api/events" });
  await server.register(storiesRoutes, { prefix: "/api/stories" });
  await server.register(feedRoutes, { prefix: "/api/feed" });
  await server.register(collectionsRoutes, { prefix: "/api/collections" });
  await server.register(postsRoutes, { prefix: "/api/posts" });
  await server.register(usersRoutes, { prefix: "/api/users" });
  await server.register(businessRoutes, { prefix: "/api/business" });
  await server.register(adminRoutes, { prefix: "/api/admin" });

  const port = parseInt(process.env.PORT || "4000", 10);
  const host = process.env.HOST || "0.0.0.0";

  await server.listen({ port, host });
  console.log(`🚀 Mestory Fastify API running at http://${host}:${port}`);
  console.log(`📚 OpenAPI Documentation available at http://${host}:${port}/docs`);
}

main().catch((err) => {
  server.log.error(err);
  process.exit(1);
});
