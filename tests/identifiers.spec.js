const {parseIdentifier, tokenizer} = require('../dist/tokenizer');

describe('identifier parser', () => {

  it('simple', async () => {
    expect(parseIdentifier(tokenizer('a'))).toBe('a');
    expect(parseIdentifier(tokenizer('aaaa'))).toBe('aaaa');
    expect(parseIdentifier(tokenizer('SomeVar_'))).toBe('SomeVar_');
  });

  it('complex', async () => {
    expect(parseIdentifier(tokenizer('`a`'))).toBe('a');
    expect(parseIdentifier(tokenizer('`_.a.b.[]`'))).toBe('_.a.b.[]');
    expect(parseIdentifier(tokenizer('`Material:ZI_TI`'))).toBe('Material:ZI_TI');
  });
});
