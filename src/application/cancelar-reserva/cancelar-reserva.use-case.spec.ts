import { ErroNaoEncontrado } from '../../domain/erros';
import { ReservaRepositoryEmMemoria } from '../../../test/fakes/reserva.repository.em-memoria';
import { CancelarReservaUseCase } from './cancelar-reserva.use-case';

describe('Cancelar reserva', () => {
  it('muda o estado para CANCELADA sem apagar', async () => {
    const repositorio = new ReservaRepositoryEmMemoria();
    const salva = await repositorio.salvar({
      salaId: 's1',
      alunoId: 'A-10',
      universidadeId: 'UNI-001',
      inicio: new Date('2026-11-10T13:00:00Z'),
      fim: new Date('2026-11-10T14:00:00Z'),
      estado: 'CONFIRMADA',
    });

    const cancelada = await new CancelarReservaUseCase(repositorio).executar(salva.id!);

    expect(cancelada.estado).toBe('CANCELADA');
    expect(repositorio.reservas).toHaveLength(1);
  });

  it('avisa quando a reserva não existe', async () => {
    await expect(new CancelarReservaUseCase(new ReservaRepositoryEmMemoria()).executar('999')).rejects.toThrow(
      ErroNaoEncontrado,
    );
  });
});
