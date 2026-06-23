import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class ContactPage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  contactEmail: string;

  @Column({ type: "varchar" })
  contactNumber: string;
}
