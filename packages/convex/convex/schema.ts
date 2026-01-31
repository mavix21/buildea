import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { arcadesTable } from "./tables/arcades";
import { communitiesTable } from "./tables/communities";
import { dailyQuestsTable } from "./tables/dailyQuests";
import { quizQuestionsTable } from "./tables/quizQuestions";
import { quizSubmissionsTable } from "./tables/quizSubmissions";
import { quizzesTable } from "./tables/quizzes";
import { usersTable } from "./tables/users";
import { workshopsTable } from "./tables/workshops";

const schema = defineSchema({
  users: usersTable,
  communities: communitiesTable,
  workshops: workshopsTable,
  arcades: arcadesTable,
  dailyQuests: dailyQuestsTable,
  quizzes: quizzesTable,
  quizQuestions: quizQuestionsTable,
  quizSubmissions: quizSubmissionsTable,
});

export default schema;
export const vv = typedV(schema);
