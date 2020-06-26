const {parseString, tokenizer} = require('../dist/tokenizer');

describe('string parser', () => {

  it('string', async () => {
    const value = '123456';
    expect(parseString(tokenizer(JSON.stringify(value)))).toBe(value);
  });

  it('string escape', async () => {
    const value = '123456"!@#$%^*()-=""""\\\\';
    expect(parseString(tokenizer(JSON.stringify(value)))).toBe(value);
  });
});
