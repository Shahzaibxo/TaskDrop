
import axios from "axios";
import { toast } from "react-toastify";

export const axiosInstance = axios.create({
    baseURL: 'http://localhost:3100/api/v1',
    headers: {
        'Content-Type': 'application/json',
    },
});

const createAuthInstance = () => {
    const token = localStorage.getItem('token');
    return axios.create({
        baseURL: 'http://localhost:3100/api/v1',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': token ? `Bearer ${token}` : '',
        },
    });
};

export const SignupAxios = async (email: string, password: string, name: string) => {
    const response = await axiosInstance.post('/auth/user/signup', { email, password, name });
    if (response.status === 200 || response.status === 201) {
        toast.success('Signup successful!');
        return response.data;
    }
    toast.error('Failed to signup');
};

export const LoginAxios = async (email: string, password: string) => {
    const response = await axiosInstance.post('/auth/user/login', { email, password });
    if (response.status === 200 || response.status === 201) {
        toast.success('Login successful!');
        return response.data;
    }
    toast.error('Failed to login');
};

export const CreateProjectAxios = async (payload: any) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.post('/projects', payload);
    if (response.status === 200 || response.status === 201) {
        toast.success('Project created successfully!');
        return response;
    }
    toast.error('Failed to create project');
};

export const GetProjectsAxios = async (userId: string) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.get(`/projects/user/${userId}`);
    if (response.status === 200 || response.status === 201) {
        toast.success('Projects fetched successfully!');
        return response.data;
    }
    toast.error('Failed to fetch projects');
};

export const DeleteProjectAxios = async (projectId: string) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.delete(`/projects/${projectId}`);
    if (response.status === 200 || response.status === 201) {
        toast.success('Project deleted successfully!');
        return response.data;
    }
    toast.error('Failed to delete project');
};

export const UpdateProjectAxios = async (projectId: string, updates: any) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.patch(`/projects/${projectId}`, updates);
    if (response.status === 200 || response.status === 201) {
        toast.success('Project shared successfully!');
        return response.data;
    }
    toast.error('Failed to share project');
};

export const AddTaskAxios = async (payload: any) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.post(`/task`, payload);
    if (response.status === 200 || response.status === 201) {
        toast.success('Task added successfully!');
        return response.data;
    }
    toast.error('Failed to add task');
};

export const UpdateTaskAxios = async (taskId: string, payload: any) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.patch(`/task/${taskId}`, payload);
    if (response.status === 200 || response.status === 201) {
        toast.success('Task updated successfully!');
        return response.data;
    }
    toast.error('Failed to update task');
};

export const DeleteTaskAxios = async (taskId: string) => {
    const authInstance = createAuthInstance();
    const response = await authInstance.delete(`/task/${taskId}`);
    if (response.status === 200 || response.status === 201) {
        toast.success('Task deleted successfully!');
        return response.data;
    }
    toast.error('Failed to delete task');
};