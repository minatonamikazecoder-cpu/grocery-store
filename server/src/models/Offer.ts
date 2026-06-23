import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { decimalTransformer } from "./decimalTransformer";
import { Order } from "./Order";

@Entity()
export class Offer {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  offerCode: string;

  @Column({ type: "text" })
  offerDescription: string;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  discount: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  maxDiscount: number;

  @Column({
    type: "decimal",
    precision: 10,
    scale: 2,
    transformer: decimalTransformer
  })
  minimumOrder: number;

  @Column({ type: "timestamp" })
  startDate: Date;

  @Column({ type: "timestamp" })
  endDate: Date;

  @OneToMany(() => Order, (order) => order.offer)
  orders: Order[];
}
