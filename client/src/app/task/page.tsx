"use client";
import React, { useState, useEffect } from "react";
import { FaDeleteLeft } from "react-icons/fa6";

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
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Textarea } from "@/components/ui/textarea";
import axios from "axios";
import moment from "moment"
import * as XLSX from 'xlsx'; // Import xlsx library
import Link from "next/link";


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

    const [projectTitleFilter, setProjectTitleFilter] = useState(""); // New state for projectTitle filter
  

  const [module, setModule] = useState<string>("")

  useEffect(() => {
    console.log(data); // Logs task data to inspect its structure
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
    // Ensure the task object contains necessary data
    console.log("Updating Task:", task); // Debugging line
    setCurrentTask(task);
    setTaskName(task?.taskName || "");
    setTaskStatus(task?.taskStatus || "");
    setProjectTitle(task?.project?.projectTitle || "");
    setModule(task?.module)
    setTaskDescription(task?.taskDescription || ""); // Set taskDescription
    setCommentMessage(""); // Clear the comment message when opening the update modal
    setUpdateResponse(null);
  };


  const exportToExcel = (data) => {
    console.log(data);

    let flatData = [];

    // Iterate over each task
    data.forEach((task) => {
      // Iterate over taskStatusHistory
      task.taskStatusHistory.forEach((status) => {
        // Create a new object with taskName and status details
        flatData.push({
          taskName: task.taskName,
          status: status.status,
          timestamp: status.timestamp,
        });
      });
    });

    // Log the flattened data (for debugging purposes)
    console.log(flatData);

    // Create a worksheet from the flattened data
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Task History'); // Append the worksheet to the workbook

    // Generate Excel file and download it
    XLSX.writeFile(wb, 'task_history.xlsx');
  };


  const handleSubmitUpdate = async () => {
    try {
      setIsUpdating(true); // Start loading
      const updatedTask = {
        taskName,
        taskStatus,
        projectTitle,
        module,
        taskDescription, // Add taskDescription here
        userId: currentTask?.assignee, // Ensure assignee is available
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

  // Function to handle adding a comment
  const handleAddComment = async (taskId: string, userId: string) => {
    if (!commentMessage.trim()) {
      console.log("Comment is empty");
      return;
    }

    try {
      const commentData = {

        userId: userId, // Ensure userId is available
        commentMessage,
      };

      const response = await axios.post(`http://localhost:3001/api/add-task-comment/${taskId}`, commentData);

      if (response.status === 200) {
        console.log("Comment added successfully");
        refetch();
      }



    } catch (error) {
      console.error("Error adding comment:", error);
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

    const matchesProjectTitle =
      !projectTitleFilter || task?.project?.projectTitle?.toLowerCase().includes(projectTitleFilter.toLowerCase());

    return (
      (task?.taskName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.taskStatus.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task?.project?.projectTitle.toLowerCase().includes(searchTerm.toLowerCase())) &&
      isWithinStartDate &&
      isWithinEndDate &&
      matchesProjectTitle // Add project title filter check
    );
  });






  // Function to handle deleting a comment
  const handleDeleteTaskComment = async (taskId: string, commentId: string) => {
    try {
      // Make a DELETE request to the server
      const response = await axios.delete(
        `http://localhost:3001/api/delete-task-comment/${commentId}/${taskId}`
      );

      if (response.status === 200) {
        console.log("Comment deleted successfully");
        refetch(); // Refetch data to update the UI
      } else {
        console.error("Failed to delete comment");
      }
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };


  const [changeStatus, setChangeStatus] = useState<string>("")


  const HandleChangeStatus = async (id: string) => {
    console.log({ id, changeStatus })


    try {

      const response = await axios.post(`http://localhost:3001/api/change-status/${id}`, { taskMessage: changeStatus })

      console.log(response.data)

      refetch()


    } catch (error) {

    }

  }



  const HandleDownloadData = () => {
    console.log(filteredTasks);

    // Flatten the data structure
    let flatData: {
      taskName: any; status: any; formattedTimestamp: any; // Formatted timestamp
      rawTimestamp: any;
    }[] = [];

    filteredTasks.forEach((task) => {
      // Iterate over each status in the task's taskStatusHistory
      task.taskStatusHistory.forEach((status) => {
        // Push each status with task name, status, and timestamps
        flatData.push({
          taskName: task.taskName,
          status: status.status,
          formattedTimestamp: moment(status.timestamp).format('dddd, MMMM Do YYYY'), // Formatted timestamp
          rawTimestamp: status.timestamp, // Raw timestamp
        });
      });
    });

    // Log the flattened data to check if it's correct
    console.log(flatData);

    // Create a worksheet from the flattened data
    const ws = XLSX.utils.json_to_sheet(flatData);
    const wb = XLSX.utils.book_new(); // Create a new workbook
    XLSX.utils.book_append_sheet(wb, ws, 'Task History'); // Append the worksheet to the workbook

    // Generate Excel file and trigger download
    XLSX.writeFile(wb, 'task_history.xlsx');
  };


  return (
    <section className="sm:px-20 space-y-4">
      <div className="flex justify-between items-center">
        {/* Create Task Button */}
        <div className="flex justify-center items-center gap-3">
          <Button onClick={() => router.push("/task/create-task")}>Create Task</Button>
          <Button onClick={HandleDownloadData}>Download Task</Button>

        </div>

        {/* Project Title Filter */}
        <Input
            type="text"
            placeholder="Filter by Project Title"
            value={projectTitleFilter}
            onChange={(e) => setProjectTitleFilter(e.target.value)}
            className="w-1/3"
          />

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
            <TableHead>Task Module</TableHead>
            <TableHead>Project</TableHead>



            <TableHead>Comment</TableHead>
            <TableHead>Ticket History</TableHead>
            <TableHead>View Ticket</TableHead>

            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>


        <TableBody>
          {filteredTasks?.map((item, index) => (
            <TableRow
              key={index}



            >
              <TableCell className="font-medium">{item?.taskName}</TableCell>
              <TableCell className="font-medium">{item?.taskStatus}</TableCell>
              <TableCell className="font-medium">{item?.module}</TableCell>
              <TableCell className="font-medium">{item?.project?.projectTitle}</TableCell>


              <TableCell className="font-medium">
                <Sheet>
                  <SheetTrigger>Comment</SheetTrigger>
                  <SheetContent className="w-[400px] sm:w-[540px]">
                    <SheetHeader>
                      <SheetTitle>Add Comment on Task</SheetTitle>
                      <SheetDescription className="space-y-3">
                        <input value={item?._id} hidden placeholder="TaskId" />
                        <input value={item?.assignee?._id} hidden placeholder="UserId" />
                        <Textarea
                          value={commentMessage}
                          onChange={(e) => setCommentMessage(e.target.value)}
                          placeholder="Add a comment"
                        />
                        <Button
                          onClick={() => handleAddComment(item?._id, item?.assignee?._id)}
                        >
                          Submit
                        </Button>

                        <h5 className="mt-5 text-xl font-bold text-black">All Comments</h5>
                        <div className="mt-5">
                          {item?.comments?.map((comment, index) => {
                            return (
                              <div className="my-3 relative w-full border cursor-pointer flex justify-between items-center border-gray-400 p-3 rounded-md" key={index}>
                                <p>{comment?.commentMessage}</p>
                                <p>{comment?.userId?.username}</p>
                                <div onClick={() => handleDeleteTaskComment(comment?._id, item?._id)} className="absolute flex justify-center items-center rounded-md -top-2 -right-0 w-[20px] h-[20px] border-2 border-gray-500">
                                  <FaDeleteLeft size={10} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </TableCell>

              <TableCell>
                <Sheet>
                  <SheetTrigger>
                    <h5
                      style={{
                        backgroundColor: item?.taskStatusHistory[item?.taskStatusHistory.length - 1]?.status === 'closed'
                          ? 'rgba(255, 0, 0, 0.3)'  // Red with 50% opacity
                          : 'rgba(0, 128, 0, 0.3)', // Green with 50% opacity
                      }}
                      className="p-3 rounded-md"
                    >
                      {item?.taskStatusHistory[item?.taskStatusHistory.length - 1]?.status}

                    </h5>
                  </SheetTrigger>
                  <SheetContent>
                    <SheetHeader>
                      <SheetTitle>Task History</SheetTitle>
                      <SheetDescription className="space-y-3">
                        <select onChange={(e) => setChangeStatus(e.target.value)}>
                          <option value="open" defaultChecked={item?.taskStatusHistory.slice(-1)[0]?.status?.toLowerCase() === "open"}>Open</option>
                          <option value="closed" defaultChecked={item?.taskStatusHistory.slice(-1)[0]?.status?.toLowerCase() === "open"}>Closed</option>
                        </select>

                        <Button onClick={() => HandleChangeStatus(item?._id)}>Change Status</Button>

                        <div className="mt-4">
                          <h5 className="text-xl mb-3 text-black font-bold">Task History</h5>

                          <Button
                            className="mt-2"
                            onClick={() => exportToExcel([{
                              taskName: item?.taskName,
                              taskStatusHistory: item?.taskStatusHistory?.map(status => ({
                                status: status?.status,
                                timestamp: moment(status?.timestamp).format('dddd, MMMM Do YYYY'),
                              }))
                            }])}
                          >
                            Download as Excel
                          </Button>
                          {item?.taskStatusHistory?.map((status, index) => {
                            return (
                              <div className="flex justify-between items-center my-3" key={index}>
                                <p>{status?.status}</p>
                                <p>{moment(status?.timestamp).format('dddd, MMMM Do YYYY')}</p>
                              </div>
                            );
                          })}
                        </div>
                      </SheetDescription>
                    </SheetHeader>
                  </SheetContent>
                </Sheet>
              </TableCell>
              <TableCell>
                <Link href={`/task/${item?._id}`} className="text-red-500 underline">View Task Data</Link>
              </TableCell>

              <TableCell className="font-medium flex justify-start items-center">
                <div className="flex justify-start items-center gap-5">
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
                            <select
                              id="taskStatus"
                              value={taskStatus}
                              onChange={(e) => setTaskStatus(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            >
                              <option value="">Select Status</option>
                              <option defaultChecked={item?.taskStatus === 'Not Started'} value="Not Started">Not Started</option>
                              <option defaultChecked={item?.taskStatus === 'In Progress'} value="In Progress">In Progress</option>
                              <option defaultChecked={item?.taskStatus === 'Completed'} value="Completed">Completed</option>
                            </select>
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
                            <Label htmlFor="module">Module</Label>
                            <Input
                              type="text"
                              id="module"
                              placeholder="Module"
                              value={module}
                              onChange={(e) => setModule(e.target.value)}
                            />
                          </div>
                          <div className="grid w-full max-w-sm items-center gap-1.5 mt-3">
                            <Label htmlFor="taskDescription">Task Description</Label>
                            <textarea
                              id="taskDescription"
                              placeholder="Task Description"
                              value={taskDescription}
                              onChange={(e) => setTaskDescription(e.target.value)}
                              className="w-full p-2 border rounded-md"
                            />
                          </div>

                          <Button
                            className="mt-4"
                            onClick={handleSubmitUpdate}
                            disabled={isUpdating}
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
