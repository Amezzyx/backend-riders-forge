import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Order } from '../entities/order.entity';
import { OrderItem } from '../entities/order-item.entity';
import { Product } from '../entities/product.entity';

@Injectable() 
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async createOrder(orderData: any): Promise<Order> {
    const { items, ...orderInfo } = orderData;

    // Validate stock before creating order
    if (items && Array.isArray(items)) {
      for (const item of items) {
        const productId = item.id || item.productId;
        const quantityToCheck = item.quantity || 1;
        const size = item.size ?? null;
        if (!productId) continue;
        const product = await this.productRepository.findOne({ where: { id: productId } });
        if (!product) {
          throw new Error(`Product not found: ${productId}`);
        }
        let available = 0;
        if (size != null && product.sizeQuantities && typeof product.sizeQuantities === 'object') {
          available = Number(product.sizeQuantities[size]) || 0;
        } else {
          available = Number(product.quantity) || 0;
        }
        if (quantityToCheck > available) {
          throw new Error(
            `Not enough stock for "${product.name}"${size ? ` (size ${size})` : ''}. Available: ${available}, requested: ${quantityToCheck}.`,
          );
        }
      }
    }

    // Generate unique order number
    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

    const order = this.orderRepository.create({
      ...orderInfo,
      orderNumber,
    });

    const savedOrderResult = await this.orderRepository.save(order);

    // TypeORM save() can return T | T[], but we know it's a single entity here
    if (Array.isArray(savedOrderResult)) {
      throw new Error('Unexpected array returned from save');
    }

    const savedOrder: Order = savedOrderResult;

    // Create order items and decrease product quantities
    if (items && Array.isArray(items)) {
      const orderItems = items.map(item => 
        this.orderItemRepository.create({
          order: savedOrder,
          productId: item.id || item.productId,
          productName: item.name || item.productName,
          price: item.price,
          quantity: item.quantity || 1,
          size: item.size || null,
          image: item.image || null,
        })
      );
      await this.orderItemRepository.save(orderItems);

      // Decrease product quantities (size-specific if size is provided)
      for (const item of items) {
        const productId = item.id || item.productId;
        const quantityToDeduct = item.quantity || 1;
        const size = item.size;
        
        if (productId) {
          const product = await this.productRepository.findOne({ where: { id: productId } });
          if (product) {
            // If size is provided and product has sizeQuantities, update size-specific stock
            if (size && product.sizeQuantities && typeof product.sizeQuantities === 'object') {
              const sizeQuantities = { ...product.sizeQuantities };
              const currentSizeQty = sizeQuantities[size] || 0;
              sizeQuantities[size] = Math.max(0, currentSizeQty - quantityToDeduct);
              
              // Also update total quantity
              const totalQuantity = (Object.values(sizeQuantities) as number[])
  .reduce((sum, qty) => sum + (qty || 0), 0);
              await this.productRepository.update(productId, { 
                sizeQuantities,
                quantity: totalQuantity
              });
            } else {
              // Fallback to total quantity if no size-specific stock
              const newQuantity = Math.max(0, (product.quantity || 0) - quantityToDeduct);
              await this.productRepository.update(productId, { quantity: newQuantity });
            }
          }
        }
      }
    }

    return await this.getOrderById(savedOrder.id);
  }

  async getAllOrders(): Promise<Order[]> {
    return await this.orderRepository.find({
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getOrderById(id: number, userId?: string): Promise<Order> {
    const whereCondition: any = { id };
    
    // If userId is provided, ensure the order belongs to that user
    if (userId) {
      whereCondition.userId = userId;
    }
    
    const order = await this.orderRepository.findOne({
      where: whereCondition,
      relations: ['items'],
    });
    if (!order) {
      throw new Error(`Order with id ${id} not found`);
    }
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order> {
    await this.orderRepository.update(id, { status });
    return await this.getOrderById(id);
  }

  async getOrdersByUserId(userId: string): Promise<Order[]> {
    if (!userId) {
      return [];
    }
    return await this.orderRepository.find({
      where: { userId },
      relations: ['items'],
      order: { createdAt: 'DESC' },
    });
  }

  async getStats() {
    const orders = await this.getAllOrders();
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, order) => {
      const total = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
      return sum + Number(total);
    }, 0);
    const pendingOrders = orders.filter(order => order.status === 'Pending').length;
    const completedOrders = orders.filter(order => order.status === 'Delivered').length;

    return {
      totalOrders,
      totalRevenue,
      pendingOrders,
      completedOrders,
    };
  }
}
