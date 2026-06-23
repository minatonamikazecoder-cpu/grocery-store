import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Banner {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "text" })
  bannerImage: string;

  @Column({ type: "integer" })
  viewOrder: number;

  @Column({ type: "boolean" })
  activeStatus: boolean;

  @Column({ type: "varchar", default: "slider" })
  type: string;
}
