import { mutation, query } from "convex/server";
import { v } from "convex/values";

const sampleQuestions = [
  {
    prompt: "Qual è la capitale del Giappone?",
    options: ["Osaka", "Kyoto", "Tokyo", "Sapporo"],
    answerIndex: 2
  },
  {
    prompt: "Quale linguaggio usa Next.js?",
    options: ["Ruby", "TypeScript/JavaScript", "Go", "Rust"],
    answerIndex: 1
  },
  {
    prompt: "Cosa offre Convex per il real-time?",
    options: ["WebSocket integrati", "Solo REST", "Solo FTP", "Cache manuale"],
    answerIndex: 0
  },
  {
    prompt: "Qual è il pianeta rosso?",
    options: ["Mercurio", "Venere", "Marte", "Giove"],
    answerIndex: 2
  }
];

export const listGames = query({
  args: {},
  handler: async (ctx) => {
    return ctx.db.query("games").order("desc").collect();
  }
});

export const getGame = query({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) {
      return null;
    }

    const players = await ctx.db
      .query("players")
      .withIndex("by_game", (q) => q.eq("gameId", gameId))
      .collect();

    return { game, players };
  }
});

export const createGame = mutation({
  args: { gameName: v.string(), playerName: v.string() },
  handler: async (ctx, { gameName, playerName }) => {
    const gameId = await ctx.db.insert("games", {
      name: gameName,
      status: "lobby",
      currentQuestionIndex: 0,
      questions: sampleQuestions,
      createdAt: Date.now()
    });

    const playerId = await ctx.db.insert("players", {
      gameId,
      name: playerName,
      score: 0,
      answers: [],
      joinedAt: Date.now()
    });

    return { gameId, playerId };
  }
});

export const joinGame = mutation({
  args: { gameId: v.id("games"), playerName: v.string() },
  handler: async (ctx, { gameId, playerName }) => {
    const playerId = await ctx.db.insert("players", {
      gameId,
      name: playerName,
      score: 0,
      answers: [],
      joinedAt: Date.now()
    });

    return { playerId };
  }
});

export const startGame = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game) {
      return;
    }

    if (game.status === "lobby") {
      await ctx.db.patch(gameId, { status: "active" });
    }
  }
});

export const submitAnswer = mutation({
  args: {
    gameId: v.id("games"),
    playerId: v.id("players"),
    answerIndex: v.number()
  },
  handler: async (ctx, { gameId, playerId, answerIndex }) => {
    const game = await ctx.db.get(gameId);
    const player = await ctx.db.get(playerId);

    if (!game || !player || game.status !== "active") {
      return;
    }

    const questionIndex = game.currentQuestionIndex;
    const alreadyAnswered = player.answers.some(
      (answer) => answer.questionIndex === questionIndex
    );

    if (alreadyAnswered) {
      return;
    }

    const question = game.questions[questionIndex];
    const correct = question?.answerIndex === answerIndex;

    await ctx.db.patch(playerId, {
      answers: [
        ...player.answers,
        { questionIndex, answerIndex, correct: Boolean(correct) }
      ],
      score: player.score + (correct ? 1 : 0)
    });
  }
});

export const advanceQuestion = mutation({
  args: { gameId: v.id("games") },
  handler: async (ctx, { gameId }) => {
    const game = await ctx.db.get(gameId);
    if (!game || game.status !== "active") {
      return;
    }

    const nextIndex = game.currentQuestionIndex + 1;
    const finished = nextIndex >= game.questions.length;

    await ctx.db.patch(gameId, {
      currentQuestionIndex: finished ? game.currentQuestionIndex : nextIndex,
      status: finished ? "finished" : game.status
    });
  }
});
