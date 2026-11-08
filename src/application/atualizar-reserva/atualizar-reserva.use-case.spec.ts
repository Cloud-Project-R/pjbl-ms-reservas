import { ErroDeConflito, ErroDeValidacao, ErroNaoEncontrado } from '../../domain/erros';
import { Reserva } from '../../domain/reserva';
import { ReservaRepositoryEmMemoria } from '../../../test/fakes/reserva.repository.em-memoria';
import { AtualizarReservaUseCase } from './atualizar-reserva.use-case';

const reserva = (inicio: string, fim: string): Reserva => ({
  salaId: 's1',
  alunoId: 'A-10',
  universidadeId: 'UNI-001',
  inicio: new Date(`2026-11-10T${inicio}:00Z`),
  fim: new Date(`2026-11-10T${fim}:00Z`),
  estado: 'CONFIRMADA',
});

const horario = (inicio: string, fim: string) => ({
  inicio: `2026-11-10T${inicio}:00Z`,
  fim: `2026-11-10T${fim}:00Z`,
});

describe('Atualizar reserva (mudar horário)', () => {
  let repositorio: ReservaRepositoryEmMemoria;
  let atualizarReserva: AtualizarReservaUseCase;

  beforeEach(() => {
    repositorio = new ReservaRepositoryEmMemoria();
    atualizarReserva = new AtualizarReservaUseCase(repositorio);
  });

  it('muda o horário quando não há conflito', async () => {
    const salva = await repositorio.salvar(reserva('13:00', '14:00'));

    const atualizada = await atualizarReserva.executar(salva.id!, horario('16:00', '17:00'));

    expect(atualizada.inicio.toISOString()).toBe('2026-11-10T16:00:00.000Z');
  });

  it('não conflita com ela mesma (estender 13h-14h para 13h-15h)', async () => {
    const salva = await repositorio.salvar(reserva('13:00', '14:00'));

    await expect(atualizarReserva.executar(salva.id!, horario('13:00', '15:00'))).resolves.toBeDefined();
  });

  it('rejeita novo horário que bate com outra reserva (409)', async () => {
    await repositorio.salvar(reserva('15:00', '16:00'));
    const minha = await repositorio.salvar(reserva('13:00', '14:00'));

    await expect(atualizarReserva.executar(minha.id!, horario('15:30', '16:30'))).rejects.toThrow(ErroDeConflito);
  });

  it('rejeita mudar o horário de uma reserva cancelada', async () => {
    const salva = await repositorio.salvar({ ...reserva('13:00', '14:00'), estado: 'CANCELADA' });

    await expect(atualizarReserva.executar(salva.id!, horario('16:00', '17:00'))).rejects.toThrow(ErroDeValidacao);
  });

  it('avisa quando a reserva não existe', async () => {
    await expect(atualizarReserva.executar('999', horario('16:00', '17:00'))).rejects.toThrow(ErroNaoEncontrado);
  });
});
