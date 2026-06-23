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
import { User } from "./User";
import { Address } from "./Address";
import { Offer } from "./Offer";
import { OrderItem } from "./OrderItem";
import { decimalTransformer } from "./decimalTransformer";

@Entity()
export class Order {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "uuid" })
  userId: string;

  @ManyToOne(() => User, (user) => user.orders, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @Column({ type: "timestamp", default: () => "CURRENT_TIMESTAMP" })
  orderDate: Date;

  @Column({
    type: "varchar",
    default: "Pending"
  })
  orderStatus: string;

  @Column({ type: "uuid" })
  delAddressId: string;

  @ManyToOne(() => Address)
  @JoinColumn({ name: "delAddressId" })
  delAddress: Address;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer
  })
  shippingCharge: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    default: 0,
    transformer: decimalTransformer
  })
  total: number;

  @Column({ type: "varchar", default: "Cash on Delivery" })
  paymentMode: string;

  @Column({
    type: "varchar",
    default: "Pending"
  })
  paymentStatus: string;

  @Index()
  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @Column({ type: "uuid", nullable: true, default: null })
  offerId: string | null;

  @ManyToOne(() => Offer, (offer) => offer.orders, { nullable: true, onDelete: "SET NULL" })
  @JoinColumn({ name: "offerId" })
  offer: Offer | null;

  @Column({ type: "varchar", default: "" })
  razorpayOrderId: string;

  @Column({ type: "varchar", default: "" })
  razorpayPaymentId: string;

  @OneToMany(() => OrderItem, (item) => item.order, { cascade: true })
  items: OrderItem[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
