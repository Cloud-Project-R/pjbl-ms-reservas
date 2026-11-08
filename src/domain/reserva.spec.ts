import { horariosSeSobrepoem } from './reserva';

const horario = (inicio: string, fim: string) => ({
  inicio: new Date(`2026-11-10T${inicio}:00Z`),
  fim: new Date(`2026-11-10T${fim}:00Z`),
});

describe('Regra de sobreposição de horários', () => {
  it('13h-14h e 13h30-15h se sobrepõem', () => {
    expect(horariosSeSobrepoem(horario('13:00', '14:00'), horario('13:30', '15:00'))).toBe(true);
  });

  it('um horário dentro do outro se sobrepõe', () => {
    expect(horariosSeSobrepoem(horario('13:00', '17:00'), horario('14:00', '15:00'))).toBe(true);
  });

  it('13h-14h e 14h-15h só encostam, não se sobrepõem', () => {
    expect(horariosSeSobrepoem(horario('13:00', '14:00'), horario('14:00', '15:00'))).toBe(false);
  });

  it('horários separados não se sobrepõem', () => {
    expect(horariosSeSobrepoem(horario('08:00', '09:00'), horario('10:00', '11:00'))).toBe(false);
  });
});
