import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { communitiesTable } from "./tables/communities";
import { usersTable } from "./tables/users";

const schema = defineSchema({
  users: usersTable,
  communities: communitiesTable,
});

export default schema;
export const vv = typedV(schema);
