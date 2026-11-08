import { Module } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { EventosController } from './api/eventos.controller';
import { HealthController } from './api/health.controller';
import { ReservaController } from './api/reserva.controller';
import { AtualizarReservaUseCase } from './application/atualizar-reserva/atualizar-reserva.use-case';
import { BuscarReservaUseCase } from './application/buscar-reserva/buscar-reserva.use-case';
import { CancelarReservaUseCase } from './application/cancelar-reserva/cancelar-reserva.use-case';
import { CriarReservaUseCase } from './application/criar-reserva/criar-reserva.use-case';
import { ListarReservasUseCase } from './application/listar-reservas/listar-reservas.use-case';
import { PUBLICADOR_DE_EVENTOS, PublicadorDeEventos } from './application/publicador-de-eventos';
import { RESERVA_REPOSITORY, ReservaRepository } from './application/reserva.repository';
import { StorageQueuePublicador } from './infrastructure/fila/storage-queue.publicador';
import { conectarSql } from './infrastructure/sql/conexao-sql';
import { ReservaSqlRepository } from './infrastructure/sql/reserva.sql.repository';

const CONEXAO_SQL = 'ConexaoSql';

/**
 * Liga todas as peças. É o ÚNICO arquivo que conhece todas as camadas.
 * Aqui dizemos: "a porta ReservaRepository é o Azure SQL",
 * "a porta PublicadorDeEventos é a Storage Queue"
 * e "cada caso de uso recebe o que precisa".
 */
@Module({
  controllers: [ReservaController, EventosController, HealthController],
  providers: [
    // Infraestrutura
    { provide: CONEXAO_SQL, useFactory: () => conectarSql() },
    {
      provide: RESERVA_REPOSITORY,
      useFactory: (conexao: DataSource) => new ReservaSqlRepository(conexao.manager),
      inject: [CONEXAO_SQL],
    },
    {
      provide: PUBLICADOR_DE_EVENTOS,
      useFactory: () => new StorageQueuePublicador(process.env.STORAGE_CONNECTION!),
    },

    // Casos de uso (uma fatia por ação)
    {
      provide: CriarReservaUseCase,
      useFactory: (repositorio: ReservaRepository, publicador: PublicadorDeEventos) =>
        new CriarReservaUseCase(repositorio, publicador),
      inject: [RESERVA_REPOSITORY, PUBLICADOR_DE_EVENTOS],
    },
    {
      provide: ListarReservasUseCase,
      useFactory: (repositorio: ReservaRepository) => new ListarReservasUseCase(repositorio),
      inject: [RESERVA_REPOSITORY],
    },
    {
      provide: BuscarReservaUseCase,
      useFactory: (repositorio: ReservaRepository) => new BuscarReservaUseCase(repositorio),
      inject: [RESERVA_REPOSITORY],
    },
    {
      provide: AtualizarReservaUseCase,
      useFactory: (repositorio: ReservaRepository) => new AtualizarReservaUseCase(repositorio),
      inject: [RESERVA_REPOSITORY],
    },
    {
      provide: CancelarReservaUseCase,
      useFactory: (repositorio: ReservaRepository) => new CancelarReservaUseCase(repositorio),
      inject: [RESERVA_REPOSITORY],
    },
  ],
})
export class AppModule {}
