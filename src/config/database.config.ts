import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { GraphicsRequest } from '../entities/graphics-request.entity';

/**
 * Build database URL for TypeORM.
 * - Use DATABASE_URL in production (e.g. Railway). Set it in your host's environment.
 * - Railway internal URL (postgres.railway.internal): only works when the app runs on Railway.
 *   We append ?sslmode=disable for internal connections to avoid SSL handshake issues.
 * - For local dev without DATABASE_URL, falls back to local Postgres.
 */
function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? 'postgresql://projectDB:postgres@localhost:5432/projektDB';
  // Railway internal Postgres: no SSL needed; explicit disable avoids "SSL EOF" errors
  if (url.includes('railway.internal') && !url.includes('sslmode=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}sslmode=disable`;
  }
  return url;
}

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  url: getDatabaseUrl(),
  entities: [Product, User, Order, OrderItem, ContactRequest, GraphicsRequest],
  synchronize: true,
  logging: process.env.NODE_ENV === 'development',
};
