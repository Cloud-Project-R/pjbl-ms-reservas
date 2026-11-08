import { ErroNaoEncontrado } from '../../domain/erros';
import { ReservaRepositoryEmMemoria } from '../../../test/fakes/reserva.repository.em-memoria';
import { BuscarReservaUseCase } from './buscar-reserva.use-case';

describe('Buscar reserva', () => {
  it('avisa quando a reserva não existe', async () => {
    await expect(new BuscarReservaUseCase(new ReservaRepositoryEmMemoria()).executar('999')).rejects.toThrow(
      ErroNaoEncontrado,
    );
  });
});
