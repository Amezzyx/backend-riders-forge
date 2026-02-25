import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

@Entity('graphics_requests')
export class GraphicsRequest {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  phone: string;

  @Column()
  bikeModel: string;

  @Column({ nullable: true })
  bikeYear: string;

  @Column({ nullable: true })
  designType: string;

  @Column('text', { nullable: true })
  designDescription: string;

  @Column({ nullable: true })
  budget: string;

  @Column({ nullable: true })
  timeline: string;

  @Column({ default: 'Pending' })
  status: string;

  @CreateDateColumn()
  createdAt: Date;
}





