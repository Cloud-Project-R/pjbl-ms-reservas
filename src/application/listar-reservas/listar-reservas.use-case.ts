import { Reserva } from '../../domain/reserva';
import { FiltroDeReservas, ReservaRepository } from '../reserva.repository';

/** Caso de uso: listar reservas (opcionalmente de uma sala ou de um aluno). */
export class ListarReservasUseCase {
  constructor(private readonly repositorio: ReservaRepository) {}

  async executar(filtro: FiltroDeReservas): Promise<Reserva[]> {
    return this.repositorio.listar(filtro);
  }
}
