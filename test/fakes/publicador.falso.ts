import { PublicadorDeEventos } from '../../src/application/publicador-de-eventos';
import { ReservaConfirmadaEvento } from '../../src/domain/reserva-confirmada.evento';

/** Fila FALSA, usada só nos testes: guarda os eventos numa lista. */
export class PublicadorFalso implements PublicadorDeEventos {
  eventos: ReservaConfirmadaEvento[] = [];
  deveFalhar = false;

  async publicar(evento: ReservaConfirmadaEvento): Promise<void> {
    if (this.deveFalhar) {
      throw new Error('Fila fora do ar (simulado)');
    }
    this.eventos.push(evento);
  }
}
