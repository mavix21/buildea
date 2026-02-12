import { typedV } from "convex-helpers/validators";
import { defineSchema } from "convex/server";

import { arcadeLevels } from "./tables/arcadeLevels";
import { arcadesTable } from "./tables/arcades";
import { assignmentSubmissionsTable } from "./tables/assignmentSubmissions";
import { communitiesTable } from "./tables/communities";
import { dailyQuestsTable } from "./tables/dailyQuests";
import { levelTitlesTable } from "./tables/levelTitles";
import { quizQuestionsTable } from "./tables/quizQuestions";
import { quizSubmissionsTable } from "./tables/quizSubmissions";
import { quizzesTable } from "./tables/quizzes";
import { usersTable } from "./tables/users";
import { workshopAssignmentsTable } from "./tables/workshopAssignments";
import { workshopAttendanceTable } from "./tables/workshopAttendance";
import { workshopRegistrationsTable } from "./tables/workshopRegistrations";
import { workshopResourcesTable } from "./tables/workshopResources";
import { workshopsTable } from "./tables/workshops";
import { xpConfigTable } from "./tables/xpConfig";
import { xpMultipliersTable } from "./tables/xpMultipliers";
import { xpTransactionsTable } from "./tables/xpTransactions";

const schema = defineSchema({
  users: usersTable,
  communities: communitiesTable,

  // Workshops
  workshops: workshopsTable,
  workshopResources: workshopResourcesTable,
  workshopRegistrations: workshopRegistrationsTable,
  workshopAttendance: workshopAttendanceTable,
  workshopAssignments: workshopAssignmentsTable,
  assignmentSubmissions: assignmentSubmissionsTable,

  // Arcades
  arcades: arcadesTable,
  arcadeLevels: arcadeLevels,
  dailyQuests: dailyQuestsTable,

  // Quizzes
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
