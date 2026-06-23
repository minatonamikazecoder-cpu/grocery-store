import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn,
  OneToMany,
  Index,
  CreateDateColumn,
  UpdateDateColumn
} from "typeorm";
import { Category } from "./Category";
import { Review } from "./Review";
import { OrderItem } from "./OrderItem";
import { CartItem } from "./CartItem";
import { WishlistItem } from "./WishlistItem";
import { decimalTransformer } from "./decimalTransformer";

@Entity()
export class Product {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  categoryId: string;

  @ManyToOne(() => Category, (category) => category.products, { onDelete: "CASCADE" })
  @JoinColumn({ name: "categoryId" })
  category: Category;

  @Index()
  @Column({ type: "varchar" })
  productName: string;

  @Column({ type: "text" })
  description: string;

  @Column({ type: "text" })
  productImage: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  salePrice: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  costPrice: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  discount: number;

  @Column({ type: "integer", default: 0 })
  stock: number;

  @Index()
  @Column({ type: "boolean", default: true })
  isActive: boolean;

  @OneToMany(() => Review, (review) => review.product)
  reviews: Review[];

  @OneToMany(() => OrderItem, (orderItem) => orderItem.product)
  orderItems: OrderItem[];

  @OneToMany(() => CartItem, (cartItem) => cartItem.product)
  cartItems: CartItem[];

  @OneToMany(() => WishlistItem, (wishlistItem) => wishlistItem.product)
  wishlistItems: WishlistItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
