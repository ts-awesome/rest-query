import { parser } from './parser.v2';

import { IMiddleware } from '@viatsyshyn/ts-rest';
import { injectable } from 'inversify'

@injectable()
export class QueryParserMiddleware implements IMiddleware  {
  public async handle({query: _}: any): Promise<void> {
    const {query, offset, limit, countOnly, orderBy} = parser(_);
    _.query = query;
    _.limit = limit;
    _.offset = offset;
    _.orderBy = orderBy;
    _.countOnly = countOnly;
  }
}
