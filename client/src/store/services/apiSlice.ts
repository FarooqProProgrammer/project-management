import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { setLoading, setTasks } from '../slice/tasksSlice';

export const apiSlice = createApi({
  reducerPath: 'api',
  baseQuery: fetchBaseQuery({ baseUrl: 'http://localhost:3001/api' }),
  endpoints: (builder) => ({
    // Endpoint to get users
    getUsers: builder.query<any, void>({
      query: () => 'users',
    }),

    // Endpoint to get severity
    getSeverity: builder.query<any, void>({
      query: () => '/severity',
    }),

    // Endpoint to get project counts
    getProjectCounts: builder.query<any, void>({
      query: () => '/get-project-counts',
    }),

    // New endpoint to fetch all user details
    getAllUserDetails: builder.query<any, void>({
      query: () => '/auth/get-all-users',
    }),

    // Endpoint to get all products/projects
    getAllProducts: builder.query<any, void>({
      query: () => '/get-all-project',
    }),

    // Endpoint to get a report with query params
    getReport: builder.query<any, { month: string; endDate: string }>({
      query: ({ month, endDate }) => ({
        url: `/get-report?date=${month}&endDate=${endDate}`,
        responseType: 'blob',  // Handle binary file response
      }),
    }),

    // Endpoint to get total counts
    getTotalCounts: builder.query<any, void>({
      query: () => '/total-counts',
    }),

    // Endpoint to get a summary report
    getSummaryReport: builder.query<any, void>({
      query: () => '/summary',
    }),

    // Endpoint to fetch all tasks
    getAllTask: builder.query<any, void>({
      query: () => '/tasks',
      async onQueryStarted(arg, { dispatch, queryFulfilled }) {
        try {
          dispatch(setLoading(true)); // Set loading to true when query starts
          const { data } = await queryFulfilled;
          dispatch(setTasks(data)); // Store the fetched tasks in the tasksSlice
        } catch (err) {
          console.error('Error fetching tasks:', err);
        } finally {
          dispatch(setLoading(false)); // Set loading to false when query ends
        }
      },
    }),

    // Endpoint to delete a project
    deleteProject: builder.mutation<any, string>({
      query: (id) => ({
        url: `/delete-project/${id}`,
        method: 'DELETE',
      }),
    }),

    // Endpoint for user registration
    registerUser: builder.mutation<any, { email: string; password: string; username: string }>({
      query: (userData) => ({
        url: '/auth/register',
        method: 'POST',
        body: userData,
      }),
    }),

    // Endpoint for user login
    loginUser: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/login',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Endpoint for password reset
    forgotPassword: builder.mutation<any, { email: string; password: string }>({
      query: (credentials) => ({
        url: '/auth/forgot-password',
        method: 'POST',
        body: credentials,
      }),
    }),

    // Mutation for creating a task
    createTask: builder.mutation<any, {
      taskName: string;
      priority: string;
      taskStartDate: string;
      taskEndDate: string;
      taskStatus: string;
      assignee: string;
      project?: string;
      module?: string;
      taskDescription: string;
      taskImages?: FileList;
    }>({
      query: (taskData) => {
        const formData = new FormData();
        formData.append('taskName', taskData.taskName);
        formData.append('priority', taskData.priority);
        formData.append('taskStartDate', taskData.taskStartDate);
        formData.append('taskEndDate', taskData.taskEndDate);
        formData.append('taskStatus', taskData.taskStatus);
        formData.append('assignee', taskData.assignee);
        formData.append('project', taskData.project || ''); // Optional field
        formData.append('module', taskData.module || ''); // Optional field
        formData.append('taskDescription', taskData.taskDescription);

        // Append task images if provided
        if (taskData.taskImages) {
          Array.from(taskData.taskImages).forEach((file) => {
            formData.append('taskImages[]', file);
          });
        }

        return {
          url: '/task',  // Assuming this is the endpoint for creating a task
          method: 'POST',
          body: formData,  // Passing FormData to handle file uploads
          headers: {
            'Content-Type': 'multipart/form-data',  // Ensure the correct content type for file upload
          },
        };
      },
    }),

    // Mutation to update a task
    updateTask: builder.mutation<any, {
      taskId: string;
      taskName: string;
      priority: string;
      taskStartDate: string;
      taskEndDate: string;
      taskStatus: string;
      assignee: string;
      project?: string;
      module?: string;
    }>({
      query: (taskData) => ({
        url: `/update-task/${taskData.taskId}`,
        method: 'PUT',
        body: {
          taskName: taskData.taskName,
          priority: taskData.priority,
          taskStartDate: taskData.taskStartDate,
          taskEndDate: taskData.taskEndDate,
          taskStatus: taskData.taskStatus,
          assignee: taskData.assignee,
          project: taskData.project,
          module: taskData.module,
        },
      }),
    }),

    // Mutation to delete a task
    deleteTask: builder.mutation<any, string>({
      query: (taskId) => ({
        url: `/task/${taskId}`,
        method: 'POST',  // Assuming the DELETE request uses POST method (adjust as necessary)
      }),
    }),

    // Mutation for creating a severity
    createSeverity: builder.mutation<any, { severityName: string }>({
      query: ({ severityName }) => ({
        url: '/create-severity',
        method: 'POST',
        body: { Severity: severityName },
      }),
    }),

    // Mutation to delete a severity
    deleteSeverity: builder.mutation<any, string>({
      query: (severityId) => ({
        url: `/severity/${severityId}`,
        method: 'DELETE',
      }),
    }),

    // Mutation for creating a project with image upload and other fields
    createProject: builder.mutation<any, {
      projectTitle: string;
      severity: string;
      startDate: string;
      endDate: string;
      projectStatus: string;
      assignee: string;
      userId: string;
      projectImage: File;
    }>({
      query: (projectData) => {
        const formData = new FormData();
        formData.append('projectTitle', projectData.projectTitle);
        formData.append('severity', projectData.severity);
        formData.append('startDate', projectData.startDate);
        formData.append('endDate', projectData.endDate);
        formData.append('projectStatus', projectData.projectStatus);
        formData.append('assignee', projectData.assignee);
        formData.append('userId', projectData.userId);
        formData.append('projectImage', projectData.projectImage);

        return {
          url: '/create-project',
          method: 'POST',
          body: formData,
        };
      },
    }),

    // Mutation to update a project
    updateProject: builder.mutation<any, {
      projectId: string;
      projectTitle: string;
      severity: string;
      startDate: string;
      endDate: string;
      projectStatus: string;
    }>({
      query: (projectData) => ({
        url: `/update-project/${projectData.projectId}`,
        method: 'PUT',
        body: {
          projectTitle: projectData.projectTitle,
          severity: projectData.severity,
          startDate: projectData.startDate,
          endDate: projectData.endDate,
          projectStatus: projectData.projectStatus,
        },
      }),
    }),

  }),
});

// Export hooks for usage in functional components
export const {
  useGetUsersQuery,
  useRegisterUserMutation,
  useLoginUserMutation,
  useGetSeverityQuery,
  useCreateSeverityMutation,
  useCreateProjectMutation,
  useDeleteSeverityMutation,
  useUpdateProjectMutation,  // Export the new hook
  useCreateTaskMutation,  // Export the create task hook
  useUpdateTaskMutation,  // Export the update task hook
  useGetAllProductsQuery,
  useGetAllUserDetailsQuery,
  useGetAllTaskQuery,
  useDeleteTaskMutation,
  useDeleteProjectMutation,
  useLazyGetReportQuery,
  useGetTotalCountsQuery,
  useGetProjectCountsQuery,
  useLazyGetSummaryReportQuery
} = apiSlice;
