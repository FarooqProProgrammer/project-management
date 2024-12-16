"use client";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { PencilIcon, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useDeleteTaskMutation, useGetAllTaskQuery } from "@/store/services/apiSlice";

const Projects = () => {
  const router = useRouter();
  const { data, refetch } = useGetAllTaskQuery();
  const [taskDescription, setTaskDescription] = useState("");
  const [commentMessage, setCommentMessage] = useState(""); // State for new comment message
  const [deleteTask, { isLoading }] = useDeleteTaskMutation();
  const [currentTask, setCurrentTask] = useState<any>(null);
  const [taskName, setTaskName] = useState("");
  const [taskStatus, setTaskStatus] = useState("");
  const [projectTitle, setProjectTitle] = useState("");
  const [updateResponse, setUpdateResponse] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState(""); // State for search input
  const [startDate, setStartDate] = useState(""); // State for start date filter
  const [endDate, setEndDate] = useState(""); // State for end date filter
  const [isUpdating, setIsUpdating] = useState(false); // Loading state for update operation

  useEffect(() => {
    console.log(data);
  }, [data]);

  const handleDeleteTask = async (id: string) => {
    try {
      await deleteTask(id).unwrap();
      console.log(`Task ${id} deleted successfully`);
      refetch();
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleUpdateTask = (task: any) => {
    setCurrentTask(task);
    setTaskName(task?.taskName || "");
    setTaskStatus(task?.taskStatus || "");
    setProjectTitle(task?.project?.projectTitle || "");
    setTaskDescription(task?.taskDescription || ""); // Set taskDescription
    setCommentMessage(""); // Clear the comment message when opening the update modal
    setUpdateResponse(null);
  };

  const handleSubmitUpdate = async () => {
    try {
      setIsUpdating(true); // Start loading
      const updatedTask = {
        taskName,
        taskStatus,
        projectTitle,
        taskDescription, // Add taskDescription here
        userId: currentTask?.assignee,
        comments: [
          ...(currentTask?.comments || []), // Ensure comments is an array, even if it's undefined
          {
            userId: currentTask?.assignee, // Assuming assignee is the user posting the comment
            commentMessage,
          },
        ],
      };
  
      // Send a PUT request to the custom route
      const response = await fetch(`http://localhost:3001/api/update-task/${currentTask?._id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updatedTask),
      });
  
      if (response.ok) {
        const result = await response.json();
        setUpdateResponse("Task updated successfully!");
        refetch();
        console.log("Update Response:", result);
      } else {
        throw new Error("Failed to update task");
      }
    } catch (error) {
      setUpdateResponse("Failed to update task. Please try again.");
      console.error("Error updating task:", error);
    } finally {
      setIsUpdating(false); // End loading, whether success or failure
    }
  };
  

  // Filter tasks based on search term and date range
  const filteredTasks = data?.filter((task) => {
    const taskStartDate = new Date(task?.taskStartDate);
    const taskEndDate = new Date(task?.taskEndDate);
    const startDateFilter = startDate ? new Date(startDate) : null;
    const endDateFilter = endDate ? new Date(endDate) : null;

    const isWithinStartDate =
      !startDateFilter || taskStartDate >= startDateFilter;
    const isWithinEndDate =
      !endDateFilter || taskEndDate <= endDateFilter;

    return (
      (task?.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.taskStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.project?.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
      isWithinStartDate &&
      isWithinEndDate
    );
  });

  return (
    <section className="sm:px-20 space-y-4">
      <div className="flex justify-between items-center">
        {/* Create Task Button */}
        <Button onClick={() => router.push("/task/create-task")}>Create Task</Button>

        {/* Search Input */}
        <Input
          type="text"
          placeholder="Search Tasks"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-1/3"
        />
      </div>

      <Table className="bg-white rounded-2xl mt-4">
        <TableHeader className="border-b-2 border-gray-600">
          <TableRow>
            <TableHead>Task Name</TableHead>
            <TableHead>Task Status</TableHead>
            <TableHead>Project</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>End Date</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredTasks?.map((item, index) => (
            <TableRow key={index}>
              <TableCell className="font-medium">{item?.taskName}</TableCell>
              <TableCell className="font-medium">{item?.taskStatus}</TableCell>
              <TableCell className="font-medium">{item?.project?.projectTitle}</TableCell>
              <TableCell className="font-medium">{item?.taskStartDate}</TableCell>
              <TableCell className="font-medium">{item?.taskEndDate}</TableCell>
              <TableCell className="font-medium flex justify-center items-center">
                <div className="flex justify-center items-center gap-5">
                  <Trash2 className="cursor-pointer" onClick={() => handleDeleteTask(item?._id)} />
                  <Dialog>
                    <DialogTrigger onClick={() => handleUpdateTask(item)}>
                      <PencilIcon className="cursor-pointer" />
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Update Task {currentTask?.taskName}</DialogTitle>
                        <DialogDescription>
                          <div className="grid w-full max-w-sm items-center gap-1.5">
                            <Label htmlFor="taskName">Task Name</Label>
                            <Input
                              type="text"
                              id="taskName"
                              placeholder="Task Name"
                              value={taskName}
                              onChange={(e) => setTaskName(e.target.value)}
                            />
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5 mt-3">
                            <Label htmlFor="taskStatus">Task Status</Label>
                            <Input
                              type="text"
                              id="taskStatus"
                              placeholder="Task Status"
                              value={taskStatus}
                              onChange={(e) => setTaskStatus(e.target.value)}
                            />
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5 mt-3">
                            <Label htmlFor="projectTitle">Project Title</Label>
                            <Input
                              type="text"
                              id="projectTitle"
                              placeholder="Project Title"
                              value={projectTitle}
                              onChange={(e) => setProjectTitle(e.target.value)}
                            />
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5 mt-3">
                            <Label htmlFor="taskDescription">Task Description</Label>
                            <textarea
                              id="taskDescription"
                              placeholder="Task Description"
                              value={taskDescription}
                              onChange={(e) => setTaskDescription(e.target.value)} // Handle change for description
                              className="w-full p-2 border rounded-md"
                            />
                          </div>

                          {/* Comment Section */}
                          <div className="mt-4">
                            <Label htmlFor="commentMessage">Add Comment</Label>
                            <textarea
                              id="commentMessage"
                              placeholder="Add a comment"
                              value={commentMessage}
                              onChange={(e) => setCommentMessage(e.target.value)}
                              className="w-full p-2 border rounded-md mt-2"
                            />
                          </div>

                          <Button
                            className="mt-4"
                            onClick={handleSubmitUpdate}
                            disabled={isUpdating} // Disable button while updating
                          >
                            {isUpdating ? "Updating..." : "Submit"}
                          </Button>
                          {updateResponse && (
                            <p className="mt-2 text-sm text-center">
                              {updateResponse}
                            </p>
                          )}
                        </DialogDescription>
                      </DialogHeader>
                    </DialogContent>
                  </Dialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </section>
  );
};

export default Projects;
