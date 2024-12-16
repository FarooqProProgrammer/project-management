"use client";

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useRegisterUserMutation } from '@/store/services/apiSlice';
import { useRouter } from 'next/navigation';
import React from 'react';

import { useForm, SubmitHandler, FieldErrors } from 'react-hook-form';

// Define the form data interface
interface FormValues {
  username: string;
  email: string;
  password: string;
  avatar:File
}

const Register: React.FC = () => {
  // Initialize React Hook Form with typed form values
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormValues>();


  const router = useRouter();


  const [registerMutation,{ isLoading }] = useRegisterUserMutation()

  // Handle form submission with typed data
  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    console.log('Form Data:', data);


    const response = await registerMutation(data);
    console.log(response)

    if(response?.data) {
        router.push("/auth/signin")
    }


  };

  return (
    <div className="w-full min-h-screen flex justify-center items-start">
      <div className="sm:w-[50%] flex flex-col space-y-5 justify-center items-center sm:h-[500px] rounded-2xl h-auto bg-white p-5">
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="w-full flex flex-col space-y-5 items-center"
        >
          {/* Username Field */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="username">Username</Label>
            <Input
              type="text"
              id="username"
              placeholder="Username"
              {...register('username', { required: 'Username is required' })}
            />
            {errors.username && (
              <p className="text-red-500 text-sm">{errors.username.message}</p>
            )}
          </div>

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


          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Label htmlFor="password">Image</Label>
            <Input
              type="file"
              id="file"
              placeholder="Password"
              {...register('avatar', {
                required: 'Password is required',
                
              })}
            />
            {errors.avatar && (
              <p className="text-red-500 text-sm">{errors.avatar.message}</p>
            )}
          </div>


          {/* Submit Button */}
          <div className="grid w-full max-w-sm items-center gap-1.5">
            <Button type="submit">Sign up</Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;
