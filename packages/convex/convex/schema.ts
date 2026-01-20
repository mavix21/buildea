import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { usersTable } from "./tables/users";

const schema = defineSchema({
  users: usersTable,
});

export default schema;
export const vv = typedV(schema);
