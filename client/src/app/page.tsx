"use client"
import Link from "next/link";
import {
  Activity,
  ArrowUpRight,
  CreditCard,
  DollarSign,
  Users,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Currency from "@/components/currancy";
import { useGetAllProductsQuery, useGetAllTaskQuery, useGetProjectCountsQuery, useGetTotalCountsQuery, useLazyGetReportQuery, useLazyGetSummaryReportQuery } from "@/store/services/apiSlice";
import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import dynamic from "next/dynamic";
import axios from "axios";

const ApexChart = dynamic(() => import("react-apexcharts"), { ssr: false });



export default function Dashboard() {
  const [triggerGetReport] = useLazyGetReportQuery();
  const [triggerSummary] = useLazyGetSummaryReportQuery();
  const { data, isLoading } = useGetTotalCountsQuery();
  const { data: projectData, isLoading: projectLoading } = useGetAllProductsQuery();
  const { data: taskData } = useGetAllTaskQuery();

  const [month, setMonth] = useState<string | null>(null);
  const [endDate, setEndDate] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  

  // Handle empty taskData or incorrect structure
  const prepareChartData = () => {
    const monthlyTaskCounts: Record<string, number> = {};

    if (Array.isArray(taskData)) {
      taskData.forEach((task) => {
        if (task?.createdAt) {
          const createdAt = new Date(task.createdAt);
          const month = createdAt.toLocaleString("default", { month: "long", year: "numeric" });
          monthlyTaskCounts[month] = (monthlyTaskCounts[month] || 0) + 1;
        }
      });
    }

    const categories = Object.keys(monthlyTaskCounts);
    const seriesData = Object.values(monthlyTaskCounts);

    return { categories, seriesData };
  };

  const { categories, seriesData } = prepareChartData();

  const chartOptions = {
    chart: {
      type: "bar",
      height: 350,
    },
    xaxis: {
      categories: categories.length > 0 ? categories : ['No Data'],
    },
    title: {
      text: "Task Count Per Month",
      align: "center",
    },
  };

  const chartSeries = [
    {
      name: "Tasks",
      data:   seriesData.length > 0 ? seriesData : [] ?? [],
    },
  ];

  const handleDownloadReport = async () => {
    try {
      if (!month || !endDate) {
        console.error("Please select a month.");
        return;
      }

      const response = await triggerGetReport({ month, endDate }).unwrap();
      console.log(response.fileUrl);

      const a = document.createElement("a");
      a.href = response.fileUrl;
      a.target = "_blank";
      a.click();
    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };

  const handleDownloadSummary = async () => {
    const response = await axios.get("http://localhost:3001/api/get-summary-report")

    var create = document.createElement('a');
    create.href = response.data.fileUrl;
    create.target = "_blank";
    create.click();
  };

  if (loading) {
    return (
      <div className="w-full min-h-screen flex justify-center items-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex sm:max-w-lg justify-start items-center gap-4">
        <Button onClick={handleDownloadSummary}>Download Summary</Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Currency value={data?.project} />
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Task</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Currency value={data?.TaskCount} />
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Completed Task</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Currency value={data?.completedTask} />
            </div>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-0">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total In Progress Task</CardTitle>

          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              <Currency value={data?.InProgress} />
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2" x-chunk="dashboard-01-chunk-4">
          <CardHeader className="flex flex-row items-center">
            <div className="grid gap-2">
              <CardTitle>Projects</CardTitle>
              <CardDescription>
                Recent Projects.
              </CardDescription>
            </div>
            <Button asChild size="sm" className="ml-auto gap-1">
              <Link href="/projects">
                View All
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Title</TableHead>
                  <TableHead className="hidden xl:table-column">Type</TableHead>
                  <TableHead className="hidden xl:table-column">
                    Status
                  </TableHead>
                  <TableHead className="hidden xl:table-column">Date</TableHead>
                  <TableHead className="text-right">End Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {
                  projectData?.projects?.map((item, index) => {
                    return (
                      <TableRow key={index}>
                        <TableCell>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {item?.projectTitle}
                          </div>
                        </TableCell>
                        <TableCell></TableCell>
                        <TableCell className="text-end">
                          <div className="hidden   text-sm text-muted-foreground md:inline">
                            {item?.endDate}
                          </div>
                        </TableCell>


                      </TableRow>
                    )
                  })
                }
              </TableBody>
            </Table>
          </CardContent>
        </Card>
        <Card x-chunk="dashboard-01-chunk-5">
          <CardHeader>
            <CardTitle>Recent Task</CardTitle>
          </CardHeader>
          <CardContent className="grid gap-8">
            {
              taskData?.map((item, index) => {
                return (
                  <div className="flex items-center gap-4">
                    <Avatar className="hidden h-9 w-9 sm:flex">
                      <AvatarImage src="/avatars/01.png" alt="Avatar" />
                      <AvatarFallback>OM</AvatarFallback>
                    </Avatar>
                    <div className="grid gap-1">
                      <p className="text-sm font-medium leading-none">
                        {item?.taskName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {item?.taskDescription}
                      </p>
                    </div>
                    <div className="ml-auto font-medium">{item?.taskStartDate}</div>
                  </div>
                )
              })
            }
          </CardContent>
        </Card>

        <div className="grid gap-4 col-span-3 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Task Count Per Month</CardTitle>
            <CardDescription>Monthly task statistics</CardDescription>
          </CardHeader>
          <CardContent>
            <ApexChart
              options={chartOptions}
              series={chartSeries}
              type="bar"
              height={350}
            />
          </CardContent>
        </Card>
      </div>
      </div>
    </main>
  );
}
