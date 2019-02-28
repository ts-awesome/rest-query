export const AND = "AND";
export const OR = "OR";

export type FilterMode = typeof AND | typeof OR;

export const ASC = "ASC";
export const DESC = "DESC";

export type Order = typeof ASC | typeof DESC;

//WhereInput operations
export const OP_EQ = "=";
export const OP_NEQ = "!=";
export const OP_LT = "<";
export const OP_LTE = "<=";
export const OP_GT = ">";
export const OP_GTE = ">=";
export const OP_SEARSH = "~";
export const OP_NOT_SEARSH = "!~";
export const OP_INCLUDES = "IN";
export const OP_NOT_INCLUDES = "!IN";

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
