import { FastifyRequest, FastifyReply } from 'fastify';
import { UserRole } from '@prisma/client';


export async function authenticate(
  request: FastifyRequest,
  reply: FastifyReply,
): Promise<void> {
  try {
    await request.jwtVerify();
  } catch (err) {
    reply.code(401).send({ error: 'Unauthorized' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return async (request: FastifyRequest, reply: FastifyReply): Promise<void> => {
    const user = request.user as { userId: string; email: string; role: UserRole } | undefined;

    if (!user) {
      reply.code(401).send({ error: 'Unauthorized' });
      return;
    }

    if (!allowedRoles.includes(user.role)) {
      reply.code(403).send({ error: 'Forbidden' });
      return;
    }
  };
}

