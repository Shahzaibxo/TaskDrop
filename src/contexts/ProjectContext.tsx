import React, { createContext, useContext, useState, useEffect } from 'react';
import { Project } from '../types';
import { CreateProjectAxios, DeleteProjectAxios, GetProjectsAxios } from '../Axioscalls'
interface ProjectContextType {
  projects: Project[];
  currentProject: Project | null;
  setCurrentProject: (project: Project) => void;
  createProject: (name: string, description: string, memberEmails?: string[]) => void;
  updateProject: (projectId: string, updates: Partial<Project>) => void;
  deleteProject: (projectId: string) => void;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};

export const defaultColumns: any[] = [
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
    const initializeProjects = async () => {
      const user = JSON.parse(localStorage.getItem('user') || '{}');
      const response = await GetProjectsAxios(user._id);
      // Ensure each project has a tasks array
      const projectsWithTasks = response.data.map((project: any) => ({
        ...project,
        tasks: project.tasks || []
      }));
      setProjects(projectsWithTasks);
      setCurrentProject(projectsWithTasks[0]);
      localStorage.setItem('projects', JSON.stringify(projectsWithTasks));
    };

    initializeProjects();
  }, []);

  const createProject = async (name: string, description: string, memberEmails: string[] = []) => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const payload = {
      name,
      description,
      members: memberEmails,
      createdBy: user._id
    }

    
    const response = await CreateProjectAxios(payload);
    if(response?.status === 200 || response?.status === 201){
    const newProject: Project = {
      _id: response.data.data._id,
      name: response.data.data.name,
      description,
      members: response.data.data.members,
      tasks: [],
      createdBy: user._id,
    };
    const updatedProjects = [...projects, newProject];
    setProjects(updatedProjects);
    setCurrentProject(newProject);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
    }
  };

  const updateProject = (projectId: string, updates: Partial<Project>) => {
    const updatedProjects = projects.map(project =>
      project._id === projectId
        ? { ...project, ...updates, updatedAt: new Date() }
        : project
    );
    
    setProjects(updatedProjects);
    
    if (currentProject?._id === projectId) {
      setCurrentProject({ ...currentProject, ...updates });
    }
    
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };

  const deleteProject = async (projectId: string) => {
    const updatedProjects = projects.filter(project => project._id !== projectId);
    setProjects(updatedProjects);
    
    if (currentProject?._id === projectId) {
      setCurrentProject(updatedProjects.length > 0 ? updatedProjects[0] : null);
    }
    await DeleteProjectAxios(projectId);
    localStorage.setItem('projects', JSON.stringify(updatedProjects));
  };


  return (
    <ProjectContext.Provider value={{
      projects,
      currentProject,
      setCurrentProject,
      createProject,
      updateProject,
      deleteProject
    }}>
      {children}
    </ProjectContext.Provider>
  );
};