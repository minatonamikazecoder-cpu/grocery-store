import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Order } from "./Order";
import { Product } from "./Product";
import { decimalTransformer } from "./decimalTransformer";

@Entity()
export class OrderItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  orderId: string;

  @ManyToOne(() => Order, (order) => order.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "orderId" })
  order: Order;

  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.orderItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: Product;

  @Column({ type: "integer" })
  quantity: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  price: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer
  })
  discount: number;
}
