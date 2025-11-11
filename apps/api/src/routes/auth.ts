import { FastifyInstance, FastifyRequest, FastifyReply } from 'fastify';
import { z } from 'zod';
import jwt, { SignOptions } from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { hashPassword, verifyPassword, registerSchema, loginSchema } from '../lib/auth.js';
import { getJWTConfig } from '../lib/jwt.js';

const refreshSchema = z.object({
  refreshToken: z.string().min(1),
});

export async function authRoutes(fastify: FastifyInstance) {
  // Register
  fastify.post('/register', async (request: FastifyRequest, reply: FastifyReply) => {
    try {
      const body = registerSchema.parse(request.body);

      const existingUser = await prisma.user.findUnique({
        where: { email: body.email },
      });

      if (existingUser) {
        return reply.code(400).send({ error: 'User already exists' });
      }

      const hashedPassword = await hashPassword(body.password);
      const user = await prisma.user.create({
        data: {
          email: body.email,
          password: hashedPassword,
          name: body.name,
          role: 'CLIENT',
        },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
        },
      });

      const config = getJWTConfig();
      
      if (!config.secret || !config.refreshSecret) {
        fastify.log.error('JWT secrets are not configured');
        return reply.code(500).send({ error: 'Server configuration error' });
      }

      const accessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: config.accessExpiresIn },
      );
      const refreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.refreshSecret,
        { expiresIn: config.refreshExpiresIn } as SignOptions,
      );

      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7);

      await prisma.refreshToken.create({
        data: {
          token: refreshToken,
          userId: user.id,
          expiresAt,
        },
      });

      return reply.code(201).send({
        user,
        accessToken,
        refreshToken,
      });
    } catch (error: any) {
      fastify.log.error({ err: error, body: request.body }, 'Registration error');
      
      if (error instanceof z.ZodError) {
        return reply.code(400).send({
          error: 'ValidationError',
          message: 'Invalid request data',
          details: error.errors,
        });
      }

      // Re-throw to be handled by global error handler
      throw error;
    }
  });

  // Login
  fastify.post('/login', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = loginSchema.parse(request.body);

    const user = await prisma.user.findUnique({
      where: { email: body.email },
    });

    if (!user) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const isValid = await verifyPassword(body.password, user.password);
    if (!isValid) {
      return reply.code(401).send({ error: 'Invalid credentials' });
    }

    const config = getJWTConfig();
    const accessToken = fastify.jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      { expiresIn: config.accessExpiresIn },
    );
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      config.refreshSecret,
      { expiresIn: config.refreshExpiresIn } as SignOptions,
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    await prisma.refreshToken.create({
      data: {
        token: refreshToken,
        userId: user.id,
        expiresAt,
      },
    });

      return reply.send({
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
        },
        accessToken,
        refreshToken,
      });
  });

  // Refresh
  fastify.post('/refresh', async (request: FastifyRequest, reply: FastifyReply) => {
    const body = refreshSchema.parse(request.body);
    const config = getJWTConfig();

    try {
      const decoded = jwt.verify(body.refreshToken, config.refreshSecret, {}) as {
        userId: string;
        email: string;
        role: string;
      };

      const tokenRecord = await prisma.refreshToken.findUnique({
        where: { token: body.refreshToken },
      });

      if (!tokenRecord || tokenRecord.expiresAt < new Date()) {
        return reply.code(401).send({ error: 'Invalid or expired refresh token' });
      }

      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
      });

      if (!user) {
        return reply.code(401).send({ error: 'User not found' });
      }

      const newAccessToken = fastify.jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        { expiresIn: config.accessExpiresIn },
      );
      const newRefreshToken = jwt.sign(
        { userId: user.id, email: user.email, role: user.role },
        config.refreshSecret,
        { expiresIn: config.refreshExpiresIn } as SignOptions,
      );

      const newExpiresAt = new Date();
      newExpiresAt.setDate(newExpiresAt.getDate() + 7);

      await prisma.refreshToken.update({
        where: { id: tokenRecord.id },
        data: {
          token: newRefreshToken,
          expiresAt: newExpiresAt,
        },
      });

      return reply.send({ accessToken: newAccessToken, refreshToken: newRefreshToken });
    } catch (err) {
      return reply.code(401).send({ error: 'Invalid refresh token' });
    }
  });

  // Logout
  fastify.post(
    '/logout',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const body = z
        .object({
          refreshToken: z.string().optional(),
        })
        .parse(request.body);

      if (body.refreshToken) {
        await prisma.refreshToken.deleteMany({
          where: { token: body.refreshToken },
        });
      }

      return reply.send({ message: 'Logged out successfully' });
    },
  );

  // Me
  fastify.get(
    '/me',
    { preHandler: [fastify.authenticate] },
    async (request: FastifyRequest, reply: FastifyReply) => {
      const userPayload = request.user as { userId: string; email: string; role: string };
      const user = await prisma.user.findUnique({
        where: { id: userPayload.userId },
        select: {
          id: true,
          email: true,
          name: true,
          role: true,
          createdAt: true,
          updatedAt: true,
        },
      });

      if (!user) {
        return reply.code(404).send({ error: 'User not found' });
      }

      return reply.send({ user });
    },
  );
}

