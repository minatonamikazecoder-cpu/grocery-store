import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  JoinColumn
} from "typeorm";
import { Wishlist } from "./Wishlist";
import { Product } from "./Product";

@Entity()
export class WishlistItem {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  wishlistId: string;

  @ManyToOne(() => Wishlist, (wishlist) => wishlist.items, { onDelete: "CASCADE" })
  @JoinColumn({ name: "wishlistId" })
  wishlist: Wishlist;

  @Column({ type: "uuid" })
  productId: string;

  @ManyToOne(() => Product, (product) => product.wishlistItems, { onDelete: "CASCADE" })
  @JoinColumn({ name: "productId" })
  product: Product;
}
