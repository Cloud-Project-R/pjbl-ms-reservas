import { EntityManager } from 'typeorm';
import { FiltroDeReservas, ReservaRepository } from '../../application/reserva.repository';
import { Reserva } from '../../domain/reserva';
import { ReservaEntity } from './reserva.entity';

/** Formato de um id gerado pelo banco (uuid). Ids em outro formato simplesmente não existem. */
const FORMATO_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Converte a linha da tabela para a nossa Reserva. */
function paraReserva(linha: ReservaEntity): Reserva {
  return {
    id: linha.id.toLowerCase(),
    salaId: linha.salaId,
    alunoId: linha.alunoId,
    universidadeId: linha.universidadeId,
    inicio: linha.inicio,
    fim: linha.fim,
    estado: linha.estado,
  };
}

/**
 * Implementação da porta ReservaRepository usando Azure SQL (via TypeORM).
 * Todas as consultas usam parâmetros do TypeORM, o que evita "SQL injection".
 */
export class ReservaSqlRepository implements ReservaRepository {
  constructor(private readonly banco: EntityManager) {}

  async salvar(reserva: Reserva): Promise<Reserva> {
    const linha = await this.banco.save(ReservaEntity, {
      salaId: reserva.salaId,
      alunoId: reserva.alunoId,
      universidadeId: reserva.universidadeId,
      inicio: reserva.inicio,
      fim: reserva.fim,
      estado: reserva.estado,
    });
    return paraReserva(linha as ReservaEntity);
  }

  async listar(filtro: FiltroDeReservas): Promise<Reserva[]> {
    const onde: Partial<ReservaEntity> = {};
    if (filtro.salaId) onde.salaId = String(filtro.salaId);
    if (filtro.alunoId) onde.alunoId = String(filtro.alunoId);

    const linhas = await this.banco.find(ReservaEntity, { where: onde, order: { inicio: 'ASC' } });
    return linhas.map(paraReserva);
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    if (!FORMATO_UUID.test(id)) {
      return null;
    }
    const linha = await this.banco.findOne(ReservaEntity, { where: { id } });
    return linha ? paraReserva(linha) : null;
  }

  async listarConfirmadasDaSala(salaId: string): Promise<Reserva[]> {
    const linhas = await this.banco.find(ReservaEntity, { where: { salaId, estado: 'CONFIRMADA' } });
    return linhas.map(paraReserva);
  }

  async atualizar(id: string, reserva: Reserva): Promise<Reserva> {
    await this.banco.update(ReservaEntity, { id }, { inicio: reserva.inicio, fim: reserva.fim, estado: reserva.estado });
    const linha = await this.banco.findOneOrFail(ReservaEntity, { where: { id } });
    return paraReserva(linha);
  }

  /**
   * Abre uma transação SERIALIZABLE (o nível mais rígido do SQL Server):
   * enquanto uma reserva confere o conflito e grava, outra da mesma sala espera.
   */
  async emTransacao<T>(trabalho: (repositorio: ReservaRepository) => Promise<T>): Promise<T> {
    return this.banco.transaction('SERIALIZABLE', (bancoDaTransacao) =>
      trabalho(new ReservaSqlRepository(bancoDaTransacao)),
    );
  }
}
