import { ErroDeConflito, ErroDeValidacao } from '../../domain/erros';
import { PublicadorFalso } from '../../../test/fakes/publicador.falso';
import { ReservaRepositoryEmMemoria } from '../../../test/fakes/reserva.repository.em-memoria';
import { CriarReservaUseCase } from './criar-reserva.use-case';

/** Atalho para montar os dados de uma reserva no dia 10/11 em um horário (UTC). */
const pedido = (inicio: string, fim: string, salaId = 's1') => ({
  salaId,
  alunoId: 'A-10',
  universidadeId: 'UNI-001',
  inicio: `2026-11-10T${inicio}:00Z`,
  fim: `2026-11-10T${fim}:00Z`,
});

describe('Criar reserva', () => {
  let repositorio: ReservaRepositoryEmMemoria;
  let publicador: PublicadorFalso;
  let criarReserva: CriarReservaUseCase;

  beforeEach(() => {
    repositorio = new ReservaRepositoryEmMemoria();
    publicador = new PublicadorFalso();
    criarReserva = new CriarReservaUseCase(repositorio, publicador);
  });

  it('cria uma reserva CONFIRMADA e publica o evento ReservaConfirmada', async () => {
    const reserva = await criarReserva.executar(pedido('13:00', '14:00'));

    expect(reserva.id).toBeDefined();
    expect(reserva.estado).toBe('CONFIRMADA');
    expect(publicador.eventos).toHaveLength(1);
    expect(publicador.eventos[0].type).toBe('ReservaConfirmada');
    expect(publicador.eventos[0].data.reservaId).toBe(reserva.id);
  });

  it('rejeita horário sobreposto na mesma sala (409)', async () => {
    await criarReserva.executar(pedido('13:00', '14:00'));

    await expect(criarReserva.executar(pedido('13:30', '15:00'))).rejects.toThrow(ErroDeConflito);
    expect(repositorio.reservas).toHaveLength(1);
  });

  it('permite horário que só encosta (14h-15h depois de 13h-14h)', async () => {
    await criarReserva.executar(pedido('13:00', '14:00'));

    await expect(criarReserva.executar(pedido('14:00', '15:00'))).resolves.toBeDefined();
  });

  it('permite o mesmo horário em outra sala', async () => {
    await criarReserva.executar(pedido('13:00', '14:00', 's1'));

    await expect(criarReserva.executar(pedido('13:00', '14:00', 's2'))).resolves.toBeDefined();
  });

  it('ignora reservas canceladas ao verificar conflito', async () => {
    const primeira = await criarReserva.executar(pedido('13:00', '14:00'));
    await repositorio.atualizar(primeira.id!, { ...primeira, estado: 'CANCELADA' });

    await expect(criarReserva.executar(pedido('13:00', '14:00'))).resolves.toBeDefined();
  });

  it('rejeita fim antes do início (400)', async () => {
    await expect(criarReserva.executar(pedido('15:00', '14:00'))).rejects.toThrow(ErroDeValidacao);
  });

  it('rejeita fim igual ao início (400)', async () => {
    await expect(criarReserva.executar(pedido('14:00', '14:00'))).rejects.toThrow(ErroDeValidacao);
  });

  it('mantém a reserva mesmo se a fila estiver fora do ar', async () => {
    publicador.deveFalhar = true;
    jest.spyOn(console, 'error').mockImplementation(() => undefined);

    const reserva = await criarReserva.executar(pedido('13:00', '14:00'));

    expect(reserva.id).toBeDefined();
    expect(repositorio.reservas).toHaveLength(1);
  });
});
