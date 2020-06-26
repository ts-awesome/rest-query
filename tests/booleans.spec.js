const {parseBoolean, tokenizer} = require('../dist/tokenizer');

describe('boolean parser', () => {

  it('true', async () => {
    const value = true;
    expect(parseBoolean(tokenizer(JSON.stringify(value)))).toBe(value);
  });

  it('false', async () => {
    const value = false;
    expect(parseBoolean(tokenizer(JSON.stringify(value)))).toBe(value);
  });
});
