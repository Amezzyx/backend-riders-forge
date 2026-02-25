import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column('decimal', { precision: 10, scale: 2 })
  price: number;

  @Column('decimal', { precision: 10, scale: 2, nullable: true })
  regularPrice: number;

  @Column('text', { nullable: true })
  description: string;

  @Column()
  category: string;

  @Column('varchar', { nullable: true })
  subcategory: string | null;

  @Column('simple-array', { nullable: true })
  sizes: string[];

  @Column({ nullable: true })
  image: string;

  @Column({ default: false })
  isNew: boolean;

  @Column({ default: true })
  isActive: boolean;

  @Column({ default: 0 })
  quantity: number;

  @Column('json', { nullable: true })
  sizeQuantities: Record<string, number>;
}
