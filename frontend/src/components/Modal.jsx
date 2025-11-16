import React from 'react';

export default function Modal({ quiz, onClose }) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-primary to-secondary p-6 text-white flex justify-between items-start">
          <div>
            <h2 className="text-2xl font-bold">{quiz.title}</h2>
            <p className="text-sm opacity-90 mt-1">
              Generated: {new Date(quiz.date_generated).toLocaleString()}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors text-2xl font-bold"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Summary */}
          {quiz.summary && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Summary</h3>
              <p className="text-gray-700 leading-relaxed">{quiz.summary}</p>
            </div>
          )}

          {/* Key Entities */}
          {quiz.key_entities && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Key Entities</h3>
              <div className="space-y-3">
                {quiz.key_entities.people && quiz.key_entities.people.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">People</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.people.map((person, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full"
                        >
                          {person}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.key_entities.organizations && quiz.key_entities.organizations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Organizations</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.organizations.map((org, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-purple-100 text-purple-800 text-sm rounded-full"
                        >
                          {org}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
                {quiz.key_entities.locations && quiz.key_entities.locations.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-2">Locations</h4>
                    <div className="flex flex-wrap gap-2">
                      {quiz.key_entities.locations.map((location, i) => (
                        <span
                          key={i}
                          className="px-3 py-1 bg-green-100 text-green-800 text-sm rounded-full"
                        >
                          {location}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Sections */}
          {quiz.sections && quiz.sections.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Article Sections</h3>
              <div className="flex flex-wrap gap-2">
                {quiz.sections.map((section, i) => (
                  <span key={i} className="px-3 py-1 bg-gray-200 text-gray-800 text-sm rounded">
                    {section}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Quiz Questions */}
          {quiz.quiz && quiz.quiz.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quiz Questions</h3>
              <div className="space-y-4">
                {quiz.quiz.map((q, idx) => (
                  <div key={idx} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-gray-900 flex-1">
                        {idx + 1}. {q.question}
                      </h4>
                      <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-yellow-100 text-yellow-800">
                        {q.difficulty || 'Medium'}
                      </span>
                    </div>

                    {/* Options */}
                    <div className="space-y-2 mb-3 ml-4">
                      {q.options && q.options.map((option, optIdx) => (
                        <div
                          key={optIdx}
                          className={`p-2 rounded ${
                            optIdx === q.correct_answer
                              ? 'bg-green-50 border border-green-200'
                              : 'bg-gray-50 border border-gray-200'
                          }`}
                        >
                          <span className="font-medium">
                            {String.fromCharCode(65 + optIdx)}.
                          </span>{' '}
                          {option}
                          {optIdx === q.correct_answer && (
                            <span className="ml-2 text-green-600 font-semibold">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Explanation */}
                    {q.explanation && (
                      <div className="bg-blue-50 border-l-4 border-blue-400 p-3 ml-4">
                        <p className="text-sm text-blue-900">
                          <strong>Explanation:</strong> {q.explanation}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Related Topics */}
          {quiz.related_topics && quiz.related_topics.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Related Topics</h3>
              <div className="flex flex-wrap gap-2">
                {quiz.related_topics.map((topic, i) => (
                  <a
                    key={i}
                    href={`https://en.wikipedia.org/wiki/${topic.replace(/\s+/g, '_')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:text-secondary underline"
                  >
                    {topic}
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* URL */}
          <div className="text-sm text-gray-600 border-t pt-4">
            <strong>Source:</strong>{' '}
            <a
              href={quiz.url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:text-secondary underline break-all"
            >
              {quiz.url}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
