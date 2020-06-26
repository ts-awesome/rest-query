import {parseExpression, tokenizer, space, parseIdentifier} from "./tokenizer";

import {ISimpleQuery} from "@viatsyshyn/ts-simple-query";
export {ISimpleQuery}

import {REF_OP, AND_OP, OR_OP, NOT_OP, EQ_OP, REGEX_OP, LT_OP, LTE_OP, GT_OP, GTE_OP, NEQ_OP} from '@viatsyshyn/ts-simple-query';
export {REF_OP, AND_OP, OR_OP, NOT_OP, EQ_OP, REGEX_OP, LT_OP, LTE_OP, GT_OP, GTE_OP, NEQ_OP};

export const Q_PARAM = 'q';
export const COUNT_PARAM = 'count';
export const LIMIT_PARAM = 'limit';
export const OFFSET_PARAM = 'offset';
export const ORDER_BY_PARAM = 'order';

export const ASC = 'ASC';
export const DESC = 'DESC';

export interface IQuerySource {
  [Q_PARAM]?: string;
  [COUNT_PARAM]?: 'true' | true | 1;
  [LIMIT_PARAM]?: string;
  [OFFSET_PARAM]?: string;
  [ORDER_BY_PARAM]?: string;
}

export function parseQuery(input: string = ''): ISimpleQuery | undefined {
  if (!input) {
    return undefined;
  }

  const t = tokenizer('(' + input.trim() + ')');

  return parseExpression(t) as ISimpleQuery;
}

export interface IOrderBy {
  [column: string]: typeof ASC | typeof DESC;
}

export function parseOrderBy(sort?: string): IOrderBy[] | undefined {
  if (!sort?.trim()) {
    return undefined;
  }

  const results: IOrderBy[] = [];
  const t = tokenizer(sort);

  t.consume(space);
  while (!t.eol) {
    const field = parseIdentifier(t);
    const op = t.current === '-' ? DESC : ASC;

    if (t.match('+') || t.match('-')) {
      t.next();
    }

    results.push({[field]: op});

    t.consume(space);

    if (!t.eol && !t.match(',')) {
      throw t.error('Comma expected');
    }

    t.next();
  }

  if (!results.length) {
    return undefined;
  }

  return results;
}

export function parsePaging(query: Record<'limit'|'offset', string>): {limit?: number, offset?: number} {

  let offset = query[OFFSET_PARAM];
  let limit = query[LIMIT_PARAM];

  const res: {limit?: number, offset?: number} = {};
  if (offset != null) {
    const value = parseInt(offset, 10);
    if (isNaN(value) || value < 0) {
      throw new Error(`Invalid offset param ${offset}`);
    }

    res.offset = value;
  }

  if (limit != null) {
    const value = parseInt(limit, 10);
    if (isNaN(value) || value < 0) {
      throw new Error(`Invalid limit param ${limit}`);
    }

    res.limit = value;
  }

  return res;
}

export interface IParsedQuery {
  query?: ISimpleQuery;
  limit?: number;
  offset?: number;
  orderBy?: IOrderBy[];
  countOnly: boolean;
}

export function parser(input: IQuerySource = {}): IParsedQuery {
  const countOnly = input[COUNT_PARAM] === true || input[COUNT_PARAM] === 'true' || input[COUNT_PARAM] === 1;
  const query = parseQuery(input[Q_PARAM]);
  const orderBy = parseOrderBy(input[ORDER_BY_PARAM]);
  const {limit, offset} = parsePaging(input as any);

  return JSON.parse(JSON.stringify({
    query,
    countOnly,
    orderBy,
    limit,
    offset,
  }));
}
