import { Controller, Get, Post, Put, Body, Param, Query } from '@nestjs/common';
import { OrdersService } from './orders.service';

@Controller('api/orders')
export class OrdersController {
  constructor(private readonly ordersService: OrdersService) {}

  @Post()
  async createOrder(@Body() createOrderDto: any) {
    try {
      return await this.ordersService.createOrder(createOrderDto);
    } catch (error) {
      console.error('Order creation error:', error);
      throw error;
    }
  }

  @Get()
  async getAllOrders() {
    return await this.ordersService.getAllOrders();
  }

  @Get('user/:userId')
  async getUserOrders(@Param('userId') userId: string) {
    return await this.ordersService.getOrdersByUserId(userId);
  }

  @Get(':id')
  async getOrder(@Param('id') id: string, @Query('userId') userId?: string) {
    return await this.ordersService.getOrderById(parseInt(id), userId);
  }

  @Put(':id/status')
  async updateOrderStatus(@Param('id') id: string, @Body() body: { status: string }) {
    return await this.ordersService.updateOrderStatus(parseInt(id), body.status);
  }
}


