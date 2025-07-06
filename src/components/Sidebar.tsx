import React, { useState } from 'react';
import { Plus, FolderOpen, Settings, Share2, Trash2, Users, X, Edit2, Check, UserPlus } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Project } from '../types';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const { projects, currentProject, setCurrentProject, createProject, deleteProject, updateProject } = useProjects();
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showShareModal, setShowShareModal] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [newProjectDescription, setNewProjectDescription] = useState('');
  const [newProjectMembers, setNewProjectMembers] = useState<string[]>(['']);
  const [shareEmail, setShareEmail] = useState('');
  const [shareLoading, setShareLoading] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');

  const handleCreateProject = () => {
    if (!newProjectName.trim()) return;
    
    const memberEmails = newProjectMembers.filter(email => email.trim() !== '');
    createProject(newProjectName, newProjectDescription, memberEmails);
    setNewProjectName('');
    setNewProjectDescription('');
    setNewProjectMembers(['']);
    setShowCreateModal(false);
  };

  const handleShareProject = async () => {
    if (!shareEmail.trim() || !currentProject) return;
    
    setShareLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setShareEmail('');
      setShowShareModal(false);
    } catch (error) {
      console.error('Failed to share project:', error);
    } finally {
      setShareLoading(false);
    }
  };

  const addMemberField = () => {
    setNewProjectMembers([...newProjectMembers, '']);
  };

  const updateMemberEmail = (index: number, email: string) => {
    const updated = [...newProjectMembers];
    updated[index] = email;
    setNewProjectMembers(updated);
  };

  const removeMemberField = (index: number) => {
    if (newProjectMembers.length > 1) {
      setNewProjectMembers(newProjectMembers.filter((_, i) => i !== index));
    }
  };

  const startEditing = (project: Project) => {
    setEditingProject(project.id);
    setEditName(project.name);
    setEditDescription(project.description);
  };

  const saveEditing = () => {
    if (editingProject && editName.trim()) {
      updateProject(editingProject, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingProject(null);
    }
  };

  const cancelEditing = () => {
    setEditingProject(null);
    setEditName('');
    setEditDescription('');
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed lg:relative inset-y-0 left-0 z-50 lg:z-0
        w-80 bg-white border-r border-gray-200 h-full flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex-1 flex items-center space-x-2 bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            <Plus size={16} />
            <span>New Project</span>
          </button>
          <button
            onClick={onClose}
            className="ml-3 p-2 text-gray-400 hover:text-gray-600 lg:hidden"
          >
            <X size={20} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          <div className="space-y-2">
            {projects.map((project) => (
              <div
                key={project.id}
                className={`group relative p-4 rounded-lg cursor-pointer transition-colors ${
                  currentProject?.id === project.id
                    ? 'bg-blue-100 border border-blue-200'
                    : 'hover:bg-gray-100'
                }`}
                onClick={() => {
                  setCurrentProject(project);
                  onClose();
                }}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-2">
                      <FolderOpen size={16} className="text-gray-500 flex-shrink-0" />
                      {editingProject === project.id ? (
                        <input
                          type="text"
                          value={editName}
                          onChange={(e) => setEditName(e.target.value)}
                          className="text-sm font-medium text-gray-900 bg-transparent border-b border-blue-500 focus:outline-none flex-1"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') saveEditing();
                            if (e.key === 'Escape') cancelEditing();
                          }}
                          onClick={(e) => e.stopPropagation()}
                          autoFocus
                        />
                      ) : (
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {project.name}
                        </h3>
                      )}
                    </div>
                    
                    {editingProject === project.id ? (
                      <textarea
                        value={editDescription}
                        onChange={(e) => setEditDescription(e.target.value)}
                        className="text-xs text-gray-500 bg-transparent border border-blue-500 rounded p-1 w-full resize-none"
                        rows={2}
                        onClick={(e) => e.stopPropagation()}
                        placeholder="Project description..."
                      />
                    ) : (
                      <p className="text-xs text-gray-500 line-clamp-2">
                        {project.description || 'No description'}
                      </p>
                    )}
                    
                    {project.members.length > 0 && (
                      <div className="flex items-center space-x-1 mt-2">
                        <Users size={12} className="text-gray-400" />
                        <span className="text-xs text-gray-400">
                          {project.members.length} member{project.members.length !== 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {currentProject?.id === project.id && (
                  <div className="flex items-center justify-between mt-3 pt-2 border-t border-gray-200">
                    {editingProject === project.id ? (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            saveEditing();
                          }}
                          className="p-1 text-green-600 hover:bg-green-50 rounded"
                          title="Save changes"
                        >
                          <Check size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            cancelEditing();
                          }}
                          className="p-1 text-gray-400 hover:bg-gray-50 rounded"
                          title="Cancel"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex space-x-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing(project);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          title="Edit project"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setShowShareModal(true);
                          }}
                          className="p-1 text-gray-400 hover:text-blue-500 rounded"
                          title="Share project"
                        >
                          <Share2 size={14} />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                          }}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="Project settings"
                        >
                          <Settings size={14} />
                        </button>
                      </div>
                    )}
                    
                    {projects.length > 1 && editingProject !== project.id && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          if (confirm('Are you sure you want to delete this project?')) {
                            deleteProject(project.id);
                          }
                        }}
                        className="p-1 text-gray-400 hover:text-red-500 rounded"
                        title="Delete project"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Create Project Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">Create New Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Project Name
                </label>
                <input
                  type="text"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter project name..."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                  placeholder="Enter project description..."
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-medium text-gray-700">
                    Invite Members
                  </label>
                  <button
                    onClick={addMemberField}
                    className="text-blue-500 hover:text-blue-600 text-sm flex items-center space-x-1"
                  >
                    <UserPlus size={14} />
                    <span>Add</span>
                  </button>
                </div>
                <div className="space-y-2">
                  {newProjectMembers.map((email, index) => (
                    <div key={index} className="flex space-x-2">
                      <input
                        type="email"
                        value={email}
                        onChange={(e) => updateMemberEmail(index, e.target.value)}
                        className="flex-1 p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                        placeholder="Enter email address..."
                      />
                      {newProjectMembers.length > 1 && (
                        <button
                          onClick={() => removeMemberField(index)}
                          className="p-2 text-red-500 hover:text-red-600"
                        >
                          <X size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Members will receive an invitation to join the project
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateProject}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Share Project Modal */}
      {showShareModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Share Project</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter email address..."
                />
              </div>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                <p className="text-blue-800 text-sm">
                  The user will receive an invitation to collaborate on "{currentProject?.name}".
                </p>
              </div>

              {currentProject?.members && currentProject.members.length > 0 && (
                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Current Members</h4>
                  <div className="space-y-2 max-h-32 overflow-y-auto">
                    {currentProject.members.map((member) => (
                      <div key={member.id} className="flex items-center space-x-2 text-sm">
                        <img
                          src={member.avatar}
                          alt={member.name}
                          className="w-6 h-6 rounded-full"
                        />
                        <span className="text-gray-700">{member.name}</span>
                        <span className="text-gray-500">({member.email})</span>
                        <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {member.role}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowShareModal(false)}
                className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
              >
                Cancel
              </button>
              <button
                onClick={handleShareProject}
                disabled={shareLoading}
                className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200 disabled:opacity-50"
              >
                {shareLoading ? 'Sharing...' : 'Send Invitation'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Sidebar;