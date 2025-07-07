export interface Task {
  _id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignedTo?: string;
  status: 'todo' | 'in_progress' | 'done';
}


export interface Project {
  _id: string;
  name: string;
  description: string;
  members: ProjectMember[];
  tasks: Task[];
  createdBy: string;
}

export interface ProjectMember {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}

export interface User {
  _id: string;
  email: string;
  name: string;
  avatar?: string;
}