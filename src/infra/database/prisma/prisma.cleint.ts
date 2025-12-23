import { PrismaClient } from '@prisma/client';
import { prismaErrorExtension } from './extensions/prisma-error.extension';

export const prismaClient = new PrismaClient().$extends(prismaErrorExtension);
export type ExtendedPrismaClient = typeof prismaClient;
