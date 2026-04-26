import { DisplayDatePipe } from './display-date.pipe';

describe('DisplayDatePipe', () => {
  let pipe: DisplayDatePipe;

  beforeEach(() => {
    pipe = new DisplayDatePipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return em-dash for null', () => {
    expect(pipe.transform(null)).toBe('—');
  });

  it('should return em-dash for undefined', () => {
    expect(pipe.transform(undefined)).toBe('—');
  });

  it('should return em-dash for empty string', () => {
    expect(pipe.transform('')).toBe('—');
  });

  it('should format a valid ISO date string', () => {
    const result = pipe.transform('2026-04-24T00:00:00.000Z');
    expect(result).toMatch(/\d{1,2} \w{3} \d{4}, \d{2}:\d{2}/);
  });

  it('should format a Date object', () => {
    const result = pipe.transform(new Date('2026-04-24T00:00:00.000Z'));
    expect(result).toMatch(/\d{1,2} \w{3} \d{4}, \d{2}:\d{2}/);
  });
});
