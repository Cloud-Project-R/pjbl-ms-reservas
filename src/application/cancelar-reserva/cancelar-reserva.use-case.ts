import { ErroNaoEncontrado } from '../../domain/erros';
import { Reserva } from '../../domain/reserva';
import { ReservaRepository } from '../reserva.repository';

/**
 * Caso de uso: cancelar uma reserva.
 * A reserva não é apagada: o estado vira CANCELADA e o horário fica livre de novo.
 */
export class CancelarReservaUseCase {
  constructor(private readonly repositorio: ReservaRepository) {}

  async executar(id: string): Promise<Reserva> {
    const reserva = await this.repositorio.buscarPorId(id);
    if (!reserva) {
      throw new ErroNaoEncontrado(`Reserva ${id} não encontrada.`);
    }
    return this.repositorio.atualizar(id, { ...reserva, estado: 'CANCELADA' });
  }
}
