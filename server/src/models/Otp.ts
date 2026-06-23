import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index
} from "typeorm";

@Entity()
export class Otp {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Index()
  @Column({ type: "varchar" })
  email: string;

  @Column({ type: "varchar" })
  otp: string;

  @CreateDateColumn()
  createdAt: Date;
}
