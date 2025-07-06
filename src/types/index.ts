export interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  createdAt: Date;
}

export interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
  bgColor: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  columns: Column[];
  members: ProjectMember[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProjectMember {
  id: string;
  email: string;
  name: string;
  role: 'owner' | 'admin' | 'member';
  avatar?: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
}