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
import {GetListSimpleQueryInput, GetListSimpleQuerySymbol} from "./middleware";

@httpGet('/test', QueryParserMiddleware)
export class TestRoute extends Route {
  @inject(GetListSimpleQuerySymbol)
  protected model!: GetListSimpleQueryInput<Model>

  async handle() {
    const data: Iterable<IModel>; // some data
    const collecton = new Collection(data);

    if (this.model.query) {
      collection.where(this.model.query)
    }
    
    if (this.model.countOnly) {
      return this.json(collection.valueOf().length);
    }
    
    if (this.model.orderBy) {
      collection.sort(this.model.orderBy)
    }
    
    const result = collecton.valueOf().slice(this.model.offset ?? 0, this.model.limit??10);

    this.json(result);
  }
}
```

Use `DescribeQueryParams` a helper function to provide useful description via OpenApi schemas

## Query language

### Literals

* `NULL`
* Identifiers - e.g. property names
* Escaped identifiers - names wrapped into ` quotes 
* Strings - single- or double-quoted
* Boolean - `true` or `false`
* Numbers:
  * Binary - `0b01010101`
  * Octal - `0o123456`
  * Hexadecimal - `0x1234567890abcdef`
  * Integers - `-123456`
  * Floats - `-123.456`
  * Scientific `-0.5e-3`
* Arrays - e.g. `[1,2,3]`

### Operators

* `=` - equality e.g. `a = 5`
* `!=` - non equal e.g. `a != b`
* `>`
* `>=`
* `<`
* `<=`
* `~` - like e.g. `a ~ "%some%"` - a should contain string `some`
* `^` - in e.g. `a ^ [1,2,3]` or `"some" ^ b` 

### Logic

* `!` - not, e.g. `!a`
* `&&` - and, e.g `a = 5 && b != 2`
* `||` - or, e.g `a || !b`

### Expressions

You can use parenthesis to construct proper expressions

```
(a = 5) || ((b = 2) && (c ^ [1,2,3]))
```

## Use in URI

Keep in mind that You should properly encode URI component before including it in URL

```ts
const query = `a = 5 && !c && b ~ "some%"`;
const url = `https://example.org?q=${encodeURIComponent(query)}&offset=0&limit=10`;

// https://example.org?q=a%20%3D%205%20%26%26%20!c%20%26%26%20b%20~%20%22some%25%22&offset=0&limit=10
```

# License
May be freely distributed under the [MIT license](https://opensource.org/licenses/MIT).

Copyright (c) 2022 Volodymyr Iatsyshyn and other contributors
