"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLoginUserMutation } from '@/store/services/apiSlice';
import React from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';
import { toast } from 'react-toastify';  // Import the toast function
import 'react-toastify/dist/ReactToastify.css'; // Import the styles
import Cookies from 'js-cookie';  // Import js-cookie
import { useRouter } from 'next/navigation';
import Link from 'next/link';

// Define the form data interface
interface FormValues {
    email: string;
    password: string;
}

const Login: React.FC = () => {
    // Initialize React Hook Form
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<FormValues>();

    const [loginUser, { isLoading, isSuccess, status }] = useLoginUserMutation();
    const router = useRouter();

    // Handle form submission
    const onSubmit: SubmitHandler<FormValues> = async (data) => {
        try {
            const response = await loginUser(data).unwrap();
            console.log('Login Successful:', response);

            // Assuming the token is in response.token
            const token = response.token;

            // Set token in cookies (with a 1-day expiration, secure, HttpOnly flag can be added if needed)
            
            // Show success toast when login is successful
            if (response) {
                Cookies.set('auth_token', token, { expires: 1, secure: true, sameSite: 'Strict' });
                toast.success('Login successful!');
                router.push("/projects")
            }

        } catch (error) {
            console.error('Login Failed:', error);

            // Show error toast if login fails
            toast.error('Login failed. Please check your credentials.');
        }
    };

    return (
        <div className="w-full min-h-screen flex justify-center items-start">
            <div className="sm:w-[50%] flex flex-col space-y-5 justify-center items-center sm:h-[500px] rounded-2xl h-auto bg-white p-5">
                <form
                    onSubmit={handleSubmit(onSubmit)}
                    className="w-full flex flex-col space-y-5 items-center"
                >
                    {/* Email Field */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="email">Email</Label>
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

                    {/* Password Field */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            type="password"
                            id="password"
                            placeholder="Password"
                            {...register('password', {
                                required: 'Password is required',
                                minLength: {
                                    value: 6,
                                    message: 'Password must be at least 6 characters',
                                },
                            })}
                        />
                        {errors.password && (
                            <p className="text-red-500 text-sm">{errors.password.message}</p>
                        )}
                    </div>

                    {/* Submit Button */}
                    <div className="grid w-full max-w-sm items-center gap-1.5">
                        <Button type="submit">Sign In</Button>
                    </div>
                    <Link href="/auth/signup">Signup</Link>
                </form>
            </div>
        </div>
    );
};

export default Login;
