import {REF_OP, AND_OP, OR_OP, NOT_OP, EQ_OP, LIKE_OP, LT_OP, LTE_OP, GT_OP, GTE_OP, NEQ_OP, IN_OP, CONTAINS_OP} from "@ts-awesome/simple-query";

interface ITokenizer {
  readonly current: string;
  readonly eol: boolean;
  readonly index: number;

  match(match: string): boolean;

  test(match: RegExp): boolean;

  consume(check: ((c: string) => boolean)): string;

  since(start: number): string;

  next(): void;

  error(msg: string): Error;
}

const Digit = /^[0-9]$/;

export function tokenizer(input: string): ITokenizer {
  let index = 0;

  return {
    get current() {
      return input[index];
    },
    get eol() {
      return index >= input.length;
    },
    get index() {
      return index;
    },
    match(match: string) {
      return input.substr(index, match.length) === match;
    },
    test(match: RegExp): boolean {
      return match.test(input[index]);
    },
    consume(check: ((c: string) => boolean)): string {
      const start = index;
      while (index < input.length && check(input[index])) {
        index++;
      }

      return input.substring(start, index);
    },
    since(start: number): string {
      return input.substring(start, index);
    },
    next(): string {
      return input[++index];
    },
    error(msg: string): Error {
      return new Error(`@${index} ("${input.substring(index, Math.min(index + 10, input.length))}..."): ${msg}`);
    }
  }
}

export function space(x: string): boolean {
  return /^\s+$/.test(x);
}

export function isNull(tokenizer: ITokenizer): boolean {
  return tokenizer.match('NULL');
}

export function parseNull(tokenizer: ITokenizer): null {
  if (tokenizer.match('NULL')) {
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    return null;
  }

  throw tokenizer.error('NULL expected.');
}

