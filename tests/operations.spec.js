const {parseOperation, tokenizer, NEQ_OP, GTE_OP, GT_OP, LT_OP, LTE_OP, REGEX_OP, REF_OP} = require('../dist/tokenizer');

describe('operation parser', () => {

  it('unary not', async () => {
    expect(parseOperation(tokenizer('!a'))).toStrictEqual({a: false});
  });

  it('unary true', async () => {
    expect(parseOperation(tokenizer('a'))).toStrictEqual({a: true});
  });

  it('equal', async () => {
    expect(parseOperation(tokenizer('a=1'))).toStrictEqual({a: 1});
    expect(parseOperation(tokenizer('a="1"'))).toStrictEqual({a: '1'});
    expect(parseOperation(tokenizer('a=true'))).toStrictEqual({a: true});
    expect(parseOperation(tokenizer('a=b'))).toStrictEqual({a: {[REF_OP]: 'b'}});
  });

  it('not equal', async () => {
    expect(parseOperation(tokenizer('a!=1'))).toStrictEqual({[NEQ_OP]: {a: 1}});
    expect(parseOperation(tokenizer('a!="1"'))).toStrictEqual({[NEQ_OP]: {a: '1'}});
    expect(parseOperation(tokenizer('a!=true'))).toStrictEqual({[NEQ_OP]: {a: true}});
    expect(parseOperation(tokenizer('a!=b'))).toStrictEqual({[NEQ_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('greater', async () => {
    expect(parseOperation(tokenizer('a>1'))).toStrictEqual({[GT_OP]: {a: 1}});
    expect(parseOperation(tokenizer('a>b'))).toStrictEqual({[GT_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('greater equal', async () => {
    expect(parseOperation(tokenizer('a>=1'))).toStrictEqual({[GTE_OP]: {a: 1}});
    expect(parseOperation(tokenizer('a>=b'))).toStrictEqual({[GTE_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('less', async () => {
    expect(parseOperation(tokenizer('a<1'))).toStrictEqual({[LT_OP]: {a: 1}});
    expect(parseOperation(tokenizer('a<b'))).toStrictEqual({[LT_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('less equal', async () => {
    expect(parseOperation(tokenizer('a<=1'))).toStrictEqual({[LTE_OP]: {a: 1}});
    expect(parseOperation(tokenizer('a<=b'))).toStrictEqual({[LTE_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('regex', async () => {
    expect(parseOperation(tokenizer('a~"1"'))).toStrictEqual({[REGEX_OP]: {a: '1'}});
    expect(parseOperation(tokenizer('a~b'))).toStrictEqual({[REGEX_OP]: {a: {[REF_OP]: 'b'}}});
  });
});
