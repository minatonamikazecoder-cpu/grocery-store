import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Product } from "./Product";
import { User } from "./User";

@Entity()
export class Review {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, (user) => user.reviews, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "integer" })
  rating: number;

  @Column({ type: "text" })
  review: string;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  reviewDate: Date;

  @Column({ type: "text", nullable: true, default: null })
  reply: string | null;

  @Column({ type: "timestamp", nullable: true, default: null })
  replyDate: Date | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
