import { Reserva } from '../../domain/reserva';
import { ReservaRepositoryEmMemoria } from '../../../test/fakes/reserva.repository.em-memoria';
import { ListarReservasUseCase } from './listar-reservas.use-case';

const reserva = (salaId: string, alunoId: string): Reserva => ({
  salaId,
  alunoId,
  universidadeId: 'UNI-001',
  inicio: new Date('2026-11-10T13:00:00Z'),
  fim: new Date('2026-11-10T14:00:00Z'),
  estado: 'CONFIRMADA',
});

describe('Listar reservas', () => {
  it('filtra por sala e por aluno', async () => {
    const repositorio = new ReservaRepositoryEmMemoria();
    await repositorio.salvar(reserva('s1', 'A-10'));
    await repositorio.salvar(reserva('s1', 'A-20'));
    await repositorio.salvar(reserva('s2', 'A-10'));
    const listarReservas = new ListarReservasUseCase(repositorio);

    expect(await listarReservas.executar({ salaId: 's1' })).toHaveLength(2);
    expect(await listarReservas.executar({ alunoId: 'A-10' })).toHaveLength(2);
    expect(await listarReservas.executar({ salaId: 's1', alunoId: 'A-10' })).toHaveLength(1);
    expect(await listarReservas.executar({})).toHaveLength(3);
  });
});
