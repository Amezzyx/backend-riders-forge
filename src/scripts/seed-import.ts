/**
 * Import seed-data/*.json into the database.
 * Set DATABASE_URL to the target DB, then: npm run seed:import
 * Optionally: SEED_CLEAR=1 to truncate tables before import (default: 1).
 */
import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import { AppDataSource } from './data-source';
import { User } from '../entities/user.entity';
import { Product } from '../entities/product.entity';
import { ContactRequest } from '../entities/contact-request.entity';
import { GraphicsRequest } from '../entities/graphics-request.entity';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';

const SEED_DIR = join(__dirname, '..', '..', 'seed-data');

function loadEnv(): void {
  try {
    const path = join(__dirname, '..', '..', '.env');
    if (existsSync(path)) {
      const content = readFileSync(path, 'utf-8');
      content.split('\n').forEach(line => {
        const m = line.match(/^\s*([^#=]+)=(.*)$/);
        if (m) process.env[m[1].trim()] = m[2].trim().replace(/^["']|["']$/g, '');
      });
    }
  } catch {
    // ignore
  }
}

function readJson<T>(filename: string): T {
  const path = join(SEED_DIR, filename);
  if (!existsSync(path)) return [] as T;
  return JSON.parse(readFileSync(path, 'utf-8')) as T;
}

function normalizeProduct(row: Record<string, unknown>): Record<string, unknown> {
  const r = { ...row };
  if (Array.isArray(r.sizes)) r.sizes = (r.sizes as string[]).join(',');
  return r;
}

async function run(): Promise<void> {
  loadEnv();
  await AppDataSource.initialize();

  const clearFirst = process.env.SEED_CLEAR !== '0';

  if (clearFirst) {
    await AppDataSource.query('TRUNCATE TABLE order_items, orders, contact_requests, graphics_requests, products, users RESTART IDENTITY CASCADE');
    console.log('Tables truncated.');
  }

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);
  const contactRepo = AppDataSource.getRepository(ContactRequest);
  const graphicsRepo = AppDataSource.getRepository(GraphicsRequest);
  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);

  const users = readJson<Record<string, unknown>[]>('users.json');
  const productsRaw = readJson<Record<string, unknown>[]>('products.json');
  const products = productsRaw.map(normalizeProduct);
  const contactRequests = readJson<Record<string, unknown>[]>('contact_requests.json');
  const graphicsRequests = readJson<Record<string, unknown>[]>('graphics_requests.json');
  const orders = readJson<Record<string, unknown>[]>('orders.json');
  const orderItems = readJson<Record<string, unknown>[]>('order_items.json');

  if (users.length) {
    await userRepo.createQueryBuilder().insert().values(users).execute();
    console.log('Inserted users:', users.length);
  }
  if (products.length) {
    await productRepo.createQueryBuilder().insert().values(products).execute();
    console.log('Inserted products:', products.length);
  }
  if (contactRequests.length) {
    await contactRepo.createQueryBuilder().insert().values(contactRequests).execute();
    console.log('Inserted contact_requests:', contactRequests.length);
  }
  if (graphicsRequests.length) {
    await graphicsRepo.createQueryBuilder().insert().values(graphicsRequests).execute();
    console.log('Inserted graphics_requests:', graphicsRequests.length);
  }
  if (orders.length) {
    await orderRepo.createQueryBuilder().insert().values(orders).execute();
    console.log('Inserted orders:', orders.length);
  }
  if (orderItems.length) {
    await orderItemRepo.createQueryBuilder().insert().values(orderItems).execute();
    console.log('Inserted order_items:', orderItems.length);
  }

  // Reset sequences so next auto-generated ids are correct (Postgres serial)
  const serialTables = ['products', 'contact_requests', 'graphics_requests', 'orders', 'order_items'];
  for (const table of serialTables) {
    await AppDataSource.query(
      `SELECT setval(pg_get_serial_sequence('${table}', 'id'), COALESCE((SELECT MAX(id) FROM "${table}"), 1))`,
    );
  }

  console.log('Import done.');
  await AppDataSource.destroy();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
