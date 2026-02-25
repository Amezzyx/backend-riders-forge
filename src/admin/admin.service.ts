import { Injectable } from '@nestjs/common';
import { OrdersService } from '../orders/orders.service';
import { UsersService } from '../users/users.service';

@Injectable()
export class AdminService {
  constructor(
    private readonly ordersService: OrdersService,
    private readonly usersService: UsersService,
  ) {}

  async getStats() {
    return await this.ordersService.getStats();
  }

  async getOrders(limit: number = 10) {
    const allOrders = await this.ordersService.getAllOrders();
    return allOrders.slice(0, limit).map(order => ({
      id: order.id,
      orderNumber: order.orderNumber,
      customer: order.firstName && order.lastName 
        ? `${order.firstName} ${order.lastName}` 
        : 'Unknown',
      email: order.email,
      amount: Number(order.total) || 0,
      status: order.status || 'Pending',
      date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
      items: order.items?.length || 0,
    }));
  }

  async getAllOrders() {
    const allOrders = await this.ordersService.getAllOrders();
    return allOrders.map(order => {
      const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
      // Ensure all items are properly formatted with all fields
      const formattedItems = (order.items || []).map(item => ({
        id: item.id,
        productId: item.productId,
        productName: item.productName || 'Unknown Product',
        name: item.productName || 'Unknown Product', // Alias for compatibility
        price: typeof item.price === 'string' ? parseFloat(item.price) : (item.price || 0),
        quantity: item.quantity || 1,
        size: item.size || null,
        image: item.image || null,
      }));
      
      return {
        id: order.id,
        orderNumber: order.orderNumber,
        customer: order.firstName && order.lastName 
          ? `${order.firstName} ${order.lastName}` 
          : 'Unknown',
        firstName: order.firstName || '',
        lastName: order.lastName || '',
        email: order.email,
        phone: order.phone || '-',
        address: order.address || '-',
        city: order.city || '-',
        postalCode: order.postalCode || '-',
        country: order.country || '-',
        amount: orderTotal,
        status: order.status || 'Pending',
        paymentMethod: order.paymentMethod || '-',
        date: order.createdAt ? new Date(order.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        createdAt: order.createdAt,
        items: formattedItems,
        itemsCount: formattedItems.length,
      };
    });
  }

  async getCustomers() {
    const users = await this.usersService.getAllUsers();
    // Get orders for each user to calculate total spent and order count
    const allOrders = await this.ordersService.getAllOrders();
    
    // Return all users, including those without orders
    return users.map(user => {
      const userOrders = allOrders.filter(order => order.userId === user.id);
      const totalSpent = userOrders.reduce((sum, order) => {
        const orderTotal = typeof order.total === 'string' ? parseFloat(order.total) : (order.total || 0);
        return sum + Number(orderTotal);
      }, 0);
      const orderCount = userOrders.length;
      
      return {
        id: user.id,
        name: user.name || user.email.split('@')[0],
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email,
        phone: user.phone || '-',
        country: user.country || '-',
        city: user.city || '-',
        isAdmin: user.isAdmin || false,
        totalSpent: totalSpent || 0,
        orderCount: orderCount || 0,
        registeredDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '-',
      };
    });
  }
}

