import { prisma } from '../../lib/prisma';

type Actor = { userId: string; role: string };

export async function listWearableConnections(actor: Actor) {
  return prisma.wearableConnection.findMany({ where: { userId: actor.userId }, orderBy: { updatedAt: 'desc' } });
}

export async function upsertWearableConnection(actor: Actor, input: { provider: string; status?: string; externalAccountId?: string; scopesJson?: any; metadataJson?: any }) {
  return prisma.wearableConnection.upsert({
    where: { userId_provider: { userId: actor.userId, provider: input.provider } },
    update: {
      status: input.status ?? 'CONNECTED',
      externalAccountId: input.externalAccountId,
      scopesJson: input.scopesJson ?? {},
      metadataJson: input.metadataJson ?? {},
      lastSyncedAt: input.status === 'CONNECTED' ? new Date() : undefined,
      errorMessage: null,
    },
    create: {
      userId: actor.userId,
      provider: input.provider,
      status: input.status ?? 'CONNECTED',
      externalAccountId: input.externalAccountId,
      scopesJson: input.scopesJson ?? {},
      metadataJson: input.metadataJson ?? {},
      lastSyncedAt: input.status === 'CONNECTED' ? new Date() : undefined,
    },
  });
}

export async function disconnectWearable(actor: Actor, provider: string) {
  return prisma.wearableConnection.update({
    where: { userId_provider: { userId: actor.userId, provider } },
    data: { status: 'DISCONNECTED' },
  });
}

export async function markWearableSyncError(actor: Actor, provider: string, errorMessage: string) {
  return prisma.wearableConnection.upsert({
    where: { userId_provider: { userId: actor.userId, provider } },
    update: { status: 'ERROR', errorMessage },
    create: { userId: actor.userId, provider, status: 'ERROR', errorMessage },
  });
}
