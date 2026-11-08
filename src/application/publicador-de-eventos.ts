import { ReservaConfirmadaEvento } from '../domain/reserva-confirmada.evento';

/**
 * "Porta" da mensageria.
 * Diz que precisamos publicar eventos, sem dizer onde.
 * Quem implementa é a camada infrastructure (no nosso caso, Azure Storage Queue).
 */
export interface PublicadorDeEventos {
  publicar(evento: ReservaConfirmadaEvento): Promise<void>;
}

/** Nome usado para "ligar" a porta à implementação (no app.module.ts). */
export const PUBLICADOR_DE_EVENTOS = 'PublicadorDeEventos';
