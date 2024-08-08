const {AND_OP, OR_OP} = require("@ts-awesome/simple-query");
const {parser, ASC, DESC, Q_PARAM, COUNT_PARAM, LIMIT_PARAM, OFFSET_PARAM, ORDER_BY_PARAM} = require('../dist/parser.v2');

describe('parser v2', () => {

  it('simple query', async () => {
    const query = {
      [Q_PARAM]: 'a && !b',
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      query: {
        [AND_OP]: [
          {a: true},
          {b: false},
        ]
      }
    });
  });

  it('another query', async () => {
    const query = {
      [Q_PARAM]: '(project="a"||project="b")&&(category="c")',
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      query: {
        [AND_OP]: [
          {
            [OR_OP]: [
              {"project": "a"},
              {"project": "b"},
            ]
          },
          {category: "c"},
        ]
      }
    });
  });

  it('compound query', async () => {
    const query = {
      [Q_PARAM]: ['a', '!b'],
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      query: {
        [AND_OP]: [
          {a: true},
          {b: false},
        ]
      }
    });
  });

  it('count query', async () => {
    const query = {
      [COUNT_PARAM]: 'true'
    };

    expect(parser(query)).toStrictEqual({
      countOnly: true
    });
  });

  it('ordered query', async () => {
    const query = {
      [ORDER_BY_PARAM]: 'a-,b'
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      orderBy: [
        {a:DESC},
        {b:ASC},
      ]
    });
  })

  it('compound ordered query', async () => {
    const query = {
      [ORDER_BY_PARAM]: ['a-', 'b']
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      orderBy: [
        {a:DESC},
        {b:ASC},
      ]
    });
  })

  it('limited query', async () => {
    const query = {
      [LIMIT_PARAM]: 10,
      [OFFSET_PARAM]: 20,
    };

    expect(parser(query)).toStrictEqual({
      countOnly: false,
      limit: 10,
      offset: 20,
    });
  })
});
