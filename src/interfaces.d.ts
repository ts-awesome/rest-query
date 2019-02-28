import {Order, FilterMode, Operation} from './consts';

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
