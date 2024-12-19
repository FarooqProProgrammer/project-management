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
    taskImages: string[];  // New field to hold image files
}

const CreateTask: React.FC = () => {
   // State for loading, success, and error handling
   const [isLoading, setIsLoading] = useState(false);
   const [usersData, setUsersData] = useState<any>([]);
   const [projectsData, setProjectsData] = useState<any>([]);
   const [imagesUrl, setUrl] = useState<File[]>([]);  // Changed to File[] to hold actual files
 
   const { register, handleSubmit, formState: { errors } } = useForm<FormValues>();
   const router = useRouter();
 
   // Fetch users and projects when the component is mounted
   useEffect(() => {
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
 
   const HandleImageChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files) {
      // Create a FormData object to send the selected files to the backend
      const formData = new FormData();
      Array.from(files).forEach((file) => {
        formData.append("images", file);  // 'images' is the key for the file upload
      });

      try {
        // Send the files to the server
        const response = await fetch("http://localhost:3001/api/upload", {
          method: "POST",
          body: formData,
        });

        if (response.ok) {
          // If the response is successful, parse the response and extract file URLs
          const data = await response.json();
          setUrl(data.fileUrls); // Store the returned URLs in state
        } else {
          console.error("Failed to upload images.");
        }
      } catch (error) {
        console.error("Error during image upload:", error);
      }
    }
  };
 
   // Handle form submission
   const onSubmit: SubmitHandler<FormValues> = async (data) => {
    setIsLoading(true);
  
    // Log the form data (optional for debugging)
    console.log({ ...data, imagesUrl });
  
  
  
    // Send the files along with the necessary task data as a JSON payload
    const payload = {
      taskName: data.taskName,
      priority: data.priority,
      taskStartDate: data.taskStartDate,
      taskEndDate: data.taskEndDate,
      taskStatus: data.taskStatus,
      assignee: data.assignee,
      project: data.project,
      module: data.module || '',
      taskDescription: data.taskDescription,
      taskImages:imagesUrl
    };
  
    try {
      const response = await fetch('http://localhost:3001/api/task', {
        method: 'POST',
        body: JSON.stringify(payload), // Send JSON data for the rest of the task
        headers: {
          'Content-Type': 'application/json', // Content type for JSON
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
            <div className="grid lg:grid-cols-2 md:grid-cols-2 grid-cols-1 gap-3">
                {/* Task Name */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Task Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter Task Name"
                        {...register('taskName', { required: 'Task Name is required' })}
                    />
                    {errors.taskName && <p className="text-red-500 text-sm">{errors.taskName.message}</p>}
                </div>

                {/* Module */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Module</Label>
                    <Input
                        type="text"
                        placeholder="Enter Module"
                        {...register('module', { required: 'Module Name is required' })}
                    />
                    {errors.taskName && <p className="text-red-500 text-sm">{errors.taskName.message}</p>}
                </div>

                {/* Priority */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Priority</Label>
                    <Input
                        type="text"
                        placeholder="Enter Priority"
                        {...register('priority', { required: 'Priority is required' })}
                    />
                    {errors.priority && <p className="text-red-500 text-sm">{errors.priority.message}</p>}
                </div>

                {/* Task Start Date */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Task Start Date</Label>
                    <Input
                        type="date"
                        {...register('taskStartDate', { required: 'Task Start Date is required' })}
                    />
                    {errors.taskStartDate && <p className="text-red-500 text-sm">{errors.taskStartDate.message}</p>}
                </div>

                {/* Task End Date */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Task End Date</Label>
                    <Input
                        type="date"
                        {...register('taskEndDate', { required: 'Task End Date is required' })}
                    />
                    {errors.taskEndDate && <p className="text-red-500 text-sm">{errors.taskEndDate.message}</p>}
                </div>

                {/* Task Status */}
                <div className="grid w-full max-w-full items-center gap-1.5">
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
                <div className="grid w-full max-w-full items-center gap-1.5">
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
                <div className="grid w-full max-w-full items-center gap-1.5">
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
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Task Description</Label>
                    <Textarea
                        {...register('taskDescription', { required: 'Task Description is required' })}
                        placeholder="Enter Task Description"
                        className="input"
                    />
                    {errors.taskDescription && <p className="text-red-500 text-sm">{errors.taskDescription.message}</p>}
                </div>

                {/* Task Images (Multiple Upload) */}
                <div className="grid w-full max-w-full items-center gap-1.5">
                    <Label>Task Images</Label>
                    <Input
                        type="file"
                        accept="image/*"
                        multiple
                        onChange={HandleImageChange}
                    


                       
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
