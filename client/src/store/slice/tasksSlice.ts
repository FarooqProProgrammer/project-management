import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface TasksState {
  tasks: any[];
  loading: boolean; // Loading state
}

const initialState: TasksState = {
  tasks: [], // Initialize with an empty array
  loading: false, // Initially not loading
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks: (state, action: PayloadAction<any[]>) => {
      state.tasks = action.payload;
      state.loading = false; // Set loading to false when tasks are set
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload; // Set loading state
    },
  },
});

export const { setTasks, setLoading } = tasksSlice.actions;

export default tasksSlice.reducer;
