"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import axios from "axios"

interface ForgotPasswordFormValues {
    email: string;
    newPassword: string;
    confirmPassword: string;
}

const ForgotPassword: React.FC = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm<ForgotPasswordFormValues>();
    const router = useRouter();

    // Handle forgot password submission
    const onSubmit = async (data: ForgotPasswordFormValues) => {
        console.log("Password reset data:", data); // Log email and passwords for reset



        const response = await axios.post("http://localhost:3001/api/auth/forgot-password", {
            email: data.email,
            password: data.newPassword
        });

        console.log(response?.data)

        if(response?.data?.statusCode == 200) { 
            router.push("/auth/signin")
        }



    };

    return (
        <div className="w-full min-h-screen flex justify-center items-start">
            <div className="sm:w-[50%] flex flex-col space-y-5 justify-center items-center sm:h-[500px] rounded-2xl h-auto bg-white p-5">
                <h2 className="text-2xl font-bold">Reset Your Password</h2>
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col space-y-5 items-center"
                >
                    {/* Email Field */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Enter your email address</Label>
                        <Input
                            type="email"
                            id="email"
                            placeholder="Email"
                            {...register('email', {
                                required: 'Email is required',
                                pattern: {
                                    value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                                    message: 'Invalid email address',
                                },
                            })}
                        />
                        {errors.email && (
                            <p className="text-red-500 text-sm">{errors.email.message}</p>
                        )}
                    </div>

                    {/* New Password Field */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="newPassword">New Password</Label>
                        <Input
                            type="password"
                            id="newPassword"
                            placeholder="New Password"
                            {...register('newPassword', {
                                required: 'New password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        {errors.newPassword && (
                            <p className="text-red-500 text-sm">{errors.newPassword.message}</p>
                        )}
                    </div>

                    {/* Confirm Password Field */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="confirmPassword">Confirm Password</Label>
                        <Input
                            type="password"
                            id="confirmPassword"
                            placeholder="Confirm Password"
                            {...register('confirmPassword', {
                                required: 'Please confirm your password',
                                validate: (value) =>
                                    value === watch('newPassword') || 'Passwords do not match',
                            })}
                        />
                        {errors.confirmPassword && (
                            <p className="text-red-500 text-sm">{errors.confirmPassword.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Button type="submit">Reset Password</Button>
                    </div>

                    {/* Link to Login Page */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Link href="/auth/login" className="text-blue-500 text-sm">
                            Remembered your password? Go back to login
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ForgotPassword;
