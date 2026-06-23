import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Response {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar" })
  name: string;

  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  phone: string;

  @Column({ type: "text" })
  message: string;

  @Column({ type: "text", nullable: true, default: null })
  reply: string | null;
}
