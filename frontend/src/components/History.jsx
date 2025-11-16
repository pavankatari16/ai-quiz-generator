import React, { useState, useEffect } from 'react';
import { getHistory } from '../services/api';
import Modal from './Modal';

export default function History() {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await getHistory(50, 0);
      setQuizzes(response.data);
    } catch (err) {
      setError('Failed to load history. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetails = (quiz) => {
    setSelectedQuiz(quiz);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedQuiz(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-gray-900">Quiz History</h2>
        <button
          onClick={fetchHistory}
          disabled={loading}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-secondary disabled:bg-gray-400 transition-colors"
        >
          {loading ? 'Loading...' : 'Refresh'}
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && quizzes.length === 0 && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin">
            <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
          </div>
          <p className="text-gray-600 mt-4">Loading quizzes...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && quizzes.length === 0 && (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <p className="text-gray-600">No quizzes yet. Create one to get started!</p>
        </div>
      )}

      {/* Quizzes Table */}
      {quizzes.length > 0 && (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">ID</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Title</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Date</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Questions</th>
                <th className="px-6 py-3 text-left text-sm font-semibold text-gray-900">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {quizzes.map((quiz) => (
                <tr key={quiz.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">#{quiz.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{quiz.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {new Date(quiz.date_generated).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">
                    {quiz.quiz?.length || 0} questions
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <button
                      onClick={() => handleViewDetails(quiz)}
                      className="text-primary hover:text-secondary font-medium transition-colors"
                    >
                      View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal */}
      {showModal && selectedQuiz && (
        <Modal quiz={selectedQuiz} onClose={handleCloseModal} />
      )}
    </div>
  );
}
