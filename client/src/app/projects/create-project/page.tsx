"use client";

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { useForm, SubmitHandler } from 'react-hook-form';
import { useCreateProjectMutation, useGetAllUserDetailsQuery } from '@/store/services/apiSlice';
import { useRouter } from 'next/navigation';

interface FormValues {
    projectTitle: string;
    severity: string;
    startDate: string;
    endDate: string;
    projectStatus: string;
    assignee: string;
    userId: string;
    projectImage: FileList;
}

const CreateProject: React.FC = () => {
    // Initialize React Hook Form
    const { register, handleSubmit, setValue, formState: { errors }, reset } = useForm<FormValues>();
    const [createProject, { isLoading, isSuccess }] = useCreateProjectMutation();
    const { data: usersData } = useGetAllUserDetailsQuery();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        console.log(usersData);
    }, [usersData]);

    // Handle form submission
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        setLoading(true);
        try {
            const response = await createProject(data).unwrap();
            console.log(response);

            if (isSuccess) {
                router.push("/projects");
                reset(); // Reset the form fields
            }
        } catch (error) {
            console.error("Form submission failed:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="sm:px-20">
            <div className="grid lg:grid-cols-3 md:grid-cols-2 grid-cols-1 gap-3">
                {/* Project Name */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Project Name</Label>
                    <Input
                        type="text"
                        placeholder="Enter Project Name"
                        {...register('projectTitle', { required: 'Project Name is required' })}
                    />
                    {errors.projectTitle && <p className="text-red-500 text-sm">{errors.projectTitle.message}</p>}
                </div>

                {/* Severity */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Severity</Label>
                    <Input
                        type="text"
                        placeholder="Enter Severity"
                        {...register('severity', { required: 'Severity is required' })}
                    />
                    {errors.severity && <p className="text-red-500 text-sm">{errors.severity.message}</p>}
                </div>

                {/* Start Date */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Start Date</Label>
                    <Input
                        type="date"
                        {...register('startDate', { required: 'Start Date is required' })}
                    />
                    {errors.startDate && <p className="text-red-500 text-sm">{errors.startDate.message}</p>}
                </div>

                {/* Project Image */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Project Image</Label>
                    <Input
                        type="file"
                        {...register('projectImage', { required: 'Project Image is required' })}
                    />
                    {errors.projectImage && <p className="text-red-500 text-sm">{errors.projectImage.message}</p>}
                </div>

                {/* End Date */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>End Date</Label>
                    <Input
                        type="date"
                        {...register('endDate', { required: 'End Date is required' })}
                    />
                    {errors.endDate && <p className="text-red-500 text-sm">{errors.endDate.message}</p>}
                </div>

                {/* Project Status */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Project Status</Label>
                    <select
                        {...register('projectStatus', { required: 'Project Status is required' })}
                        className="input"
                    >
                        <option value="">Select Status</option>
                        <option value="active">Active</option>
                        <option value="completed">Completed</option>
                        <option value="pending">Pending</option>
                    </select>
                    {errors.projectStatus && <p className="text-red-500 text-sm">{errors.projectStatus.message}</p>}
                </div>

                {/* Assignee */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>Assignee</Label>
                    <Input
                        type="text"
                        placeholder="Enter Assignee"
                        {...register('assignee', { required: 'Assignee is required' })}
                    />
                    {errors.assignee && <p className="text-red-500 text-sm">{errors.assignee.message}</p>}
                </div>

                {/* User ID */}
                <div className="grid w-full max-w-sm items-center gap-1.5">
                    <Label>User ID</Label>
                    <select {...register('userId', { required: 'User ID is required' })}>
                        {usersData?.users?.map((item) => (
                            <option key={item?._id} value={item?._id}>
                                {item?.username}
                            </option>
                        ))}
                    </select>
                    {errors.userId && <p className="text-red-500 text-sm">{errors.userId.message}</p>}
                </div>
            </div>
            {/* Submit Button */}
            <div className="mt-4">
                <Button
                    type="submit"
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                >
                    {loading ? "Submitting..." : "Submit"}
                </Button>
            </div>
        </div>
    );
};

export default CreateProject;
