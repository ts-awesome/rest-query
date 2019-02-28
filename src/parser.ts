import {IOrderBy, ISelectQueryInput, IWhereInput} from "./interfaces";

import {AND, ASC, DESC, OP_EQ} from "./consts";

const COUNT_PARAM = 'count';
const SORT_PARAM = 'sort';
const OFFSET_PARAM = 'offset';
const LIMIT_PARAM = 'limit';

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
  let paramNames = Object.keys(query);
  let filterParamNames = paramNames.filter(pName => NOT_FILTER_PARAMS.indexOf(pName) < 0);

  if (filterParamNames.length <= 0) {
    return;
  }


  let res: IWhereInput = {
    op: AND,
    filter: {}
  };

  filterParamNames.forEach(pName => {
    let paramValues: string[] = query[pName] instanceof Array ? query[pName] : [query[pName]];
    paramValues.forEach(pValue => {
      let separatorPosition = pValue.indexOf(OPERATION_VALUE_SEPARATOR);
      let parsedValue, op: any;
      if (separatorPosition > 0) {
        op = pValue.slice(0, separatorPosition);
        let value = pValue.slice(separatorPosition + 1, pValue.length + 1);
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
  let sort: string = query[SORT_PARAM];
  if (!sort || sort.trim() === '') {
    return undefined;
  }
  let res: IOrderBy = {};
  sort.split(',')
    .forEach(condition => {
      let fieldName = ['+', '-'].indexOf(condition[0]) < 0 ? condition : condition.substr(1);
      res[fieldName] = condition[0] === '-' ? DESC : ASC;
    });

  return res;
}

function parsePaging(query: any): {limit?: number, offset?: number} {

  let offset = query[OFFSET_PARAM];
  let limit = query[LIMIT_PARAM];

  if (isEmpty(offset) && isEmpty(limit)) {
    return {};
  }

  let res: any = {};
  if (!isEmpty(offset)) {
    res.offset = parseInt(offset);
  }

  if (!isEmpty(limit)) {
    res.limit = parseInt(limit);
  }

  if (isNaN(res.offset)) {
    throw new Error(`Invalid offset param ${offset}`);
  }

  if (isNaN(res.limit)) {
    throw new Error(`Invalid limit param ${limit}`);
  }

  return res;
}

function isEmpty(value: any): any {
  return value === null || value === undefined;
}

export function parser(query: string[]) {
  let search: ISelectQueryInput = {
    where: parseFilter(query)!
  };

  if (query[COUNT_PARAM] !== true && query[COUNT_PARAM] !== 'true') {
    search = {
      ...search,
      orderBy: parseSort(query),
      ...parsePaging(query)
    };
  }

  return search;
}
