import {
  COUNT_PARAM,
  IOrderBy,
  IParsedQuery,
  LIMIT_PARAM,
  OFFSET_PARAM,
  ORDER_BY_PARAM,
  parser,
  Q_PARAM
} from './parser.v2';

import {IHttpRequest, IMiddleware } from '@ts-awesome/rest';
import {Container, injectable} from 'inversify'
import _, {readable} from "@ts-awesome/model-reader";
import {ISimpleQuery} from "@ts-awesome/simple-query";

export const GetListSimpleQuerySymbol = Symbol.for('ListQuery');

export class GetListSimpleQueryInput implements IParsedQuery {
  @readable(true)
  public readonly limit?: number

  @readable(true)
  public readonly offset?: number

  @readable(Object, true)
  public readonly orderBy?: readonly IOrderBy[]

  @readable
  public readonly countOnly!: boolean

  @readable(Object, true)
  public readonly query?: ISimpleQuery
}

@injectable()
export class QueryParserMiddleware implements IMiddleware  {
  public async handle({query, container}: IHttpRequest & {container?: Container}): Promise<void> {
    const model = _(parser(query), GetListSimpleQueryInput, true);
    container?.bind(GetListSimpleQuerySymbol).toConstantValue(model);
  }
}

interface IOpenApiParameterArgs {
  description: string;
  schema: {
    type: string;
    minimum?: number;
    default?: any;
  }
}

export function DescribeQueryParams(columns: readonly string[], defaultLimit = 10): Record<string, IOpenApiParameterArgs> {
  const names = columns.map(x => JSON.stringify(x)).join(', ');
  return {
    [LIMIT_PARAM]: {
      description: 'Query limit, number',
      schema: {
        type: 'number',
        minimum: 1,
        default: defaultLimit,
      },
    },
    [OFFSET_PARAM]: {
      description: 'Query offset, number',
      schema: {
        type: 'number',
        minimum: 0,
        default: 0,
      },
    },
    [ORDER_BY_PARAM]: {
      description: `Query order, comma separated list of columns append '+' or '-' to indicate ASC or DESC ordering.\nAvailable columns ${names}`,
      schema: {
        type: 'string',
      },
    },
    [COUNT_PARAM]: {
      description: 'Set to true to fetch count of records',
      schema: {
        type: 'boolean',
      },
    },
    [Q_PARAM]: {
      description: `Query filter, supports arithmetic and logical operators.\nAvailable columns ${names}.\nMore info https://github.com/ts-awesome/rest-query?tab=readme-ov-file#query-language`,
      schema: {
        type: 'string',
      },
    },
  }
}
