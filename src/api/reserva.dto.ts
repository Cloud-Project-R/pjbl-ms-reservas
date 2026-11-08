import { ApiProperty } from '@nestjs/swagger';
import { IsISO8601, IsNotEmpty, IsString, MaxLength } from 'class-validator';

/**
 * Dados que chegam no corpo (body) do POST /reservas.
 *  - @ApiProperty: aparece no Swagger
 *  - @IsString, @IsISO8601...: o NestJS recusa (400) dados no formato errado
 */
export class CriarReservaDto {
  @ApiProperty({ example: '6730f1c2a1b2c3d4e5f60718', description: 'Id da sala (vem do MS Salas)' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  salaId: string;

  @ApiProperty({ example: 'A-10' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  alunoId: string;

  @ApiProperty({ example: 'UNI-001' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  universidadeId: string;

  @ApiProperty({ example: '2026-11-10T13:00:00Z', description: 'Data ISO 8601 em UTC' })
  @IsISO8601({ strict: true })
  inicio: string;

  @ApiProperty({ example: '2026-11-10T14:00:00Z', description: 'Data ISO 8601 em UTC' })
  @IsISO8601({ strict: true })
  fim: string;
}

/** Dados do PUT /reservas/:id (só o horário pode mudar). */
export class AtualizarReservaDto {
  @ApiProperty({ example: '2026-11-10T15:00:00Z' })
  @IsISO8601({ strict: true })
  inicio: string;

  @ApiProperty({ example: '2026-11-10T16:00:00Z' })
  @IsISO8601({ strict: true })
  fim: string;
}

/** Formato da reserva nas respostas (só para documentar no Swagger). */
export class ReservaRespostaDto {
  @ApiProperty({ example: '3f2b8c1e-4d5a-4b6c-9e7f-1a2b3c4d5e6f' })
  id: string;

  @ApiProperty({ example: '6730f1c2a1b2c3d4e5f60718' })
  salaId: string;

  @ApiProperty({ example: 'A-10' })
  alunoId: string;

  @ApiProperty({ example: 'UNI-001' })
  universidadeId: string;

  @ApiProperty({ example: '2026-11-10T13:00:00.000Z' })
  inicio: string;

  @ApiProperty({ example: '2026-11-10T14:00:00.000Z' })
  fim: string;

  @ApiProperty({ enum: ['CONFIRMADA', 'CANCELADA'] })
  estado: string;
}
