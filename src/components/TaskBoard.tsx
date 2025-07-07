import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical, User, Edit2 } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Task, ProjectMember } from '../types';
import { AddTaskAxios, DeleteTaskAxios, UpdateTaskAxios } from '../Axioscalls';

interface Column {
  id: 'todo' | 'in_progress' | 'done';
  title: string;
  color: string;
  bgColor: string;
}

const TaskBoard: React.FC = () => {
  const { currentProject, updateProject } = useProjects();
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [showEditTask, setShowEditTask] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedColumn, setSelectedColumn] = useState<'todo' | 'in_progress' | 'done'>('todo');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '' as string
  });
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high',
    assignedTo: '' as string,
    status: 'todo' as 'todo' | 'in_progress' | 'done'
  });
  const currentUser = JSON.parse(localStorage.getItem('user') || '{}');
  // Fixed columns configuration
  const columns: Column[] = [
    {
      id: 'todo',
      title: 'To Do',
      color: 'border-blue-500',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'in_progress',
      title: 'In Progress',
      color: 'border-orange-500',
      bgColor: 'bg-orange-50'
    },
    {
      id: 'done',
      title: 'Done',
      color: 'border-green-500',
      bgColor: 'bg-green-50'
    }
  ];

  // Get tasks for each column based on their status
  const getTasksForColumn = (columnId: 'todo' | 'in_progress' | 'done'): Task[] => {
    if (!currentProject || !currentProject.tasks) return [];
    return currentProject.tasks.filter(task => task.status === columnId);
  };

  // Get member name by ID
  const getMemberName = (memberId: string): string => {
    if (!currentProject?.members) return 'Unassigned';
    const member = currentProject.members.find(m => m._id === memberId);
    return member ? member.name : 'Unassigned';
  };

  // Get member avatar by ID
  const getMemberAvatar = (memberId: string): string => {
    if (!currentProject?.members) return '';
    const member = currentProject.members.find(m => m._id === memberId);
    return member?.avatar || '';
  };

  const handleDragStart = (e: React.DragEvent, task: Task, fromColumn: string) => {
    setDraggedTask(task);
    setDraggedFrom(fromColumn);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = async (e: React.DragEvent, toColumn: 'todo' | 'in_progress' | 'done') => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom || draggedFrom === toColumn || !currentProject) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    try {
      
      // Update the task's status locally
      const updatedTasks = (currentProject.tasks || []).map(task => 
        task._id === draggedTask._id 
          ? { ...task, status: toColumn }
          : task
      );

      // Update the project with new tasks
      updateProject(currentProject._id, { tasks: updatedTasks });
      // Update task status via API
      await UpdateTaskAxios(draggedTask._id, {
        status: toColumn,
        userId: currentUser._id
      });

    } catch (error) {
      console.error('Failed to update task status:', error);
    }
    
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleAddTask = async () => {
    if (!newTask.title.trim() || !currentProject) return;
    const response = await AddTaskAxios({
      title: newTask.title, 
      description: newTask.description, 
      priority: newTask.priority, 
      status: selectedColumn, 
      projectId: currentProject._id,
      assignedTo: newTask.assignedTo || undefined,
      userId: currentUser._id
    });

    const task: Task = {
      _id: response.data._id,
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      status: selectedColumn,
      assignedTo: newTask.assignedTo || undefined
    };

    const updatedTasks = [...(currentProject.tasks || []), task];
    updateProject(currentProject._id, { tasks: updatedTasks });
    
    setNewTask({ title: '', description: '', priority: 'medium', assignedTo: '' });
    setShowAddTask(false);
    setSelectedColumn('todo');
  };

  const handleEditTask = async () => {
    if (!editTask.title.trim() || !editingTask || !currentProject) return;
    
    try {
      await UpdateTaskAxios(editingTask._id, {
        title: editTask.title,
        description: editTask.description,
        priority: editTask.priority,
        status: editTask.status,
        assignedTo: editTask.assignedTo || undefined,
        userId: currentUser._id
      });

      // Update the task locally
      const updatedTasks = (currentProject.tasks || []).map(task => 
        task._id === editingTask._id 
          ? { 
              ...task, 
              title: editTask.title,
              description: editTask.description,
              priority: editTask.priority,
              status: editTask.status,
              assignedTo: editTask.assignedTo || undefined
            }
          : task
      );

      updateProject(currentProject._id, { tasks: updatedTasks });
      
      setShowEditTask(false);
      setEditingTask(null);
      setEditTask({ title: '', description: '', priority: 'medium', assignedTo: '', status: 'todo' });
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const openEditTaskModal = (task: Task) => {
    setEditingTask(task);
    setEditTask({
      title: task.title,
      description: task.description,
      priority: task.priority,
      assignedTo: task.assignedTo || '',
      status: task.status
    });
    setShowEditTask(true);
  };

  const handleDeleteTask = async (taskId: string) => {
    if (!currentProject) return;

    const updatedTasks = (currentProject.tasks || []).filter(task => task._id !== taskId);
    updateProject(currentProject._id, { tasks: updatedTasks });

    await DeleteTaskAxios(taskId);
  };

  const openAddTaskModal = (columnId: 'todo' | 'in_progress' | 'done') => {
    setSelectedColumn(columnId);
    setShowAddTask(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'low': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (!currentProject) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-semibold text-gray-900 mb-2">No Project Selected</h2>
          <p className="text-gray-600">Select a project from the sidebar to get started.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50" style={{ overflowY: 'auto' }}>
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProject.name}</h1>
          <p className="text-gray-600">{currentProject.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map(column => {
            const columnTasks = getTasksForColumn(column.id);
            
            return (
              <div
                key={column.id}
                className={`${column.bgColor} rounded-xl p-6 border-2 ${column.color} min-h-[500px] transition-all duration-200`}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, column.id)}
              >
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold text-gray-900">{column.title}</h2>
                  {currentProject.createdBy === currentUser._id && (
                      <button
                      onClick={() => openAddTaskModal(column.id)}
                      className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-600 hover:text-gray-900"
                      >
                        <Plus size={20} />
                      </button>
                  )}
                </div>

                <div className="space-y-4">
                  {columnTasks.map(task => (
                    <div
                      key={task._id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, task, column.id)}
                      className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move group"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <GripVertical size={16} className="text-gray-400 group-hover:text-gray-600" />
                          <h3 className="font-medium text-gray-900">{task.title}</h3>
                        </div>
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <button
                            onClick={() => openEditTaskModal(task)}
                            className="p-1 rounded text-blue-500 hover:bg-blue-50 transition-all duration-200"
                          >
                            <Edit2 size={16} />
                          </button>
                          <button
                            onClick={() => handleDeleteTask(task._id)}
                            className="p-1 rounded text-red-500 hover:bg-red-50 transition-all duration-200"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                      
                      {task.description && (
                        <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                      )}
                      
                      <div className="flex justify-between items-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        
                        {/* Assigned Member Display */}
                        <div className="flex items-center gap-2">
                          {task.assignedTo ? (
                            <div className="flex items-center gap-1">
                              {getMemberAvatar(task.assignedTo) ? (
                                <img 
                                  src={getMemberAvatar(task.assignedTo)} 
                                  alt={getMemberName(task.assignedTo)}
                                  className="w-6 h-6 rounded-full"
                                />
                              ) : (
                                <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
                                  <User size={12} className="text-gray-600" />
                                </div>
                              )}
                              <span className="text-xs text-gray-600">{getMemberName(task.assignedTo)}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Unassigned</span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>

        {/* Add Task Modal */}
        {showAddTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Add New Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={newTask.title}
                    onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={newTask.description}
                    onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    placeholder="Enter task description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={newTask.priority}
                    onChange={(e) => setNewTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={newTask.assignedTo}
                    onChange={(e) => setNewTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {currentProject.members?.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => setShowAddTask(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAddTask}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Add Task
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Edit Task Modal */}
        {showEditTask && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl p-6 w-full max-w-md mx-4">
              <h3 className="text-lg font-semibold mb-4">Edit Task</h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Task Title
                  </label>
                  <input
                    type="text"
                    value={editTask.title}
                    onChange={(e) => setEditTask(prev => ({ ...prev, title: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter task title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editTask.description}
                    onChange={(e) => setEditTask(prev => ({ ...prev, description: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent h-24 resize-none"
                    placeholder="Enter task description..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={editTask.priority}
                    onChange={(e) => setEditTask(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Status
                  </label>
                  <select
                    value={editTask.status}
                    onChange={(e) => setEditTask(prev => ({ ...prev, status: e.target.value as 'todo' | 'in_progress' | 'done' }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="todo">To Do</option>
                    <option value="in_progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Assign To
                  </label>
                  <select
                    value={editTask.assignedTo}
                    onChange={(e) => setEditTask(prev => ({ ...prev, assignedTo: e.target.value }))}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Unassigned</option>
                    {currentProject.members?.map(member => (
                      <option key={member._id} value={member._id}>
                        {member.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowEditTask(false);
                    setEditingTask(null);
                    setEditTask({ title: '', description: '', priority: 'medium', assignedTo: '', status: 'todo' });
                  }}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors duration-200"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditTask}
                  className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors duration-200"
                >
                  Update Task
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TaskBoard;