import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import { AdminController } from './admin/admin.controller';
import { AdminService } from './admin/admin.service';

import { ProductsController } from './products/products.controller';
import { ProductsService } from './products/products.service';

import { OrdersController } from './orders/orders.controller';
import { OrdersService } from './orders/orders.service';

import { UsersController } from './users/users.controller';
import { UsersService } from './users/users.service';

import { RequestsModule } from './requests/requests.module';

import { databaseConfig } from './config/database.config';

import { Product } from './entities/product.entity';
import { User } from './entities/user.entity';
import { Order } from './entities/order.entity';
import { OrderItem } from './entities/order-item.entity';
import { ContactRequest } from './entities/contact-request.entity';
import { GraphicsRequest } from './entities/graphics-request.entity';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot(databaseConfig),
    TypeOrmModule.forFeature([Product, User, Order, OrderItem, ContactRequest, GraphicsRequest]),
    RequestsModule,
  ],
  controllers: [
    AppController,
    AdminController,
    ProductsController,
    OrdersController,
    UsersController,
  ],
  providers: [
    AppService,
    AdminService,
    ProductsService,
    OrdersService,
    UsersService,
  ],
})
export class AppModule {}
