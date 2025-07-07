import React, { useState } from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ProjectProvider } from './contexts/ProjectContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AuthForm from './components/AuthForm';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import TaskBoard from './components/TaskBoard';

const AppContent: React.FC = () => {
  const { user, isLoading } = useAuth();
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 animate-pulse">
            <div className="w-8 h-8 bg-white rounded-lg"></div>
          </div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <AuthForm 
        mode={authMode} 
        onToggleMode={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')} 
      />
    );
  }

  return (
    <ProjectProvider>
      <div className="h-screen flex flex-col">
        <Navbar onToggleSidebar={toggleSidebar} sidebarOpen={sidebarOpen} />
        <div className="flex-1 flex overflow-hidden relative">
          <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          <TaskBoard />
        </div>
      </div>
    </ProjectProvider>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </AuthProvider>
  );
}

export default App;