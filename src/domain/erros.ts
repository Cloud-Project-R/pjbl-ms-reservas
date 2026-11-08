// Erros do negócio.
// Eles não sabem nada de HTTP: quem transforma em 400, 404 ou 409 é a camada API.

/** Os dados enviados quebram alguma regra do negócio (vira HTTP 400). */
export class ErroDeValidacao extends Error {}

/** O item procurado não existe (vira HTTP 404). */
export class ErroNaoEncontrado extends Error {}

/** Já existe uma reserva confirmada nesse horário (vira HTTP 409 Conflict). */
export class ErroDeConflito extends Error {}
