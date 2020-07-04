const {parseExpression, tokenizer} = require('../dist/tokenizer');
const {NOT_OP, LIKE_OP, AND_OP, OR_OP} = require('@viatsyshyn/ts-simple-query');

describe('expression parser', () => {

  it('not', async () => {
    // has to be in root parentheses
    const expr = '(!(a~"1"))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [NOT_OP]: {
        [LIKE_OP]: {
          a: '1'
        }
      }
    });
  });

  it('binary AND', async () => {
    // has to be in root parentheses
    const expr = '((a ~ "1") && (b = 2))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [AND_OP]: [
        {[LIKE_OP]: {
          a: '1'
        }},
        {b: 2}
      ]
    });
  });

  it('multiple AND', async () => {
    // has to be in root parentheses
    const expr = '((a ~ "1") && (b = 2) && c && (d = 3))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [AND_OP]: [
        {[LIKE_OP]: {
          a: '1'
        }},
        {b: 2},
        {c: true},
        {d: 3},
      ]
    });
  });

  it('binary OR', async () => {
    // has to be in root parentheses
    const expr = '((a ~ "1") || (b = 2))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [OR_OP]: [
        {[LIKE_OP]: {
          a: '1'
        }},
        {b: 2}
      ]
    });
  });

  it('multiple AND', async () => {
    // has to be in root parentheses
    const expr = '((a ~ "1") || (b = 2) || !c || (d = 3))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [OR_OP]: [
        {[LIKE_OP]: {
          a: '1'
        }},
        {b: 2},
        {c: false},
        {d: 3},
      ]
    });
  });

  it('multiple AND OR', async () => {
    // has to be in root parentheses
    const expr = '((a ~ "1") || ((b = 2) && !c) || (d = 3))';
    expect(parseExpression(tokenizer(expr))).toStrictEqual({
      [OR_OP]: [
        {[LIKE_OP]: {
          a: '1'
        }},
        {[AND_OP]: [
          {b: 2},
          {c: false},
        ]},
        {d: 3},
      ]
    });
  });
});
