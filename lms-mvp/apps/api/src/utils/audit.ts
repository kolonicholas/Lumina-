import { prisma } from "./db.js";

export async function logAudit(actorId: string, action: string, entityType: string, entityId: string, metadata: Record<string, unknown>) {
  await prisma.auditLog.create({
    data: {
      actorId,
      action,
      entityType,
      entityId,
      metadata,
    },
  });
}
