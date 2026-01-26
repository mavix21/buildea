import { defineSchema } from "convex/server";

import { tables } from "./generatedSchema";

const schema = defineSchema({
  ...tables,
  // Spread the generated schema and add a custom index
  walletAddress: tables.walletAddress.index("address_chainId", [
    "address",
    "chainId",
  ]),
  member: tables.member.index("organizationId_userId", [
    "organizationId",
    "userId",
  ]),
  user: tables.user.index("username", ["username"]),
});
export default schema;
