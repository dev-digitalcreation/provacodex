import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  games: defineTable({
    name: v.string(),
    status: v.union(v.literal("lobby"), v.literal("active"), v.literal("finished")),
    currentQuestionIndex: v.number(),
    questions: v.array(
      v.object({
        prompt: v.string(),
        options: v.array(v.string()),
        answerIndex: v.number()
      })
    ),
    createdAt: v.number()
  }),
  players: defineTable({
    gameId: v.id("games"),
    name: v.string(),
    score: v.number(),
    answers: v.array(
      v.object({
        questionIndex: v.number(),
        answerIndex: v.number(),
        correct: v.boolean()
      })
    ),
    joinedAt: v.number()
  }).index("by_game", ["gameId"])
});
