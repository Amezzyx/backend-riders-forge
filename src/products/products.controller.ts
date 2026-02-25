import { Controller, Get, Post, Put, Patch, Delete, Param, Body } from '@nestjs/common';
import { ProductsService } from './products.service';

@Controller('api/products')
export class ProductsController {
  constructor(private readonly productsService: ProductsService) {}

  @Patch('stock/set-all-four')
  async setAllStockToFour() {
    return await this.productsService.setAllProductsStockToFour();
  }

  @Patch('stock/add-four-every-size')
  async addFourToEverySize() {
    return await this.productsService.addFourToEverySize();
  }

  @Get()
  async getAllProducts() {
    return await this.productsService.getAllProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productsService.getProductById(parseInt(id));
  }

  @Post()
  async createProduct(@Body() productData: any) {
    return await this.productsService.createProduct(productData);
  }

  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() productData: any) {
    return await this.productsService.updateProduct(parseInt(id), productData);
  }

  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    const result = await this.productsService.deleteProduct(parseInt(id));
    return { success: result };
  }
}


