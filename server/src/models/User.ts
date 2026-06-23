import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  OneToOne,
  Index,
  CreateDateColumn
} from "typeorm";
import { Address } from "./Address";
import { Order } from "./Order";
import { Review } from "./Review";
import { Cart } from "./Cart";
import { Wishlist } from "./Wishlist";

@Entity()
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", nullable: true })
  firstName: string | null;

  @Column({ type: "varchar", nullable: true })
  lastName: string | null;

  @Index({ unique: true })
  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar", nullable: true })
  mobile: string | null;

  @Column({ type: "varchar", nullable: true })
  password: string | null;

  @Column({ type: "text", nullable: true, default: null })
  profilePicture: string | null;

  @Column({ type: "varchar", default: "User" })
  role: string;

  @Column({ type: "varchar", default: "Inactive" })
  status: string;

  @Column({ type: "varchar", nullable: true, default: null })
  token: string | null;

  @Column({ type: "varchar", default: "Email" })
  authType: string;

  @CreateDateColumn()
  createdAt: Date;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  addresses: Address[];

  @OneToMany(() => Order, (order) => order.user)
  orders: Order[];

  @OneToMany(() => Review, (review) => review.user)
  reviews: Review[];

  @OneToOne(() => Cart, (cart) => cart.user)
  cart: Cart;

  @OneToOne(() => Wishlist, (wishlist) => wishlist.user)
  wishlist: Wishlist;
}
