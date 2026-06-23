import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany
} from "typeorm";
import { Product } from "./Product";

@Entity()
export class Category {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  color: string;

  @Column({ type: "text" })
  image: string;

  @Column({ type: "boolean", default: false })
  isDeleted: boolean;

  @OneToMany(() => Product, (product) => product.category)
  products: Product[];
}
