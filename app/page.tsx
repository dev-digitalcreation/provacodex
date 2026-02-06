"use client";

import { useMemo, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "../convex/_generated/api";

export default function HomePage() {
  const games = useQuery(api.quiz.listGames) ?? [];
  const [activeGameId, setActiveGameId] = useState<string | null>(null);
  const [playerId, setPlayerId] = useState<string | null>(null);
  const [gameName, setGameName] = useState("");
  const [playerName, setPlayerName] = useState("");
  const [joinName, setJoinName] = useState("");
  const [selectedGameId, setSelectedGameId] = useState<string>("");

  const createGame = useMutation(api.quiz.createGame);
  const joinGame = useMutation(api.quiz.joinGame);
  const startGame = useMutation(api.quiz.startGame);
  const submitAnswer = useMutation(api.quiz.submitAnswer);
  const advanceQuestion = useMutation(api.quiz.advanceQuestion);

  const gameData = useQuery(
    api.quiz.getGame,
    activeGameId ? { gameId: activeGameId } : undefined
  );

  const activeGame = gameData?.game ?? null;
  const players = gameData?.players ?? [];

  const currentPlayer = useMemo(() => {
    if (!playerId) {
      return null;
    }
    return players.find((player) => player._id === playerId) ?? null;
  }, [playerId, players]);

  const currentQuestion = activeGame
    ? activeGame.questions[activeGame.currentQuestionIndex]
    : null;

  const currentAnswer = currentPlayer?.answers.find(
    (answer) => answer.questionIndex === activeGame?.currentQuestionIndex
  );

  const leaderboard = [...players].sort((a, b) => b.score - a.score);

  const handleCreateGame = async () => {
    if (!gameName.trim() || !playerName.trim()) {
      return;
    }

    const result = await createGame({
      gameName: gameName.trim(),
      playerName: playerName.trim()
    });

    setActiveGameId(result.gameId);
    setPlayerId(result.playerId);
    setSelectedGameId("");
  };

  const handleJoinGame = async () => {
    if (!selectedGameId || !joinName.trim()) {
      return;
    }

    const result = await joinGame({
      gameId: selectedGameId,
      playerName: joinName.trim()
    });

    setActiveGameId(selectedGameId);
    setPlayerId(result.playerId);
  };

  const handleStart = async () => {
    if (!activeGameId) {
      return;
    }
    await startGame({ gameId: activeGameId });
  };

  const handleAnswer = async (answerIndex: number) => {
    if (!activeGameId || !playerId) {
      return;
    }

    await submitAnswer({
      gameId: activeGameId,
      playerId,
      answerIndex
    });
  };

  const handleAdvance = async () => {
    if (!activeGameId) {
      return;
    }

    await advanceQuestion({ gameId: activeGameId });
  };

  return (
    <main>
      <header>
        <h1>Quiz Multiplayer in Tempo Reale</h1>
        <p>
          Crea o unisciti a una stanza, rispondi alle domande e guarda la
          classifica aggiornarsi live grazie a Convex.
        </p>
      </header>

      <section className="grid">
        <div className="card">
          <h2>Crea una nuova partita</h2>
          <label>
            Nome partita
            <input
              value={gameName}
              onChange={(event) => setGameName(event.target.value)}
              placeholder="Quiz del venerdì"
            />
          </label>
          <label>
            Il tuo nome
            <input
              value={playerName}
              onChange={(event) => setPlayerName(event.target.value)}
              placeholder="Alice"
            />
          </label>
          <button onClick={handleCreateGame}>Crea e entra</button>
        </div>

        <div className="card">
          <h2>Unisciti a una partita</h2>
          <label>
            Seleziona partita
            <select
              value={selectedGameId}
              onChange={(event) => setSelectedGameId(event.target.value)}
            >
              <option value="">Scegli una stanza...</option>
              {games.map((game) => (
                <option key={game._id} value={game._id}>
                  {game.name} ({game.status})
                </option>
              ))}
            </select>
          </label>
          <label>
            Il tuo nome
            <input
              value={joinName}
              onChange={(event) => setJoinName(event.target.value)}
              placeholder="Marco"
            />
          </label>
          <button onClick={handleJoinGame} disabled={!selectedGameId}>
            Entra nella stanza
          </button>
        </div>
      </section>

      <section>
        <h2>Partite disponibili</h2>
        <div className="grid">
          {games.map((game) => (
            <article className="card" key={game._id}>
              <div>
                <strong>{game.name}</strong>
              </div>
              <div className="badge">{game.status}</div>
              <div>{game.questions.length} domande</div>
            </article>
          ))}
        </div>
      </section>

      {activeGame && (
        <section>
          <div className="grid">
            <div className="card">
              <h2>Stanza attiva</h2>
              <div className="list">
                <div>
                  <strong>{activeGame.name}</strong>
                </div>
                <div className="badge">{activeGame.status}</div>
                <div>
                  Domanda {activeGame.currentQuestionIndex + 1} di{" "}
                  {activeGame.questions.length}
                </div>
                {activeGame.status === "lobby" && (
                  <button onClick={handleStart}>Avvia il quiz</button>
                )}
                {activeGame.status === "active" && (
                  <button onClick={handleAdvance}>Prossima domanda</button>
                )}
              </div>
            </div>

            <div className="card">
              <h2>Classifica live</h2>
              <div className="leaderboard">
                {leaderboard.map((player) => (
                  <div key={player._id} className="option">
                    <span>{player.name}</span>
                    <strong>{player.score}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}

      {activeGame && currentQuestion && (
        <section>
          <h2>Domanda corrente</h2>
          <div className="list">
            <p>{currentQuestion.prompt}</p>
            <div className="question-options">
              {currentQuestion.options.map((option, index) => {
                const selected = currentAnswer?.answerIndex === index;
                return (
                  <button
                    key={option}
                    className="option"
                    onClick={() => handleAnswer(index)}
                    disabled={Boolean(currentAnswer)}
                  >
                    <span>{option}</span>
                    {selected && <span className="badge">Scelta</span>}
                  </button>
                );
              })}
            </div>
            {activeGame.status === "finished" && (
              <div className="badge">Quiz terminato</div>
            )}
          </div>
        </section>
      )}
    </main>
  );
}
