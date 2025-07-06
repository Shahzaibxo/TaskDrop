import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project, Column, ProjectMember } from '../types';

interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  createProject: (name: string, description: string, memberEmails?: string[]) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
  shareProject: (projectId: string, email: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

const defaultColumns: Column[] = [
  {
    id: 'todo',
    title: 'To Do',
    color: 'border-blue-500',
    bgColor: 'bg-blue-50',
    tasks: []
  },
  {
    id: 'inprogress',
    title: 'In Progress',
    color: 'border-orange-500',
    bgColor: 'bg-orange-50',
    tasks: []
  },
  {
    id: 'done',
    title: 'Done',
    color: 'border-green-500',
    bgColor: 'bg-green-50',
    tasks: []
  }
];

export const ProjectProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [currentProject, setCurrentProject] = useState<Project | null>(null);

  useEffect(() => {
    const savedProjects = localStorage.getItem('projects');
    if (savedProjects) {
      const parsedProjects = JSON.parse(savedProjects);
      setProjects(parsedProjects);
      if (parsedProjects.length > 0) {
        setCurrentProject(parsedProjects[0]);
      }
    } else {
      // Create default project
      const defaultProject: Project = {
        id: '1',
        name: 'My First Project',
        description: 'Welcome to your task management board!',
        columns: defaultColumns,
        members: [],
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProjects([defaultProject]);
      setCurrentProject(defaultProject);
      localStorage.setItem('projects', JSON.stringify([defaultProject]));
    }
  }, []);

  const createProject = (name: string, description: string, memberEmails: string[] = []) => {
    const members: ProjectMember[] = memberEmails
      .filter(email => email.trim() !== '')
      .map(email => ({
        id: Date.now().toString() + Math.random(),
        email: email.trim(),
        name: email.split('@')[0],
        role: 'member' as const,
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
      }));

    const newProject: Project = {
      id: Date.now().toString(),
      name,
      description,
      columns: defaultColumns,
      members,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project =>
      project.id === projectId
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    );
    
    setProjects(updatedProjects);
    
    if (currentProject?.id === projectId) {
      setCurrentProject({ ...currentProject, ...updates, updatedAt: new Date() });
    }
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const deleteProject = (projectId: string) => {
    const updatedProjects = projects.filter(project => project.id !== projectId);
    setProjects(updatedProjects);
    
    if (currentProject?.id === projectId) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const shareProject = async (projectId: string, email: string) => {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newMember = {
      id: Date.now().toString(),
      email,
      name: email.split('@')[0],
      role: 'member' as const,
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${email}`
    };

    updateProject(projectId, {
      members: [...(projects.find(p => p.id === projectId)?.members || []), newMember]
    });
  };

  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      createProject,
      updateProject,
      deleteProject,
      shareProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};