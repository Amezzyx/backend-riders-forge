/**
 * Export database contents to JSON files in seed-data/.
 * Run from backend folder: npm run seed:export
 * Uses DATABASE_URL from .env (or environment).
 */
import { readFileSync, mkdirSync, writeFileSync, existsSync } from 'fs';
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

function toPlain(row: unknown): unknown {
  if (row === null || row === undefined) return row;
  if (typeof row !== 'object') return row;
  if (Array.isArray(row)) return row.map(toPlain);
  if (row instanceof Date) return row.toISOString();
  const obj = row as Record<string, unknown>;
  const out: Record<string, unknown> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (k === 'order' || k === 'items') continue; // skip relations
    if (v === undefined) continue;
    out[k] = toPlain(v);
  }
  return out;
}

async function run(): Promise<void> {
  loadEnv();
  await AppDataSource.initialize();

  if (!existsSync(SEED_DIR)) mkdirSync(SEED_DIR, { recursive: true });

  const userRepo = AppDataSource.getRepository(User);
  const productRepo = AppDataSource.getRepository(Product);
  const contactRepo = AppDataSource.getRepository(ContactRequest);
  const graphicsRepo = AppDataSource.getRepository(GraphicsRequest);
  const orderRepo = AppDataSource.getRepository(Order);
  const orderItemRepo = AppDataSource.getRepository(OrderItem);

  const users = await userRepo.find({ order: { createdAt: 'ASC' } });
  const products = await productRepo.find({ order: { id: 'ASC' } });
  const contactRequests = await contactRepo.find({ order: { id: 'ASC' } });
  const graphicsRequests = await graphicsRepo.find({ order: { id: 'ASC' } });
  const orders = await orderRepo.find({ order: { id: 'ASC' }, relations: [] });
  const orderItemsRaw = await orderItemRepo.find({ order: { id: 'ASC' }, relations: ['order'] });
  const orderItems = orderItemsRaw.map((item: OrderItem) => {
    const p = toPlain(item) as Record<string, unknown>;
    delete p.order;
    const orderId = (item as OrderItem & { orderId?: number }).orderId ?? (item.order as { id: number } | undefined)?.id;
    if (orderId != null) p.orderId = orderId;
    return p;
  });

  writeFileSync(join(SEED_DIR, 'users.json'), JSON.stringify(toPlain(users) as object[], null, 2));
  writeFileSync(join(SEED_DIR, 'products.json'), JSON.stringify(toPlain(products) as object[], null, 2));
  writeFileSync(join(SEED_DIR, 'contact_requests.json'), JSON.stringify(toPlain(contactRequests) as object[], null, 2));
  writeFileSync(join(SEED_DIR, 'graphics_requests.json'), JSON.stringify(toPlain(graphicsRequests) as object[], null, 2));
  writeFileSync(join(SEED_DIR, 'orders.json'), JSON.stringify(toPlain(orders) as object[], null, 2));
  writeFileSync(join(SEED_DIR, 'order_items.json'), JSON.stringify(orderItems, null, 2));

  console.log('Export done:', SEED_DIR);
  console.log('  users:', users.length);
  console.log('  products:', products.length);
  console.log('  contact_requests:', contactRequests.length);
  console.log('  graphics_requests:', graphicsRequests.length);
  console.log('  orders:', orders.length);
  console.log('  order_items:', orderItems.length);

  await AppDataSource.destroy();
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
