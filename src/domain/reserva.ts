import { ErroDeConflito, ErroDeValidacao } from './erros';

export type EstadoDaReserva = 'CONFIRMADA' | 'CANCELADA';

/** Uma reserva de sala feita por um aluno. O "id" só existe depois de salvar. */
export interface Reserva {
  id?: string;
  salaId: string;
  alunoId: string;
  universidadeId: string;
  inicio: Date;
  fim: Date;
  estado: EstadoDaReserva;
}

/** Regra: as datas precisam ser válidas e o fim precisa ser depois do início. */
export function validarHorario(inicio: Date, fim: Date): void {
  if (isNaN(inicio.getTime()) || isNaN(fim.getTime())) {
    throw new ErroDeValidacao('As datas de início e fim precisam ser válidas.');
  }
  if (fim <= inicio) {
    throw new ErroDeValidacao('O fim da reserva deve ser depois do início.');
  }
}

/**
 * Dois horários se sobrepõem quando um começa antes do outro terminar.
 * Exemplo: 13h-14h e 13h30-15h se sobrepõem. 13h-14h e 14h-15h NÃO (só encostam).
 */
export function horariosSeSobrepoem(a: { inicio: Date; fim: Date }, b: { inicio: Date; fim: Date }): boolean {
  return a.inicio < b.fim && b.inicio < a.fim;
}

/**
 * REGRA DE NEGÓCIO PRINCIPAL:
 * uma sala não pode ter duas reservas CONFIRMADAS em horários que se sobrepõem.
 * "existentes" são as reservas que já estão gravadas para a mesma sala.
 */
export function verificarConflito(nova: Reserva, existentes: Reserva[]): void {
  const conflito = existentes.find(
    (existente) =>
      existente.estado === 'CONFIRMADA' &&
      existente.id !== nova.id && // ao mudar o horário, a reserva não conflita com ela mesma
      horariosSeSobrepoem(nova, existente),
  );
  if (conflito) {
    throw new ErroDeConflito(
      `A sala ${nova.salaId} já está reservada entre ${conflito.inicio.toISOString()} e ${conflito.fim.toISOString()}.`,
    );
  }
}
