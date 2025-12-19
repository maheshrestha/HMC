import { Injectable, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit {
  async onModuleInit(): Promise<void> {
    await this.$connect();

    // Apply soft delete middleware
    this.$use(async (params, next) => {
      // Soft delete logic for delete/deleteMany
      if (params.action === 'delete') {
        params.action = 'update';
        params.args = params.args || {};
        params.args.data = { deletedAt: new Date() };
      }

      if (params.action === 'deleteMany') {
        params.action = 'updateMany';
        params.args = params.args || {};
        params.args.data = { deletedAt: new Date() };
      }

      // Filter out soft deleted records for find operations
      if (['findUnique', 'findFirst', 'findMany'].includes(params.action)) {
        params.args = params.args || {};
        params.args.where = { ...params.args.where, deletedAt: null };
      }

      // Handle nested includes to filter soft deleted relations
      if (params.args?.include) {
        this.addSoftDeleteFilters(params.args.include);
      }

      return next(params);
    });
  }

  private addSoftDeleteFilters(include: Record<string, unknown>): void {
    if (typeof include === 'object') {
      for (const key in include) {
        const value = include[key];
        if (value === true) {
          include[key] = { where: { deletedAt: null } };
        } else if (typeof value === 'object' && value !== null) {
          const objValue = value as Record<string, unknown>;
          if (!objValue.where) {
            objValue.where = {};
          }
          (objValue.where as Record<string, unknown>).deletedAt = null;
          if (objValue.include) {
            this.addSoftDeleteFilters(objValue.include as Record<string, unknown>);
          }
        }
      }
    }
  }
}
