const {parseArray, tokenizer} = require('../dist/tokenizer');

describe('array parser', () => {

  it('integer', async () => {
    expect(parseArray(tokenizer('[1]'))).toStrictEqual([1]);
    expect(parseArray(tokenizer('[ 10, 11]'))).toStrictEqual([10, 11]);
    expect(parseArray(tokenizer('[ 100 , 123 ]'))).toStrictEqual([100, 123]);
    expect(parseArray(tokenizer('[12345]'))).toStrictEqual([12345]);
  });

  it('negative integer', async () => {
    expect(parseArray(tokenizer('[-1]'))).toStrictEqual([-1]);
    expect(parseArray(tokenizer('[-10, -11]'))).toStrictEqual([-10, -11]);
    expect(parseArray(tokenizer('[-100, -123]'))).toStrictEqual([-100, -123]);
    expect(parseArray(tokenizer('[-12345]'))).toStrictEqual([-12345]);
  });

  it('string', async () => {
    expect(parseArray(tokenizer('["-1"]'))).toStrictEqual(["-1"]);
    expect(parseArray(tokenizer('["-10", "-11"]'))).toStrictEqual(["-10", "-11"]);
    expect(parseArray(tokenizer('[ "-100" , "-123" ]'))).toStrictEqual(["-100", "-123"]);
    expect(parseArray(tokenizer('["asdasdad [],"]'))).toStrictEqual(["asdasdad [],"]);
  })

  it('mixed', async () => {
    expect(parseArray(tokenizer('["-1", 1]'))).toStrictEqual(["-1", 1]);
  })
});
