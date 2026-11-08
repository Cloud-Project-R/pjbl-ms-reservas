import { Controller, Get } from '@nestjs/common';
import { ApiOkResponse, ApiTags } from '@nestjs/swagger';

/** Rota simples para saber se o serviço está no ar (e "acordá-lo" antes da demo). */
@ApiTags('Health')
@Controller('health')
export class HealthController {
  @Get()
  @ApiOkResponse({ schema: { example: { status: 'ok', servico: 'ms-reservas' } } })
  verificar() {
    return { status: 'ok', servico: 'ms-reservas' };
  }
}
