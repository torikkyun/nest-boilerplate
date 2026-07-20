import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import {
  Injectable,
  OnModuleInit,
  OnModuleDestroy,
  Logger,
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { softDeleteExtension } from "./soft-delete.extension";
import { PrismaClient } from "@/generated/prisma/client";

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(PrismaService.name, { timestamp: true });

  constructor(private readonly configService: ConfigService) {
    const adapter = new PrismaMariaDb({
      host: configService.get<string>("database.host"),
      port: configService.get<number>("database.port"),
      user: configService.get<string>("database.user"),
      password: configService.get<string>("database.password"),
      database: configService.get<string>("database.name"),
      allowPublicKeyRetrieval: true,
    });

    super({
      adapter,
      log: ["error", "warn"],
      omit: {
        staff: {
          passwordHash: true,
        },
      },
    });
  }

  async onModuleInit() {
    try {
      this.logger.log("Connecting to database...");
      await this.$connect();
      await this.$queryRaw`SELECT 1`;
      this.logger.log("Successfully connected to database");
    } catch (error) {
      this.logger.error("Failed to connect to database", error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
    this.logger.log("Disconnected from database");
  }

  withSoftDelete() {
    return this.$extends(softDeleteExtension);
  }
}
