import React, { useState } from 'react';
import { generateQuiz } from '../services/api';

export default function GenerateQuiz() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [quiz, setQuiz] = useState(null);
  const [error, setError] = useState('');

  // Take-quiz mode state
  const [takeMode, setTakeMode] = useState(false);
  const [answers, setAnswers] = useState([]); // selected option index per question
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);

  const handleSubmit = async (e) => {
    e && e.preventDefault();
    setError('');
    setQuiz(null);
    setTakeMode(false);
    setAnswers([]);
    setSubmitted(false);
    setScore(null);

    if (!url.trim()) {
      setError('Please enter a valid Wikipedia URL');
      return;
    }

    setLoading(true);
    try {
      const response = await generateQuiz(url);
      // Backend may return two shapes:
      // 1) The compact deserialized response used by the API routes (quiz under `quiz`)
      // 2) A full object under `full_quiz_data` containing `questions` array
      const data = response.data;

      if (data.full_quiz_data) {
        // full_quiz_data might be a JSON string or object
        const full = typeof data.full_quiz_data === 'string' ? JSON.parse(data.full_quiz_data) : data.full_quiz_data;
        // Normalize into the shape this component expects
        const normalized = {
          title: data.title || full.title || '',
          date_generated: data.date_generated || data.date || new Date().toISOString(),
          summary: data.summary || full.summary || '',
          key_entities: data.key_entities || full.key_entities || {},
          sections: data.sections || full.sections || [],
          related_topics: data.related_topics || full.related_topics || [],
          url: data.url || '',
          // map questions -> quiz.quiz expected shape
          quiz: (full.questions || []).map((q) => ({
            question: q.question,
            options: q.choices || q.options || [],
            correct_answer: q.answer,
            explanation: q.explanation || q.explain || '',
            difficulty: q.difficulty || 'medium',
          })),
        };

        setQuiz(normalized);
      } else {
        // Fallback to existing compact API response
        setQuiz(data);
      }
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to generate quiz. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const startTakeMode = () => {
    if (!quiz) return;
    setTakeMode(true);
    setAnswers(Array(quiz.quiz.length).fill(null));
    setSubmitted(false);
    setScore(null);
  };

  const handleSelect = (qIndex, optIndex) => {
    if (!takeMode || submitted) return;
    const next = [...answers];
    next[qIndex] = optIndex;
    setAnswers(next);
  };

  const submitAnswers = () => {
    if (!quiz) return;
    let correct = 0;
    quiz.quiz.forEach((q, i) => {
      if (answers[i] === q.correct_answer) correct += 1;
    });
    setScore(correct);
    setSubmitted(true);
  };

  const resetQuiz = () => {
    setTakeMode(false);
    setAnswers([]);
    setSubmitted(false);
    setScore(null);
  };

  return (
    <div className="space-y-6">
      {/* Input Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow">
        <label className="block text-sm font-medium text-gray-700 mb-3">Wikipedia Article URL</label>
        <div className="flex gap-2">
          <input
            type="url"
            placeholder="https://en.wikipedia.org/wiki/Alan_Turing"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            disabled={loading}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary disabled:bg-gray-100"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:bg-gray-400 transition-colors font-medium"
          >
            {loading ? 'Generating...' : 'Generate Quiz'}
          </button>
        </div>
      </form>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Quiz Result */}
      {quiz && (
        <div className="space-y-6">
          {/* Header */}
          <div className="bg-white p-6 rounded-lg shadow">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">{quiz.title}</h2>
                <p className="text-gray-600 text-sm mb-4">{new Date(quiz.date_generated).toLocaleString()}</p>
                <p className="text-gray-700 mb-4">{quiz.summary}</p>
              </div>
              <div className="flex flex-col gap-2">
                <button
                  onClick={startTakeMode}
                  className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary transition-colors text-sm"
                >
                  Start Take Quiz
                </button>
                <button
                  onClick={() => { navigator.clipboard?.writeText(quiz.url); }}
                  className="px-4 py-2 border rounded-lg text-sm"
                >
                  Copy Source URL
                </button>
              </div>
            </div>

            {/* Key Entities */}
            {quiz.key_entities && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 mt-6">
                {quiz.key_entities.people?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">People</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.people.slice(0, 3).map((p, i) => (
                        <span key={i} className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-sm">{p}</span>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.key_entities.organizations?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Organizations</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.organizations.slice(0, 3).map((o, i) => (
                        <span key={i} className="bg-purple-100 text-purple-800 px-2 py-1 rounded text-sm">{o}</span>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.key_entities.locations?.length > 0 && (
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.locations.slice(0, 3).map((l, i) => (
                        <span key={i} className="bg-green-100 text-green-800 px-2 py-1 rounded text-sm">{l}</span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Sections */}
            {quiz.sections?.length > 0 && (
              <div className="mb-4">
                <h4 className="font-semibold text-gray-900 mb-2">Article Sections</h4>
                <div className="flex flex-wrap gap-2">
                  {quiz.sections.slice(0, 8).map((s, i) => (
                    <span key={i} className="bg-gray-200 text-gray-800 px-2 py-1 rounded text-sm">{s}</span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Quiz Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">Quiz Questions</h3>
              {takeMode && (
                <div className="flex items-center gap-2">
                  <button
                    onClick={submitAnswers}
                    disabled={submitted}
                    className="px-4 py-2 bg-green-600 text-white rounded-md text-sm"
                  >
                    Submit Answers
                  </button>
                  <button onClick={resetQuiz} className="px-3 py-2 border rounded text-sm">Exit</button>
                </div>
              )}
            </div>

            {quiz.quiz && quiz.quiz.map((q, idx) => (
              <div key={idx} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900">Q{idx + 1}: {q.question}</h4>
                  <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded">{q.difficulty || 'medium'}</span>
                </div>

                <div className="space-y-2 mb-3">
                  {q.options?.map((option, oidx) => {
                    const isSelected = answers[idx] === oidx;
                    const isCorrect = oidx === q.correct_answer;
                    const showCorrect = !takeMode || submitted;

                    return (
                      <button
                        key={oidx}
                        onClick={() => handleSelect(idx, oidx)}
                        disabled={!takeMode || submitted}
                        className={`w-full text-left p-2 rounded text-sm border transition-colors flex items-center justify-between ${
                          takeMode
                            ? isSelected
                              ? 'bg-primary text-white border-primary'
                              : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50'
                            : isCorrect
                              ? 'bg-green-100 text-green-900 border-green-200 font-semibold'
                              : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        <span>
                          <strong className="mr-2">{String.fromCharCode(65 + oidx)}.</strong>
                          {option}
                        </span>
                        {showCorrect && isCorrect && (<span className="text-green-700 font-semibold">✓</span>)}
                      </button>
                    );
                  })}
                </div>

                {/* Explanation shown after submit */}
                {submitted && q.explanation && (
                  <div className="text-sm text-gray-700 bg-blue-50 p-2 rounded">
                    <strong>Explanation: </strong>{q.explanation}
                  </div>
                )}
              </div>
            ))}

            {/* Score area */}
            {takeMode && submitted && (
              <div className="bg-white p-4 rounded-lg shadow flex items-center justify-between">
                <div>
                  <h4 className="font-semibold">Your Score</h4>
                  <p className="text-sm text-gray-600">{score} / {quiz.quiz.length} correct</p>
                </div>
                <div>
                  <button onClick={() => { setSubmitted(false); setScore(null); setAnswers(Array(quiz.quiz.length).fill(null)); }} className="px-4 py-2 border rounded">Retry</button>
                </div>
              </div>
            )}
          </div>

          {/* Related Topics */}
          {quiz.related_topics?.length > 0 && (
            <div className="bg-white p-6 rounded-lg shadow">
              <h4 className="font-semibold text-gray-900 mb-3">Related Topics</h4>
              <div className="flex flex-wrap gap-2">
                {quiz.related_topics.map((topic, i) => (
                  <a key={i} href={`https://en.wikipedia.org/wiki/${encodeURIComponent(topic)}`} target="_blank" rel="noopener noreferrer" className="bg-primary text-white px-3 py-2 rounded text-sm hover:bg-secondary transition-colors">{topic} ↗</a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="h-12 w-12 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Scraping article and generating quiz...</p>
        </div>
      )}
    </div>
  );
}
