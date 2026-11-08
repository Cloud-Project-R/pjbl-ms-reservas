import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { ErroDeConflito, ErroDeValidacao, ErroNaoEncontrado } from '../domain/erros';

/**
 * Traduz os erros do negócio para respostas HTTP:
 *  - ErroDeValidacao   -> 400 Bad Request
 *  - ErroNaoEncontrado -> 404 Not Found
 *  - ErroDeConflito    -> 409 Conflict
 */
@Catch(ErroDeValidacao, ErroNaoEncontrado, ErroDeConflito)
export class ErrosDoDominioFilter implements ExceptionFilter {
  catch(erro: Error, host: ArgumentsHost) {
    let status = 400;
    if (erro instanceof ErroNaoEncontrado) status = 404;
    if (erro instanceof ErroDeConflito) status = 409;

    const resposta = host.switchToHttp().getResponse();
    resposta.status(status).json({ statusCode: status, message: erro.message });
  }
}
