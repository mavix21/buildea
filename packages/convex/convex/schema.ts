import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { arcadeLevels } from "./tables/arcadeLevels";
import { arcadesTable } from "./tables/arcades";
import { communitiesTable } from "./tables/communities";
import { dailyQuestsTable } from "./tables/dailyQuests";
import { levelTitlesTable } from "./tables/levelTitles";
import { quizQuestionsTable } from "./tables/quizQuestions";
import { quizSubmissionsTable } from "./tables/quizSubmissions";
import { quizzesTable } from "./tables/quizzes";
import { usersTable } from "./tables/users";
import { workshopsTable } from "./tables/workshops";
import { xpConfigTable } from "./tables/xpConfig";
import { xpMultipliersTable } from "./tables/xpMultipliers";
import { xpTransactionsTable } from "./tables/xpTransactions";

const schema = defineSchema({
  users: usersTable,
  communities: communitiesTable,
  workshops: workshopsTable,
  arcades: arcadesTable,
  arcadeLevels: arcadeLevels,
  dailyQuests: dailyQuestsTable,
  quizzes: quizzesTable,
  quizQuestions: quizQuestionsTable,
  quizSubmissions: quizSubmissionsTable,

  // XP & Levels
  xpConfig: xpConfigTable,
  levelTitles: levelTitlesTable,
  xpTransactions: xpTransactionsTable,
  xpMultipliers: xpMultipliersTable,
});

export default schema;
export const vv = typedV(schema);
