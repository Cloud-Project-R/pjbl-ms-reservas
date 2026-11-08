import { FiltroDeReservas, ReservaRepository } from '../../src/application/reserva.repository';
import { Reserva } from '../../src/domain/reserva';

/**
 * Banco de dados FALSO, usado só nos testes.
 * Guarda as reservas numa lista na memória, então o teste roda sem Azure SQL.
 */
export class ReservaRepositoryEmMemoria implements ReservaRepository {
  reservas: Reserva[] = [];
  private proximoId = 1;

  async salvar(reserva: Reserva): Promise<Reserva> {
    const reservaSalva = { ...reserva, id: String(this.proximoId++) };
    this.reservas.push(reservaSalva);
    return reservaSalva;
  }

  async listar(filtro: FiltroDeReservas): Promise<Reserva[]> {
    return this.reservas.filter(
      (r) => (!filtro.salaId || r.salaId === filtro.salaId) && (!filtro.alunoId || r.alunoId === filtro.alunoId),
    );
  }

  async buscarPorId(id: string): Promise<Reserva | null> {
    return this.reservas.find((r) => r.id === id) ?? null;
  }

  async listarConfirmadasDaSala(salaId: string): Promise<Reserva[]> {
    return this.reservas.filter((r) => r.salaId === salaId && r.estado === 'CONFIRMADA');
  }

  async atualizar(id: string, reserva: Reserva): Promise<Reserva> {
    const posicao = this.reservas.findIndex((r) => r.id === id);
    this.reservas[posicao] = { ...reserva, id };
    return this.reservas[posicao];
  }

  async emTransacao<T>(trabalho: (repositorio: ReservaRepository) => Promise<T>): Promise<T> {
    return trabalho(this); // na memória não existe transação de verdade
  }
}
