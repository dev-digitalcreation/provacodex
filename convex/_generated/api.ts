import type { FunctionReference } from "convex/server";

type AnyFunction = FunctionReference<"query" | "mutation", any, any>;

type Api = {
  quiz: {
    listGames: AnyFunction;
    getGame: AnyFunction;
    createGame: AnyFunction;
    joinGame: AnyFunction;
    startGame: AnyFunction;
    submitAnswer: AnyFunction;
    advanceQuestion: AnyFunction;
  };
};

export const api = {
  quiz: {
    listGames: "quiz:listGames",
    getGame: "quiz:getGame",
    createGame: "quiz:createGame",
    joinGame: "quiz:joinGame",
    startGame: "quiz:startGame",
    submitAnswer: "quiz:submitAnswer",
    advanceQuestion: "quiz:advanceQuestion"
  }
} as Api;
