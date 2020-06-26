const {parseNumber, tokenizer} = require('../dist/tokenizer');

describe('number parser', () => {

  it('integer', async () => {
    expect(parseNumber(tokenizer('1'))).toBe(1);
    expect(parseNumber(tokenizer('10'))).toBe(10);
    expect(parseNumber(tokenizer('100'))).toBe(100);
    expect(parseNumber(tokenizer('12345'))).toBe(12345);
  });

  it('negative integer', async () => {
    expect(parseNumber(tokenizer('-1'))).toBe(-1);
    expect(parseNumber(tokenizer('-10'))).toBe(-10);
    expect(parseNumber(tokenizer('-100'))).toBe(-100);
    expect(parseNumber(tokenizer('-12345'))).toBe(-12345);
  });

  it('positive integer', async () => {
    expect(parseNumber(tokenizer('+1'))).toBe(+1);
    expect(parseNumber(tokenizer('+10'))).toBe(+10);
    expect(parseNumber(tokenizer('+100'))).toBe(+100);
    expect(parseNumber(tokenizer('+12345'))).toBe(+12345);
  });

  it('float', async () => {
    expect(parseNumber(tokenizer('1.0'))).toBe(1);
    expect(parseNumber(tokenizer('10.01'))).toBe(10.01);
    expect(parseNumber(tokenizer('100.001'))).toBe(100.001);
    expect(parseNumber(tokenizer('12.345'))).toBe(12.345);
  });

  it('float negative', async () => {
    expect(parseNumber(tokenizer('-1.0'))).toBe(-1);
    expect(parseNumber(tokenizer('-10.01'))).toBe(-10.01);
    expect(parseNumber(tokenizer('-100.001'))).toBe(-100.001);
    expect(parseNumber(tokenizer('-12.345'))).toBe(-12.345);
  });

  it('float positive', async () => {
    expect(parseNumber(tokenizer('+1.0'))).toBe(1);
    expect(parseNumber(tokenizer('+10.01'))).toBe(10.01);
    expect(parseNumber(tokenizer('+100.001'))).toBe(100.001);
    expect(parseNumber(tokenizer('+12.345'))).toBe(12.345);
  });

  it('hex', async () => {
    expect(parseNumber(tokenizer('0x1'))).toBe(1);
    expect(parseNumber(tokenizer('0xff'))).toBe(0xff);
    expect(parseNumber(tokenizer('0xffff'))).toBe(0xffff);
  });

  it('oct', async () => {
    expect(parseNumber(tokenizer('0o1'))).toBe(1);
    expect(parseNumber(tokenizer('0o77'))).toBe(0o77);
    expect(parseNumber(tokenizer('0o7777'))).toBe(0o7777);
  });

  it('bin', async () => {
    expect(parseNumber(tokenizer('0b1'))).toBe(1);
    expect(parseNumber(tokenizer('0b11'))).toBe(0b11);
    expect(parseNumber(tokenizer('0b1111'))).toBe(0b1111);
  });

  it('exp', async () => {
    expect(parseNumber(tokenizer('1e0'))).toBe(1);
    expect(parseNumber(tokenizer('1e+1'))).toBe(10);
    expect(parseNumber(tokenizer('1e-1'))).toBe(.1);
    expect(parseNumber(tokenizer('123.34e+2'))).toBe(12334);
    expect(parseNumber(tokenizer('-123.34e-2'))).toBe(-1.2334);
  });
});
