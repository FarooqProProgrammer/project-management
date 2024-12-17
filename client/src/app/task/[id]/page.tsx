"use client"

import axios from 'axios';
import { useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

const ViewTask = () => {
  const { id } = useParams();
  
  // State to store task data
  const [taskData, setTaskData] = useState<any>(null);
  // State to manage loading status
  const [loading, setLoading] = useState<boolean>(true);
  // State to handle any error during data fetch
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null); // Clear any previous error state
        const response = await axios.get(`http://localhost:3001/api/task/${id}`);
        
        // Set the fetched data to the state
        setTaskData(response.data);
      } catch (error) {
        setError("Error fetching task data");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      fetchData();
    }
  }, [id]);

  // Render loading, error, or task data
  if (loading) {
    return <div className="text-center py-4">Loading...</div>;
  }

  if (error) {
    return <div className="text-center py-4 text-red-500">{error}</div>;
  }

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold text-gray-800 mb-6">Task Details</h2>

      {taskData ? (
        <div className="space-y-4">
          <div>
            <p className="font-medium text-gray-600">Task Name:</p>
            <p className="text-lg text-gray-800">{taskData.taskName}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Description:</p>
            <p className="text-lg text-gray-800">{taskData.taskDescription}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Status:</p>
            <p className={`text-lg ${taskData.taskStatus === 'closed' ? 'text-red-500' : 'text-green-500'}`}>
              {taskData.taskStatus}
            </p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Assigned To:</p>
            <p className="text-lg text-gray-800">{taskData?.assignee?.username}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Project:</p>
            <p className="text-lg text-gray-800">{taskData?.project?.projectTitle}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Start Date:</p>
            <p className="text-lg text-gray-800">{new Date(taskData.taskStartDate).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">End Date:</p>
            <p className="text-lg text-gray-800">{new Date(taskData.taskEndDate).toLocaleDateString()}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Module:</p>
            <p className="text-lg text-gray-800">{taskData.module}</p>
          </div>

          <div>
            <p className="font-medium text-gray-600">Task Images:</p>
            <div className="flex space-x-4">
              {taskData.taskImages.map((imageUrl: string, index: number) => (
                <img key={index} src={imageUrl} alt={`task image ${index + 1}`} className="w-24 h-24 object-cover rounded-md" />
              ))}
            </div>
          </div>

          <div>
            <p className="font-medium text-gray-600">Status History:</p>
            <div className="space-y-2">
              {taskData.taskStatusHistory.map((history: any, index: number) => (
                <div key={index} className={`p-2 rounded-md ${history.status === 'closed' ? 'bg-red-100' : 'bg-green-100'}`}>
                  <p className="text-gray-700">{history.status}</p>
                  <p className="text-sm text-gray-500">{new Date(history.timestamp).toLocaleString()}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-lg text-gray-700">No task data available</p>
      )}
    </div>
  );
};

export default ViewTask;
