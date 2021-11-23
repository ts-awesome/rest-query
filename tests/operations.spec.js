const {parseOperation, tokenizer} = require('../dist/tokenizer');
const {NEQ_OP, GTE_OP, GT_OP, LT_OP, LTE_OP, LIKE_OP, REF_OP, IN_OP, CONTAINS_OP} = require("@ts-awesome/simple-query");

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

  it('like', async () => {
    expect(parseOperation(tokenizer('a~"1"'))).toStrictEqual({[LIKE_OP]: {a: '1'}});
    expect(parseOperation(tokenizer('a~b'))).toStrictEqual({[LIKE_OP]: {a: {[REF_OP]: 'b'}}});
  });

  it('in', async () => {
    expect(parseOperation(tokenizer('a^[1]'))).toStrictEqual({[IN_OP]: {a: [1]}});
    expect(parseOperation(tokenizer('a^["1", 2]'))).toStrictEqual({[IN_OP]: {a: ["1", 2]}});
  });

  it('contains', async () => {
    expect(parseOperation(tokenizer('1 ^ a'))).toStrictEqual({[CONTAINS_OP]: {a: 1}});
    expect(parseOperation(tokenizer('"1" ^ a'))).toStrictEqual({[CONTAINS_OP]: {a: "1"}});
  });
});