function isIdentifier(tokenizer: ITokenizer): boolean {
  return tokenizer.test(/^[a-z_`]$/i);
}

export function parseIdentifier(tokenizer: ITokenizer): string {
  if (!isIdentifier(tokenizer)) {
    throw tokenizer.error('Identifier expected to start with letter or underscore');
  }

  if (tokenizer.match('`')) {
    tokenizer.next();
    const identifier = tokenizer.consume(x => !/^`$/.test(x));
    if (!tokenizer.match('`')) {
      throw tokenizer.error('Identifier expected to end with "`".');
    }
    tokenizer.next();
    return identifier
  }

  return tokenizer.consume(x => /^[a-z0-9_]$/i.test(x));
}

function isString(tokenizer: ITokenizer): boolean {
  return tokenizer.match('"') || tokenizer.match("'");
}

export function parseString(tokenizer: ITokenizer): string {
  if (!isString(tokenizer)) {
    throw tokenizer.error('String expected to start with ".');
  }
  const start = tokenizer.index;
  const quote = tokenizer.current;
  tokenizer.next();
  while (!tokenizer.match(quote)) {
    if (tokenizer.match("\\")) {
      tokenizer.next();
    }
    tokenizer.next();
  }

  tokenizer.next();
  let str = tokenizer.since(start);
  if (quote === "'") {
    str = str
      .replace(/"/g, '\\"')
      .replace(/\\'/g, "'");
    str = '"' + str.substring(1, str.length - 1) + '"';
  }
  return JSON.parse(str);
}

function isBoolean(tokenizer: ITokenizer): boolean {
  return tokenizer.match('true') || tokenizer.match('false');
}

export function parseBoolean(tokenizer: ITokenizer): boolean {
  if (tokenizer.match('true')) {
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    return true;
  }

  if (tokenizer.match('false')) {
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    tokenizer.next();
    return false;
  }

  throw tokenizer.error('Boolean expected (true or false).');
}

function isNumber(tokenizer: ITokenizer): boolean {
  return tokenizer.test(/^[0-9\-+]$/);
}

export function parseNumber(tokenizer: ITokenizer): number {
  if (!isNumber(tokenizer)) {
    throw tokenizer.error('Number expected to start with digit');
  }

  if (tokenizer.match('0x')) {
    tokenizer.next();
    tokenizer.next();
    return parseInt(tokenizer.consume(x => /^[0-9a-f]$/.test(x)), 16);
  }
  if (tokenizer.match('0o')) {
    tokenizer.next();
    tokenizer.next();
    return parseInt(tokenizer.consume(x => /^[0-7]$/.test(x)), 8);
  }
  if (tokenizer.match('0b')) {
    tokenizer.next();
    tokenizer.next();
    return parseInt(tokenizer.consume(x => /^[0-1]$/.test(x)), 2);
  }

  let start = tokenizer.index;
  if (tokenizer.test(/^[+-]$/)) {
    tokenizer.next();
  }

  while (tokenizer.test(Digit)) {
    tokenizer.next();
  }

  if (tokenizer.match('.')) {
    tokenizer.next();
    while (tokenizer.test(Digit)) {
      tokenizer.next();
    }
  }

  const value = parseFloat(tokenizer.since(start));

  if (!tokenizer.match('e')) {
    return value;
  }

  tokenizer.next();

  let sign = 1;
  if (tokenizer.match('-') || tokenizer.match('+')) {
    sign = tokenizer.match('-') ? -1 : 1;
    tokenizer.next();
  }

  start = tokenizer.index;
  while (tokenizer.test(Digit)) {
    tokenizer.next();
  }

  const pow = parseFloat(tokenizer.since(start));

  return value * Math.pow(10, pow * sign);
}

function isArray(tokenizer: ITokenizer) {
  return tokenizer.match('[');
}

export function parseArray(tokenizer: ITokenizer): unknown[] {
  if (!isArray(tokenizer)) {
    throw tokenizer.error('Array expected to start with [.');
  }

  const result: unknown[] = [];
  tokenizer.next();
  tokenizer.consume(space);
  while (!tokenizer.match(']')) {
    if (isNumber(tokenizer)){
      result.push(parseNumber(tokenizer));
    } else if (isString(tokenizer)) {
      result.push(parseString(tokenizer));
    } else {
      throw tokenizer.error('Array expectes number or string literals');
    }

    tokenizer.consume(space);
    if (tokenizer.match(',')) {
      tokenizer.next();
      tokenizer.consume(space);
    }
  }

  tokenizer.next();

  return result;
}

function isOperator(tokenizer: ITokenizer) {
  return tokenizer.match('=')
    || tokenizer.match('!=')
    || tokenizer.match('>')
    || tokenizer.match('>=')
    || tokenizer.match('<')
    || tokenizer.match('<=')
    || tokenizer.match('~')
    || tokenizer.match('^')
}

function parseOperator(tokenizer: ITokenizer): string {
  if (tokenizer.match('=')) {
    tokenizer.next();
    return EQ_OP;
  }
  if (tokenizer.match('!=')) {
    tokenizer.next();
    tokenizer.next();
    return NEQ_OP;
  }
  if (tokenizer.match('>=')) {
    tokenizer.next();
    tokenizer.next();
    return GTE_OP;
  }
  if (tokenizer.match('>')) {
    tokenizer.next();
    return GT_OP;
  }
  if (tokenizer.match('<=')) {
    tokenizer.next();
    tokenizer.next();
    return LTE_OP;
  }
  if (tokenizer.match('<')) {
    tokenizer.next();
    return LT_OP;
  }
  if (tokenizer.match('~')) {
    tokenizer.next();
    return LIKE_OP;
  }
  if (tokenizer.match('^')) {
    tokenizer.next();
    return "$in_has";
  }
  throw tokenizer.error('Operator expected.');
}

export function parseOperation(tokenizer: ITokenizer): unknown {
  tokenizer.consume(space);
  if (tokenizer.match('!')) {
    return parseUnary(tokenizer);
  }

  if (isNumber(tokenizer) || isString(tokenizer)) {
    // 2 ^ a case
    const left = isNumber(tokenizer) ? parseNumber(tokenizer) : parseString(tokenizer);
    tokenizer.consume(space);
    const op = parseOperator(tokenizer);
    if (op !== '$in_has') {
      throw tokenizer.error('Right operand expected to be boolean, number, string or identifier');
    }
    tokenizer.consume(space);

    if (!isIdentifier(tokenizer)) {
      throw tokenizer.error('Right operand expected to be identifier');
    }

    const right = parseIdentifier(tokenizer);
    return {
      [CONTAINS_OP]: {
        [right]: left
      }
    };
  }

  if (!isIdentifier(tokenizer)) {
    throw tokenizer.error('Identifier is expected as left operand');
  }

  const left = parseIdentifier(tokenizer);
  tokenizer.consume(space);
  if (!isOperator(tokenizer)) {
    return {
      [left]: true
    }
  }
  const op = parseOperator(tokenizer);
  tokenizer.consume(space);

  if (op === '$in_has') {
    // a ^ [1,2,3] case
    if (!isIdentifier(tokenizer) && !isArray(tokenizer)) {
      throw tokenizer.error('Right operand expected to be identifier or array');
    }
    const right = isIdentifier(tokenizer) ? {[REF_OP]: parseIdentifier(tokenizer)} : parseArray(tokenizer);
    return {
      [IN_OP]: {
        [left]: right
      }
    }
  }

  let right: unknown = null;
  if (isNull(tokenizer)) {
    right = parseNull(tokenizer)
  } else if (isBoolean(tokenizer)) {
    right = parseBoolean(tokenizer)
  } else if (isNumber(tokenizer)) {
    right = parseNumber(tokenizer);
  } else if (isString(tokenizer)) {
    right = parseString(tokenizer);
  } else if (isIdentifier(tokenizer)) {
    right = {[REF_OP]: parseIdentifier(tokenizer)};
  } else {
    throw tokenizer.error('Right operand expected to be boolean, number, string, NULL or identifier');
  }

  if (op === EQ_OP) {
    return {
      [left]: right
    }
  }

  return {
    [op]: {
      [left]: right
    }
  };
}

function parseUnary(tokenizer: ITokenizer) {
  if (!tokenizer.match('!')) {
    throw tokenizer.error('Unary operator expected');
  }
  tokenizer.next();
  tokenizer.consume(space);

  if (isIdentifier(tokenizer)) {
    return {
      [parseIdentifier(tokenizer)]: false
    }
  }

  if (tokenizer.match('(')) {
    return {
      [NOT_OP]: parseExpression(tokenizer)
    }
  }

  throw tokenizer.error('Unrecognized use of !');
}

function isLogicOperator(tokenizer: ITokenizer): boolean {
  return tokenizer.match('&&') || tokenizer.match('||');
}

function parseLogicOperator(tokenizer: ITokenizer): string {
  if (tokenizer.match('&&')) {
    tokenizer.next();
    tokenizer.next();
    return AND_OP;
  }

  if (tokenizer.match('||')) {
    tokenizer.next();
    tokenizer.next();
    return OR_OP;
  }

  throw tokenizer.error('Unknown logic operator');
}

export function parseExpression(tokenizer: ITokenizer): unknown {
  const operands: any[] = [];
  const expectsClosing = tokenizer.match('(');
  if (expectsClosing) {
    tokenizer.next();
    tokenizer.consume(space);
    operands.push(parseExpression(tokenizer));
    tokenizer.consume(space);
    if (tokenizer.eol || tokenizer.match(')')) {
      tokenizer.next();
      return operands[0];
    }
  } else {
    operands.push(parseOperation(tokenizer));
    tokenizer.consume(space);
    if (tokenizer.eol || tokenizer.match(')')) {
      return operands[0];
    }
  }

  if (!isLogicOperator(tokenizer)) {
    throw tokenizer.error('Unexpected operator.');
  }

  const op = parseLogicOperator(tokenizer);
  tokenizer.consume(space);
  while (!tokenizer.eol && !tokenizer.match(')')) {
    const isNested = tokenizer.match('(');

    const right: any = parseExpression(tokenizer);

    if (!isNested && ((op === AND_OP && right[OR_OP]) || (op === OR_OP && right[AND_OP]))) {
      throw tokenizer.error('Expected same logic operator. Please use () for grouping');
    }

    if (!isNested && right[op]) {
      operands.push(...right[op]);
    } else {
      operands.push(right);
    }

    tokenizer.consume(space);

    if (isLogicOperator(tokenizer)) {
      const nextOp = parseLogicOperator(tokenizer);
      if (nextOp != op) {
        throw tokenizer.error('Expected same logic operator. Please use () for grouping');
      }
      tokenizer.consume(space);
    }
  }

  if (expectsClosing) {
    if (!tokenizer.match(')')) {
      throw tokenizer.error('Expected closing bracket');
    }
    tokenizer.next();
  }

  return {
    [op]: operands
  }
}
