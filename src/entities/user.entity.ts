import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @Column()
  name: string;

  @Column({ nullable: true })
  firstName: string;

  @Column({ nullable: true })
  lastName: string;

  @Column({ default: false })
  isAdmin: boolean;

  @Column({ nullable: true })
  phone: string;

  @Column({ nullable: true })
  address: string;

  @Column({ nullable: true })
  city: string;

  @Column({ nullable: true })
  postalCode: string;

  @Column({ default: 'Slovakia' })
  country: string;

  @Column({ nullable: true })
  paymentMethod: string;

  @Column('json', { nullable: true })
  addresses: Array<{
    id?: string;
    firstName: string;
    lastName: string;
    address: string;
    city: string;
    postalCode: string;
    country: string;
    phone?: string;
    isDefault?: boolean;
  }>;

  @Column('json', { nullable: true })
  paymentMethods: Array<{
    id?: string;
    type: string;
    cardNumber?: string;
    expiryMonth?: string;
    expiryYear?: string;
    cardholderName?: string;
    isDefault?: boolean;
  }>;

  @CreateDateColumn()
  createdAt: Date;
}

