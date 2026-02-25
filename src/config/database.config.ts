import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { GraphicsRequest } from '../entities/graphics-request.entity';

export const databaseConfig: TypeOrmModuleOptions = {
  type: 'postgres',
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  username: process.env.DB_USERNAME || 'projectDB',
  password: process.env.DB_PASSWORD || 'postgres',
  database: process.env.DB_NAME || 'projektDB',
    entities: [Product, User, Order, OrderItem, ContactRequest, GraphicsRequest],
  synchronize: process.env.NODE_ENV !== 'production', // Auto-create tables (disable in production)
  logging: process.env.NODE_ENV === 'development',
};
