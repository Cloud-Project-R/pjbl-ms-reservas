import { QueueClient } from '@azure/storage-queue';
import { PublicadorDeEventos } from '../../application/publicador-de-eventos';
import { ReservaConfirmadaEvento } from '../../domain/reserva-confirmada.evento';

/** Nome da fila que a Azure Function escuta. */
export const NOME_DA_FILA = 'reserva-confirmada';

/** Implementação da porta PublicadorDeEventos usando Azure Storage Queue. */
export class StorageQueuePublicador implements PublicadorDeEventos {
  private readonly fila: QueueClient;
  private filaCriada = false;

  constructor(connectionString: string) {
    this.fila = new QueueClient(connectionString, NOME_DA_FILA);
  }

  async publicar(evento: ReservaConfirmadaEvento): Promise<void> {
    // Na primeira vez, cria a fila se ela ainda não existir
    if (!this.filaCriada) {
      await this.fila.createIfNotExists();
      this.filaCriada = true;
    }

    // ATENÇÃO: o gatilho de fila da Azure Function espera a mensagem em Base64.
    // Se mandar o JSON puro, a Function não consegue ler e a mensagem vai para a fila "-poison".
    const mensagemBase64 = Buffer.from(JSON.stringify(evento)).toString('base64');
    await this.fila.sendMessage(mensagemBase64);
    console.log(`Evento ReservaConfirmada publicado (eventId ${evento.eventId})`);
  }
}
