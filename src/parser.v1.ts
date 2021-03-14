export const AND = 'AND';
export const OR = 'OR';

export type FilterMode = typeof AND | typeof OR;

export const ASC = 'ASC';
export const DESC = 'DESC';

export type Order = typeof ASC | typeof DESC;

export const COUNT_COLUMN = 'COUNT(*)';

//WhereInput operations
export const OP_EQ = '=';
export const OP_NEQ = '!=';
export const OP_LT = '<';
export const OP_LTE = '<=';
export const OP_GT = '>';
export const OP_GTE = '>=';
export const OP_SEARSH = '~';
export const OP_NOT_SEARSH = '!~';
export const OP_INCLUDES = 'IN';
export const OP_NOT_INCLUDES = '!IN';

export type Operation = typeof OP_EQ
  | typeof OP_NEQ
  | typeof OP_LT
  | typeof OP_LTE
  | typeof OP_GT
  | typeof OP_GTE
  | typeof OP_SEARSH
  | typeof OP_NOT_SEARSH
  | typeof OP_INCLUDES
  | typeof OP_NOT_INCLUDES


export interface ISelectQueryInput {
  columns?: string[];
  where?: IWhereInput;
  orderBy?: IOrderBy;
  offset?: number;
  limit?: number;
}

export interface IWhereInput {
  filter: {
    [column: string]: IConditions;
  };
  op: FilterMode;
}

export type IConditions = {
  [P in keyof Operation]?: any;
}

export interface IOrderBy {
  [column: string]: Order;
}

export const COUNT_PARAM = 'count';
export const SORT_PARAM = 'sort';
export const OFFSET_PARAM = 'offset';
export const LIMIT_PARAM = 'limit';

const NOT_FILTER_PARAMS = [
  COUNT_PARAM,
  SORT_PARAM,
  OFFSET_PARAM,
  LIMIT_PARAM
];

const OPERATION_VALUE_SEPARATOR = ':';

function parseValue(value: string): any {
  return JSON.parse(value);
}

function parseFilter(query: any): IWhereInput | undefined {
  const paramNames = Object.keys(query);
  const filterParamNames = paramNames.filter(pName => NOT_FILTER_PARAMS.indexOf(pName) < 0);

  if (filterParamNames.length <= 0) {
    return;
  }


  const res: IWhereInput = {
    op: AND,
    filter: {}
  };

  filterParamNames.forEach(pName => {
    const paramValues: string[] = query[pName] instanceof Array ? query[pName] : [query[pName]];
    paramValues.forEach(pValue => {
      const separatorPosition = pValue.indexOf(OPERATION_VALUE_SEPARATOR);
      let parsedValue, op: any;
      if (separatorPosition > 0) {
        op = pValue.slice(0, separatorPosition);
        const value = pValue.slice(separatorPosition + 1, pValue.length + 1);
        parsedValue = parseValue(value);
      } else {
        op = OP_EQ;
        parsedValue = parseValue(pValue);
      }

      if (<any>res.filter[pName] === undefined) {
        res.filter[pName] = {};
      }
      res.filter[pName][op] = parsedValue;
    });
  });
  return res;
}

function parseSort(query: any): IOrderBy | undefined {
  const sort: string = query[SORT_PARAM];
  if (!sort || sort.trim() === '') {
    return undefined;
  }
  const res: IOrderBy = {};
  sort.split(',')
    .forEach(condition => {
      const fieldName = ['+', '-'].indexOf(condition[0]) < 0 ? condition : condition.substr(1);
      res[fieldName] = condition[0] === '-' ? DESC : ASC;
    });

  return res;
}

function parsePaging(query: any): {limit?: number, offset?: number} {

  const offset = query[OFFSET_PARAM];
  const limit = query[LIMIT_PARAM];

  if (isEmpty(offset) && isEmpty(limit)) {
    return {};
  }

  const res: any = {};
  if (!isEmpty(offset)) {
    res.offset = parseInt(offset);
    if (isNaN(res.offset)) {
      throw new Error(`Invalid offset param ${offset}`);
    }
  }

  if (!isEmpty(limit)) {
    res.limit = parseInt(limit);
    if (isNaN(res.limit)) {
      throw new Error(`Invalid limit param ${limit}`);
    }
  }

  return res;
}

function isEmpty(value: any): any {
  return value === null || value === undefined;
}

export function parser(query: string[]): ISelectQueryInput {
  let search: ISelectQueryInput = {
    where: parseFilter(query)
  };

  const countOnly = query[COUNT_PARAM] !== true && query[COUNT_PARAM] !== 'true';
  if (countOnly) {
    search = {
      ...search,
      orderBy: parseSort(query),
      ...parsePaging(query)
    };
  } else {
    search.columns = [COUNT_COLUMN]
  }

  return search;
}
