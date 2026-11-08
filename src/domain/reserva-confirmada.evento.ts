import { randomUUID } from 'crypto';
import { Reserva } from './reserva';

/**
 * Evento "ReservaConfirmada": um bilhete avisando que uma reserva foi confirmada.
 * Segue o arc42 (seção 4.5): id único, tipo, versão, instante e só as referências mínimas.
 */
export interface ReservaConfirmadaEvento {
  eventId: string;
  type: 'ReservaConfirmada';
  version: 1;
  occurredAt: string;
  universidadeId: string;
  data: {
    reservaId: string;
    salaId: string;
    alunoId: string;
    inicio: string;
    fim: string;
  };
}

/** Monta o evento a partir de uma reserva já salva. */
export function criarEventoReservaConfirmada(reserva: Reserva): ReservaConfirmadaEvento {
  return {
    eventId: randomUUID(),
    type: 'ReservaConfirmada',
    version: 1,
    occurredAt: new Date().toISOString(),
    universidadeId: reserva.universidadeId,
    data: {
      reservaId: reserva.id!,
      salaId: reserva.salaId,
      alunoId: reserva.alunoId,
      inicio: reserva.inicio.toISOString(),
      fim: reserva.fim.toISOString(),
    },
  };
}
