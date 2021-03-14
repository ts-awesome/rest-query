import {parser} from './parser.v2';

import { IMiddleware } from '@ts-awesome/rest';
import { injectable } from 'inversify'

@injectable()
export class QueryParserMiddleware implements IMiddleware  {
  public async handle({query: _}: {query: Record<string, unknown>}): Promise<void> {
    const {query, offset, limit, countOnly, orderBy} = parser(_);
    _.query = query;
    _.limit = limit;
    _.offset = offset;
    _.orderBy = orderBy;
    _.countOnly = countOnly;
  }
}
