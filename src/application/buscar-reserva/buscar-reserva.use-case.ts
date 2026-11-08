import { ErroNaoEncontrado } from '../../domain/erros';
import { Reserva } from '../../domain/reserva';
import { ReservaRepository } from '../reserva.repository';

/** Caso de uso: buscar uma reserva pelo id. Se não existir, lança ErroNaoEncontrado. */
export class BuscarReservaUseCase {
  constructor(private readonly repositorio: ReservaRepository) {}

  async executar(id: string): Promise<Reserva> {
    const reserva = await this.repositorio.buscarPorId(id);
    if (!reserva) {
      throw new ErroNaoEncontrado(`Reserva ${id} não encontrada.`);
    }
    return reserva;
  }
}
