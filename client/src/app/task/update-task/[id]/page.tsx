"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCreateTaskMutation, useGetAllProductsQuery, useGetAllUserDetailsQuery, useUpdateTaskMutation } from '@/store/services/apiSlice';
import { useRouter } from 'next/navigation';

const UpdateTask: React.FC = () => {
    const [taskId, setTaskId] = useState<string | null>(null);  // Store taskId for later use

    // Initialize React Hook Form
    const { register, handleSubmit, formState: { errors }, setValue } = useForm();
    const { data: usersData } = useGetAllUserDetailsQuery();
    const { data } = useGetAllProductsQuery(); // Get all products (assumed projects are here)

    const [updateTask, { isLoading, isSuccess }] = useUpdateTaskMutation();

    const router = useRouter();

    // Get taskId from URL (using query params, e.g., '/tasks/[id]')
    useEffect(() => {
        const { id } = router.query;
        if (id) {
            setTaskId(id as string);
        }
    }, [router.query]);

    useEffect(() => {
        if (taskId) {
            // Fetch and pre-fill the form data based on the taskId (this is just a placeholder logic)
            // You can fetch data here using `taskId` and then set values in form
            console.log(`Fetching data for task with ID: ${taskId}`);
        }
    }, [taskId]);

    // Handle form submission
    const onSubmit: SubmitHandler = async (data) => {
        const formData = { ...data, taskId };

        try {
            const response = await updateTask(formData).unwrap();
            console.log(response);

            if (isSuccess) {
                // Redirect after successful update
                router.push("/tasks");
            }
        } catch (error) {
            console.error("Task update failed", error);
        }
    };

    return (
        <div className="sm:px-20">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
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
                        {...register('module')}
                    />
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
                            usersData?.users?.map(({ _id, username }) => (
                                <option key={_id} value={_id}>{username}</option>
                            ))
                        }
                    </select>
                    {errors.assignee && <p className="text-red-500 text-sm">{errors.assignee.message}</p>}
                </div>

                {/* Project */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Project</Label>
                    <select {...register('project')}>
                        <option value="">Select Project</option>
                        {
                            data?.projects?.map(({ _id, projectTitle }) => (
                                <option key={_id} value={_id}>{projectTitle}</option>
                            ))
                        }
                    </select>
                </div>

                {/* Task Description */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Task Description</Label>
                    <textarea
                        {...register('taskDescription', { required: 'Task Description is required' })}
                        placeholder="Enter Task Description"
                        className="input"
                    />
                    {errors.taskDescription && <p className="text-red-500 text-sm">{errors.taskDescription.message}</p>}
                </div>

                {/* Submit Button */}
                <div>
                    <Button type="submit" onClick={handleSubmit(onSubmit)} disabled={isLoading}>Submit</Button>
                </div>
            </div>
        </div>
    );
};

export default UpdateTask;
