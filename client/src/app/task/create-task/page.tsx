"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface FormValues {
    taskName: string;
    priority: string;
    taskStartDate: string;
    taskEndDate: string;
    taskStatus: string;
    assignee: string;
    project: string;
    module?: string;
    taskDescription: string;
    taskImages: FileList;  // New field to hold image files
}

const CreateTask: React.FC = () => {
    // State for loading, success, and error handling
    const [isLoading, setIsLoading] = useState(false);
    const [usersData, setUsersData] = useState<any>([]);
    const [projectsData, setProjectsData] = useState<any>([]);

    const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
    const router = useRouter();

    useEffect(() => {
        // Fetch users and projects when the component is mounted
        const fetchData = async () => {
            try {
                const usersResponse = await fetch('http://localhost:3001/api/auth/get-all-users');
                const users = await usersResponse.json();
                setUsersData(users);

                const projectsResponse = await fetch('http://localhost:3001/api/get-all-project');
                const projects = await projectsResponse.json();
                setProjectsData(projects);
            } catch (error) {
                console.error('Error fetching data:', error);
            }
        };
        fetchData();
    }, []);

    // Handle form submission
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setIsLoading(true);
    
        // Create a FormData object to append both text data and file data
        const formData = new FormData();
        formData.append('taskName', data.taskName);
        formData.append('priority', data.priority);
        formData.append('taskStartDate', data.taskStartDate);
        formData.append('taskEndDate', data.taskEndDate);
        formData.append('taskStatus', data.taskStatus);
        formData.append('assignee', data.assignee);
        formData.append('project', data.project);
        formData.append('module', data.module || '');
        formData.append('taskDescription', data.taskDescription);
        formData.append('taskImages', data.taskImages); // Append each file to FormData
    
        
    
        try {
            const response = await fetch('http://localhost:3001/api/task', {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                },
            });
    
            const result = await response.json();
    
            if (response.ok) {
                // Redirect to the task list page after successful creation
                router.push("/task");
            } else {
                console.error('Error creating task:', result);
            }
        } catch (error) {
            console.error("Task creation failed", error);
        } finally {
            setIsLoading(false);
        }
    };
    

    return (
        <div className="sm:px-20">
            <div className="grid lg:grid-cols-4 md:grid-cols-2 grid-cols-1 gap-3">
                {/* Task Name */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter Task Name"
                        {...register('taskName', { required: 'Task Name is required' })}
                    />
                    {errors.taskName && <p className="text-red-500 text-sm">{errors.taskName.message}</p>}
                </div>

                {/* Module */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Module</Label>
                    <Input
                        type="text"
                        placeholder="Enter Module"
                        {...register('module', { required: 'Module Name is required' })}
                    />
                    {errors.taskName && <p className="text-red-500 text-sm">{errors.taskName.message}</p>}
                </div>

                {/* Priority */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Priority</Label>
                    <Input
                        type="text"
                        placeholder="Enter Priority"
                        {...register('priority', { required: 'Priority is required' })}
                    />
                    {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
                </div>

                {/* Task Start Date */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Start Date</Label>
                    <Input
                        type="date"
                        {...register('taskStartDate', { required: 'Task Start Date is required' })}
                    />
                    {errors.taskStartDate && <p className="text-red-500 text-sm">{errors.taskStartDate.message}</p>}
                </div>

                {/* Task End Date */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task End Date</Label>
                    <Input
                        type="date"
                        {...register('taskEndDate', { required: 'Task End Date is required' })}
                    />
                    {errors.taskEndDate && <p className="text-red-500 text-sm">{errors.taskEndDate.message}</p>}
                </div>

                {/* Task Status */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Status</Label>
                    <select
                        {...register('taskStatus', { required: 'Task Status is required' })}
                        className="input"
                    >
                        <option value="">Select Status</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                    </select>
                    {errors.taskStatus && <p className="text-red-500 text-sm">{errors.taskStatus.message}</p>}
                </div>

                {/* Assignee */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Assignee</Label>
                    <select
                        {...register('assignee', { required: 'Assignee is required' })}
                        className="input"
                    >
                        <option value="">Select Assignee</option>
                        {
                            usersData?.users?.map((item: any) => (
                                <option key={item._id} value={item._id}>{item.username}</option>
                            ))
                        }
                    </select>
                    {errors.assignee && <p className="text-red-500 text-sm">{errors.assignee.message}</p>}
                </div>

                {/* Project (Optional) */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Project</Label>
                    <select {...register('project')}>
                        <option value="">Select Project</option>
                        {
                            projectsData?.projects?.map((item: any, index: number) => (
                                <option key={item._id} value={item._id}>{item.projectTitle}</option>
                            ))
                        }
                    </select>
                </div>

                {/* Task Description */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Description</Label>
                    <Textarea
                        {...register('taskDescription', { required: 'Task Description is required' })}
                        placeholder="Enter Task Description"
                        className="input"
                    />
                    {errors.taskDescription && <p className="text-red-500 text-sm">{errors.taskDescription.message}</p>}
                </div>

                {/* Task Images (Multiple Upload) */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Images</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        {...register('taskImages', { required: 'Please upload images' })}
                    />
                    {errors.taskImages && <p className="text-red-500 text-sm">{errors.taskImages.message}</p>}
                </div>
            </div>
            <div className='mt-2'>
                <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isLoading}>
                    {isLoading ? 'Submitting...' : 'Submit'}
                </Button>
            </div>
        </div>
    );
};

export default CreateTask;
