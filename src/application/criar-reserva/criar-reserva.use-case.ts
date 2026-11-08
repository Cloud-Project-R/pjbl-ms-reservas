import { criarEventoReservaConfirmada } from '../../domain/reserva-confirmada.evento';
import { Reserva, validarHorario, verificarConflito } from '../../domain/reserva';
import { PublicadorDeEventos } from '../publicador-de-eventos';
import { ReservaRepository } from '../reserva.repository';

/** Dados que o aluno informa para reservar uma sala. */
export interface DadosCriarReserva {
  salaId: string;
  alunoId: string;
  universidadeId: string;
  inicio: string; // data ISO 8601, ex.: 2026-11-10T13:00:00Z
  fim: string;
}

/** Caso de uso: reservar uma sala. */
export class CriarReservaUseCase {
  constructor(
    private readonly repositorio: ReservaRepository,
    private readonly publicador: PublicadorDeEventos,
  ) {}

  async executar(dados: DadosCriarReserva): Promise<Reserva> {
    // 1. Monta a reserva e confere se o horário faz sentido
    const novaReserva: Reserva = {
      salaId: dados.salaId,
      alunoId: dados.alunoId,
      universidadeId: dados.universidadeId,
      inicio: new Date(dados.inicio),
      fim: new Date(dados.fim),
      estado: 'CONFIRMADA',
    };
    validarHorario(novaReserva.inicio, novaReserva.fim);

    // 2. Dentro de uma transação: confere conflito e grava
    const reservaSalva = await this.repositorio.emTransacao(async (repositorio) => {
      const reservasDaSala = await repositorio.listarConfirmadasDaSala(novaReserva.salaId);
      verificarConflito(novaReserva, reservasDaSala); // lança ErroDeConflito (409) se houver
      return repositorio.salvar(novaReserva);
    });

    // 3. Avisa o resto do sistema (a Function) pela fila, sem fazer o aluno esperar.
    //    Se a fila falhar, a reserva continua valendo (Outbox fica como evolução).
    try {
      await this.publicador.publicar(criarEventoReservaConfirmada(reservaSalva));
    } catch (erro) {
      console.error('Não foi possível publicar o evento ReservaConfirmada:', erro);
    }

    return reservaSalva;
  }
}
