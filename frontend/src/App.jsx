import React, { useState } from 'react';
import GenerateQuiz from './components/GenerateQuiz';
import History from './components/History';

function App() {
  const [activeTab, setActiveTab] = useState('generate');

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-gradient-to-r from-primary to-secondary text-white shadow-lg">
        <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
          <h1 className="text-4xl font-bold mb-2">AI Quiz Generator</h1>
          <p className="text-lg opacity-90">Generate quizzes from any article using AI</p>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="bg-white border-b shadow-sm sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 flex gap-0">
          <button
            onClick={() => setActiveTab('generate')}
            className={`px-6 py-4 font-medium border-b-2 transition-all ${
              activeTab === 'generate'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Generate Quiz
          </button>
          <button
            onClick={() => setActiveTab('history')}
            className={`px-6 py-4 font-medium border-b-2 transition-all ${
              activeTab === 'history'
                ? 'border-primary text-primary'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            Past Quizzes
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {activeTab === 'generate' && <GenerateQuiz />}
          {activeTab === 'history' && <History />}
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-300 text-center py-6 mt-12">
        <p>AI Quiz Generator © 2025 | Powered by FastAPI + React</p>
      </footer>
    </div>
  );
}

export default App;
