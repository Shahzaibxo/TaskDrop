import React, { useState, useEffect } from 'react';
import { Plus, Trash2, GripVertical } from 'lucide-react';
import { useProjects } from '../contexts/ProjectContext';
import { Task, Column } from '../types';

const TaskBoard: React.FC = () => {
  const { currentProject, updateProject } = useProjects();
  const [columns, setColumns] = useState<Column[]>([]);
  const [draggedTask, setDraggedTask] = useState<Task | null>(null);
  const [draggedFrom, setDraggedFrom] = useState<string | null>(null);
  const [showAddTask, setShowAddTask] = useState(false);
  const [selectedColumn, setSelectedColumn] = useState<string>('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  useEffect(() => {
    if (currentProject) {
      setColumns(currentProject.columns);
    }
  }, [currentProject]);

  const updateColumns = (newColumns: Column[]) => {
    setColumns(newColumns);
    if (currentProject) {
      updateProject(currentProject.id, { columns: newColumns });
    }
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

  const handleDrop = (e: React.DragEvent, toColumn: string) => {
    e.preventDefault();
    
    if (!draggedTask || !draggedFrom || draggedFrom === toColumn) {
      setDraggedTask(null);
      setDraggedFrom(null);
      return;
    }

    const newColumns = columns.map(column => {
      if (column.id === draggedFrom) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== draggedTask.id)
        };
      }
      if (column.id === toColumn) {
        return {
          ...column,
          tasks: [...column.tasks, draggedTask]
        };
      }
      return column;
    });

    updateColumns(newColumns);
    setDraggedTask(null);
    setDraggedFrom(null);
  };

  const handleAddTask = () => {
    if (!newTask.title.trim() || !selectedColumn) return;

    const task: Task = {
      id: Date.now().toString(),
      title: newTask.title,
      description: newTask.description,
      priority: newTask.priority,
      createdAt: new Date()
    };

    const newColumns = columns.map(column => {
      if (column.id === selectedColumn) {
        return {
          ...column,
          tasks: [...column.tasks, task]
        };
      }
      return column;
    });

    updateColumns(newColumns);
    setNewTask({ title: '', description: '', priority: 'medium' });
    setShowAddTask(false);
    setSelectedColumn('');
  };

  const handleDeleteTask = (taskId: string, columnId: string) => {
    const newColumns = columns.map(column => {
      if (column.id === columnId) {
        return {
          ...column,
          tasks: column.tasks.filter(task => task.id !== taskId)
        };
      }
      return column;
    });

    updateColumns(newColumns);
  };

  const openAddTaskModal = (columnId: string) => {
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
    <div className="flex-1 bg-gradient-to-br from-indigo-50 via-white to-purple-50">
      <div className="p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">{currentProject.name}</h1>
          <p className="text-gray-600">{currentProject.description}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {columns.map(column => (
            <div
              key={column.id}
              className={`${column.bgColor} rounded-xl p-6 border-2 ${column.color} min-h-[500px] transition-all duration-200`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold text-gray-900">{column.title}</h2>
                <button
                  onClick={() => openAddTaskModal(column.id)}
                  className="p-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow duration-200 text-gray-600 hover:text-gray-900"
                >
                  <Plus size={20} />
                </button>
              </div>

              <div className="space-y-4">
                {column.tasks.map(task => (
                  <div
                    key={task.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, task, column.id)}
                    className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 cursor-move group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <GripVertical size={16} className="text-gray-400 group-hover:text-gray-600" />
                        <h3 className="font-medium text-gray-900">{task.title}</h3>
                      </div>
                      <button
                        onClick={() => handleDeleteTask(task.id, column.id)}
                        className="opacity-0 group-hover:opacity-100 p-1 rounded text-red-500 hover:bg-red-50 transition-all duration-200"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                    
                    {task.description && (
                      <p className="text-gray-600 text-sm mb-3">{task.description}</p>
                    )}
                    
                    <div className="flex justify-between items-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(task.priority)}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
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
      </div>
    </div>
  );
};

export default TaskBoard;