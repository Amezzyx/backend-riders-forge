import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Product } from '../entities/product.entity';

@Injectable()
export class ProductsService {
  constructor(
    @InjectRepository(Product)
    private readonly productRepository: Repository<Product>,
  ) {}

  async getAllProducts(): Promise<Product[]> {
    return await this.productRepository.find({
      where: { isActive: true },
      order: { id: 'ASC' },
    });
  }

  /** Set every product to 4 pcs per size (overwrites current stock). */
  async setAllProductsStockToFour(): Promise<{ updated: number }> {
    const products = await this.productRepository.find({ order: { id: 'ASC' } });
    let updated = 0;
    for (const product of products) {
      const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
      const sizeQuantities: Record<string, number> = {};
      sizes.forEach(size => { sizeQuantities[size] = 4; });
      await this.productRepository.update(product.id, {
        sizeQuantities,
        quantity: 4 * sizes.length,
      });
      updated++;
    }
    return { updated };
  }

  /** Add 4 to every size on every product (keeps current stock, adds 4 per size). */
  async addFourToEverySize(): Promise<{ updated: number }> {
    const products = await this.productRepository.find({ order: { id: 'ASC' } });
    let updated = 0;
    for (const product of products) {
      const sizes = product.sizes && product.sizes.length > 0 ? product.sizes : ['One Size'];
      const sizeQuantities: Record<string, number> = { ...(product.sizeQuantities || {}) };
      sizes.forEach(size => {
        const current = sizeQuantities[size] ?? 0;
        sizeQuantities[size] = current + 4;
      });
      const totalQuantity = Object.values(sizeQuantities).reduce((sum, qty) => sum + (qty || 0), 0);
      await this.productRepository.update(product.id, {
        sizeQuantities,
        quantity: totalQuantity,
      });
      updated++;
    }
    return { updated };
  }

  async getProductById(id: number): Promise<Product> {
    const product = await this.productRepository.findOne({ where: { id } });
    if (!product) {
      throw new Error(`Product with id ${id} not found`);
    }
    return product;
  }

  async createProduct(productData: Partial<Product>): Promise<Product> {
    // Use whatever quantity/sizeQuantities the client sends; only fill defaults when missing
    if (productData.sizes && productData.sizes.length > 0 && !productData.sizeQuantities) {
      const sizeQuantities: Record<string, number> = {};
      productData.sizes.forEach(size => {
        sizeQuantities[size] = 0;
      });
      productData.sizeQuantities = sizeQuantities;
      productData.quantity = 0;
    }
    if (productData.quantity === undefined || productData.quantity === null) {
      productData.quantity = 0;
    }
    const product = this.productRepository.create(productData);
    return await this.productRepository.save(product);
  }

  async updateProduct(id: number, productData: Partial<Product>): Promise<Product> {
    // Only fill sizeQuantities when sizes exist and client didn't send sizeQuantities
    if (productData.sizes && productData.sizes.length > 0 && !productData.sizeQuantities) {
      const sizeQuantities: Record<string, number> = {};
      productData.sizes.forEach(size => {
        sizeQuantities[size] = 0;
      });
      productData.sizeQuantities = sizeQuantities;
      productData.quantity = 0;
    }
    await this.productRepository.update(id, productData);
    return await this.getProductById(id);
  }

  async deleteProduct(id: number): Promise<boolean> {
    const result = await this.productRepository.delete(id);
    return (result.affected ?? 0) > 0;
  }
}
