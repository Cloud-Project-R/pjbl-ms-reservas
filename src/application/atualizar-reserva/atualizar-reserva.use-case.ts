import { ErroDeValidacao, ErroNaoEncontrado } from '../../domain/erros';
import { Reserva, validarHorario, verificarConflito } from '../../domain/reserva';
import { ReservaRepository } from '../reserva.repository';

/** Novo horário da reserva. */
export interface DadosAtualizarReserva {
  inicio: string; // data ISO 8601
  fim: string;
}

/** Caso de uso: mudar o horário de uma reserva (conferindo o conflito de novo). */
export class AtualizarReservaUseCase {
  constructor(private readonly repositorio: ReservaRepository) {}

  async executar(id: string, dados: DadosAtualizarReserva): Promise<Reserva> {
    const inicio = new Date(dados.inicio);
    const fim = new Date(dados.fim);
    validarHorario(inicio, fim);

    return this.repositorio.emTransacao(async (repositorio) => {
      // 1. A reserva precisa existir e estar confirmada
      const reservaAtual = await repositorio.buscarPorId(id);
      if (!reservaAtual) {
        throw new ErroNaoEncontrado(`Reserva ${id} não encontrada.`);
      }
      if (reservaAtual.estado === 'CANCELADA') {
        throw new ErroDeValidacao('Uma reserva cancelada não pode mudar de horário.');
      }

      // 2. O novo horário não pode bater com outra reserva da mesma sala
      const reservaComNovoHorario: Reserva = { ...reservaAtual, inicio, fim };
      const reservasDaSala = await repositorio.listarConfirmadasDaSala(reservaAtual.salaId);
      verificarConflito(reservaComNovoHorario, reservasDaSala);

      // 3. Grava
      return repositorio.atualizar(id, reservaComNovoHorario);
    });
  }
}
