import { DataSource } from 'typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { GraphicsRequest } from '../entities/graphics-request.entity';

function getDatabaseUrl(): string {
  const url = process.env.DATABASE_URL ?? 'postgresql://projectDB:postgres@localhost:5432/projektDB';
  if (url.includes('railway.internal') && !url.includes('sslmode=')) {
    const sep = url.includes('?') ? '&' : '?';
    return `${url}${sep}sslmode=disable`;
  }
  return url;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  url: getDatabaseUrl(),
  entities: [Product, User, Order, OrderItem, ContactRequest, GraphicsRequest],
  synchronize: false,
  logging: false,
});
