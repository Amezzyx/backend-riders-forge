import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('api/admin')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Get('stats')
  async getStats() {
    return await this.adminService.getStats();
  }

  @Get('orders')
  async getOrders() {
    return await this.adminService.getOrders();
  }

  @Get('orders/all')
  async getAllOrders() {
    return await this.adminService.getAllOrders();
  }

  @Get('customers')
  async getCustomers() {
    return await this.adminService.getCustomers();
  }
}


