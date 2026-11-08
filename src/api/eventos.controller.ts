import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { criarEventoReservaConfirmada } from '../domain/reserva-confirmada.evento';

/**
 * Documenta no Swagger (tag "Eventos") o evento que este serviço publica na fila.
 * Esta rota não publica nada: só mostra um exemplo do formato do evento.
 */
@ApiTags('Eventos')
@Controller('eventos')
export class EventosController {
  @Get('reserva-confirmada/exemplo')
  @ApiOperation({
    summary: 'Exemplo do evento ReservaConfirmada',
    description:
      'Publicado na Azure Storage Queue "reserva-confirmada" (codificado em Base64) sempre que uma reserva é criada. ' +
      'Quem consome é a Azure Function "notificar-reserva".',
  })
  @ApiOkResponse({
    schema: {
      example: {
        eventId: 'b3a1c9de-2f4a-4c1e-9d3b-7a5e1f0c8a11',
        type: 'ReservaConfirmada',
        version: 1,
        occurredAt: '2026-11-08T14:00:00.000Z',
        universidadeId: 'UNI-001',
        data: {
          reservaId: 'r1',
          salaId: 's1',
          alunoId: 'A-10',
          inicio: '2026-11-10T13:00:00.000Z',
          fim: '2026-11-10T14:00:00.000Z',
        },
      },
    },
  })
  exemplo() {
    return criarEventoReservaConfirmada({
      id: 'r1',
      salaId: 's1',
      alunoId: 'A-10',
      universidadeId: 'UNI-001',
      inicio: new Date('2026-11-10T13:00:00Z'),
      fim: new Date('2026-11-10T14:00:00Z'),
      estado: 'CONFIRMADA',
    });
  }
}
