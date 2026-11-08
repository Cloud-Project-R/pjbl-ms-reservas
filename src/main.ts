import 'reflect-metadata';
import { existsSync } from 'fs';
import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ErrosDoDominioFilter } from './api/erros-do-dominio.filter';
import { AppModule } from './app.module';

/** Variáveis obrigatórias: sem elas o serviço nem sobe (veja o .env.example). */
const VARIAVEIS_OBRIGATORIAS = ['SQL_HOST', 'SQL_DATABASE', 'SQL_USER', 'SQL_PASSWORD', 'STORAGE_CONNECTION'];

/** Sobe o servidor HTTP e o Swagger em /docs. */
async function iniciar() {
  // Em ambiente local lê o arquivo .env. Na nuvem as variáveis já vêm do Azure.
  if (existsSync('.env')) {
    process.loadEnvFile('.env');
  }

  const faltando = VARIAVEIS_OBRIGATORIAS.filter((nome) => !process.env[nome]);
  if (faltando.length > 0) {
    throw new Error(`Faltam variáveis de ambiente: ${faltando.join(', ')} (veja o .env.example).`);
  }

  const app = await NestFactory.create(AppModule);

  // Segurança: recusa campos desconhecidos e dados em formato errado
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, forbidNonWhitelisted: true }));
  app.useGlobalFilters(new ErrosDoDominioFilter());

  // CORS só para uso local: na nuvem quem cuida disso é o API Gateway
  if (process.env.ENABLE_CORS === 'true') {
    app.enableCors();
  }

  const configSwagger = new DocumentBuilder()
    .setTitle('MS Reservas')
    .setDescription(
      'Microserviço de Reservas da Plataforma de Reservas (Azure SQL). ' +
        'Regra de negócio: uma sala não pode ter duas reservas confirmadas em horários sobrepostos (409). ' +
        'Ao confirmar uma reserva, publica o evento ReservaConfirmada na Azure Storage Queue (tag Eventos).',
    )
    .setVersion('1.0')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, configSwagger));

  const porta = Number(process.env.PORT ?? 3000);
  await app.listen(porta);
  console.log(`MS Reservas rodando na porta ${porta}. Swagger em /docs`);
}

iniciar();
