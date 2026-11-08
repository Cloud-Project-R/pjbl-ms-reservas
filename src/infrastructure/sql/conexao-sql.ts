import { DataSource } from 'typeorm';
import { ReservaEntity } from './reserva.entity';

/** Abre a conexão com o Azure SQL usando as variáveis de ambiente. */
export async function conectarSql(): Promise<DataSource> {
  const conexao = new DataSource({
    type: 'mssql',
    host: process.env.SQL_HOST,
    database: process.env.SQL_DATABASE,
    username: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    port: 1433,
    entities: [ReservaEntity],
    synchronize: true, // cria/ajusta a tabela sozinho (simples para o projeto da disciplina)
    options: {
      encrypt: true, // o Azure SQL exige conexão criptografada
      useUTC: true, // grava e lê as datas em UTC (sem isso, o horário muda conforme o fuso da máquina)
    },
    connectionTimeout: 60000, // o banco gratuito pode estar "dormindo" e demorar para acordar
  });
  await conexao.initialize();
  console.log('Conectado ao Azure SQL');
  return conexao;
}
