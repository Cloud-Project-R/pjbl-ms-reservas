import { Column, Entity, Index, PrimaryGeneratedColumn } from 'typeorm';

/**
 * Formato da tabela "reservas" no Azure SQL.
 * O TypeORM cria a tabela sozinho na primeira execução (synchronize).
 */
@Entity('reservas')
export class ReservaEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column({ type: 'varchar', length: 50 })
  salaId: string;

  @Column({ type: 'varchar', length: 50 })
  alunoId: string;

  @Column({ type: 'varchar', length: 50 })
  universidadeId: string;

  @Column({ type: 'datetime2' })
  inicio: Date;

  @Column({ type: 'datetime2' })
  fim: Date;

  @Column({ type: 'varchar', length: 20 })
  estado: 'CONFIRMADA' | 'CANCELADA';
}
