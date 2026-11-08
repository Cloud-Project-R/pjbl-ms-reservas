import { Body, Controller, Delete, Get, Param, Post, Put, Query } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiTags,
} from '@nestjs/swagger';
import { AtualizarReservaUseCase } from '../application/atualizar-reserva/atualizar-reserva.use-case';
import { BuscarReservaUseCase } from '../application/buscar-reserva/buscar-reserva.use-case';
import { CancelarReservaUseCase } from '../application/cancelar-reserva/cancelar-reserva.use-case';
import { CriarReservaUseCase } from '../application/criar-reserva/criar-reserva.use-case';
import { ListarReservasUseCase } from '../application/listar-reservas/listar-reservas.use-case';
import { AtualizarReservaDto, CriarReservaDto, ReservaRespostaDto } from './reserva.dto';

/**
 * "Porta HTTP" das reservas.
 * Cada rota só recebe o pedido e chama o caso de uso certo.
 * A regra de conflito NÃO está aqui: está no domain e no caso de uso.
 */
@ApiTags('Reservas')
@Controller('reservas')
export class ReservaController {
  constructor(
    private readonly criarReserva: CriarReservaUseCase,
    private readonly listarReservas: ListarReservasUseCase,
    private readonly buscarReserva: BuscarReservaUseCase,
    private readonly atualizarReserva: AtualizarReservaUseCase,
    private readonly cancelarReserva: CancelarReservaUseCase,
  ) {}

  @Post()
  @ApiCreatedResponse({ type: ReservaRespostaDto, description: 'Reserva confirmada (e evento publicado na fila)' })
  @ApiBadRequestResponse({ description: 'Dados inválidos ou fim antes do início' })
  @ApiConflictResponse({ description: 'A sala já tem reserva confirmada nesse horário' })
  criar(@Body() dados: CriarReservaDto) {
    return this.criarReserva.executar(dados);
  }

  @Get()
  @ApiQuery({ name: 'salaId', required: false })
  @ApiQuery({ name: 'alunoId', required: false, example: 'A-10' })
  @ApiOkResponse({ type: [ReservaRespostaDto] })
  listar(@Query('salaId') salaId?: string, @Query('alunoId') alunoId?: string) {
    return this.listarReservas.executar({ salaId, alunoId });
  }

  @Get(':id')
  @ApiOkResponse({ type: ReservaRespostaDto })
  @ApiNotFoundResponse({ description: 'Reserva não encontrada' })
  buscar(@Param('id') id: string) {
    return this.buscarReserva.executar(id);
  }

  @Put(':id')
  @ApiOkResponse({ type: ReservaRespostaDto, description: 'Horário alterado' })
  @ApiNotFoundResponse({ description: 'Reserva não encontrada' })
  @ApiConflictResponse({ description: 'O novo horário bate com outra reserva' })
  atualizar(@Param('id') id: string, @Body() dados: AtualizarReservaDto) {
    return this.atualizarReserva.executar(id, dados);
  }

  @Delete(':id')
  @ApiOkResponse({ type: ReservaRespostaDto, description: 'Reserva cancelada (estado = CANCELADA)' })
  @ApiNotFoundResponse({ description: 'Reserva não encontrada' })
  cancelar(@Param('id') id: string) {
    return this.cancelarReserva.executar(id);
  }
}
