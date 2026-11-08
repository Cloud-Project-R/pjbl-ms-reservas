# pjbl-ms-reservas

Microserviço de **Reservas** da Plataforma de Reservas de Salas Universitárias (PJBL – Entrega 3).
Guarda as reservas no **Azure SQL Database**, aplica a regra de conflito de horário e publica o
evento **ReservaConfirmada** na **Azure Storage Queue**.

## Arquitetura

O código segue **Clean Architecture** (4 camadas) e **Vertical Slice** (uma pasta por ação do usuário):

```
src/
├─ domain/            regras do negócio, TypeScript puro
│  ├─ reserva.ts                    validarHorario, horariosSeSobrepoem, verificarConflito
│  ├─ reserva-confirmada.evento.ts  formato do evento
│  └─ erros.ts                      400 / 404 / 409
├─ application/       casos de uso, UMA PASTA POR FUNCIONALIDADE
│  ├─ criar-reserva/
│  ├─ listar-reservas/
│  ├─ buscar-reserva/
│  ├─ atualizar-reserva/
│  ├─ cancelar-reserva/
│  ├─ reserva.repository.ts       "porta" do banco
│  └─ publicador-de-eventos.ts    "porta" da fila
├─ infrastructure/    detalhes técnicos
│  ├─ sql/            Azure SQL com TypeORM (transação SERIALIZABLE)
│  └─ fila/           Azure Storage Queue (mensagem em Base64)
├─ api/               HTTP: controllers e DTOs (com Swagger)
├─ app.module.ts      liga todas as peças
└─ main.ts            sobe o servidor e o Swagger em /docs
test/architecture/    teste que confere a regra de dependência entre camadas
```

**Regra de negócio:** uma sala não pode ter duas reservas **confirmadas** em horários que se
sobrepõem. A segunda tentativa recebe **409 Conflict**. A conferência e a gravação acontecem
dentro de uma transação do banco.

**Evento:** depois de gravar, o serviço coloca o evento `ReservaConfirmada` na fila
`reserva-confirmada`. A Azure Function `notificar-reserva` lê esse evento e registra uma
notificação. O aluno não espera por isso (comunicação assíncrona).

Na arquitetura geral, este serviço é chamado **somente pelo BFF**.

### Rotas

| Método | Rota | Resposta |
|---|---|---|
| POST | `/reservas` | 201; 409 se houver conflito; 400 se fim ≤ início |
| GET | `/reservas?salaId=&alunoId=` | 200 com a lista |
| GET | `/reservas/:id` | 200, ou 404 |
| PUT | `/reservas/:id` | 200 (muda o horário e confere o conflito de novo) |
| DELETE | `/reservas/:id` | 200 (cancela: `estado = CANCELADA`) |
| GET | `/eventos/reserva-confirmada/exemplo` | 200 com um evento de exemplo (tag **Eventos** no Swagger) |
| GET | `/health` | 200 `{ "status": "ok" }` |

Campos da reserva: `id`, `salaId`, `alunoId`, `universidadeId`, `inicio`, `fim`,
`estado` (CONFIRMADA ou CANCELADA). Datas em ISO 8601 (UTC).

## Tecnologias

Node 22, TypeScript, NestJS, TypeORM, Azure SQL Database, Azure Storage Queue, Swagger, Jest,
Docker, Azure Container Apps.

## Como rodar

**Local**

1. Copie `.env.example` para `.env` e preencha (senha do SQL e string da Storage).
2. `npm ci`
3. `npm run start:dev`
4. Abra http://localhost:3002/docs

**Testes:** `npm test` (unitários + arquitetura, não precisam de banco).

**Docker**

```bash
docker build --platform linux/amd64 -t joaovmb/pjbl-ms-reservas:v1 .
docker run --rm -p 3002:3000 --env-file .env joaovmb/pjbl-ms-reservas:v1
```

**Nuvem**

- Swagger: https://URL-DO-SERVICO/docs
- Imagem: `docker pull joaovmb/pjbl-ms-reservas:v1`

## Equipe

João Vitor de Moraes Bringmann, Leonardo Grattão, Eduardo Monteiro, Nicolas Lobo
