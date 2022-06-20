# @ts-awesome/rest-query

TypeScript friendly query parser extension for Rest

Key features:

* minimalistic query language
* support for logical operation and grouping
* complementary with [@ts-awesome/rest](https://github.com/ts-awesome/rest)

`ISimpleQuery` language guide is [here](https://github.com/ts-awesome/simple-query)

## Base use

```ts
import {parser} from "@ts-awesome/rest-query";

const input = {
  q: 'a > 5 && b = "test"',
  limit: 10,
  offset: 0,
  order: 'a+,b-,c',
  count: false,
};

const parsed = parser(input);
```

Outputs:

```json
{
  "query": {
    "$and": [
      { "$gt": {"a": 5}},
      { "$eq": {"b": "test"}},
    ] 
  },
  "limit": 10,
  "offset": 0,
  "orderBy": [{"a": "ASC"},{"b": "DESC"},{"c": "ASC"}],
  "countOnly": false
}
```

## Use with @ts-awesome/rest

```ts
import {Route, httpGet, queryParam} from "@ts-awesome/rest";
import {QueryParserMiddleware} from "@ts-awesome/rest-query";

@httpGet('/test', QueryParserMiddleware)
export class TestRoute extends Route {
  async handle(
    @queryParam('query', true) query: ISimpleQuery | null,
    @queryParam('orderBy', true) orderBy: IOrderBy[] | null,
    @queryParam('offset', Number, true) offset: number | null,
    @queryParam('limit', Number, true) limit: number | null,
    @queryParam('countOnly', Boolean) countOnly: boolean,
  ) {
    // something important happens here
  }
}
```
