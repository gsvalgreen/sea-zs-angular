import { paraIsoComOffset } from './DataEnvio';

describe('paraIsoComOffset', () => {
  it('converte data simples para offset -03:00 com dois pontos', () => {
    expect(paraIsoComOffset('2026-03-10')).toBe('2026-03-10T00:00:00-03:00');
  });
  it('mantem outros valores', () => {
    expect(paraIsoComOffset('2026-03-10T10:00:00-03:00')).toBe('2026-03-10T10:00:00-03:00');
    expect(paraIsoComOffset(undefined)).toBeUndefined();
  });
});
