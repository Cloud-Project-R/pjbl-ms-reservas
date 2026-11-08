import { Reserva } from '../domain/reserva';

/** Filtros opcionais da listagem. */
export interface FiltroDeReservas {
  salaId?: string;
  alunoId?: string;
}

/**
 * "Porta" do banco de dados.
 * Diz O QUE os casos de uso precisam do banco, sem dizer COMO é feito.
 * Quem implementa é a camada infrastructure (no nosso caso, Azure SQL).
 */
export interface ReservaRepository {
  salvar(reserva: Reserva): Promise<Reserva>;
  listar(filtro: FiltroDeReservas): Promise<Reserva[]>;
  buscarPorId(id: string): Promise<Reserva | null>;
  listarConfirmadasDaSala(salaId: string): Promise<Reserva[]>;
  atualizar(id: string, reserva: Reserva): Promise<Reserva>;

  /**
   * Executa o "trabalho" dentro de uma TRANSAÇÃO do banco.
   * Assim, conferir o conflito e gravar acontecem juntos: duas pessoas
   * reservando a mesma sala ao mesmo tempo não passam as duas.
   */
  emTransacao<T>(trabalho: (repositorio: ReservaRepository) => Promise<T>): Promise<T>;
}

/** Nome usado para "ligar" a porta à implementação (no app.module.ts). */
export const RESERVA_REPOSITORY = 'ReservaRepository';
