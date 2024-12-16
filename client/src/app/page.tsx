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

export default function Dashboard() {

  const [triggerGetReport] = useLazyGetReportQuery();

  const [triggerSummary] = useLazyGetSummaryReportQuery();


  const { data, isLoading } = useGetTotalCountsQuery();
  const { data: projectData, isLoading: projectLoading } = useGetAllProductsQuery();


  const { data: taskData } = useGetAllTaskQuery()


  useEffect(() => {
    console.log(taskData)
  }, [taskData])




  const [month, setMonth] = useState<string | null>(null)
  const [endDate, setEndDate] = useState<string | null>(null)



  const handleDownloadReport = async () => {
    try {

      if (!month || !endDate) {
        console.error("Please select a month.");
        return;
      }



      // Make the API call to fetch the report
      const response = await triggerGetReport({ month, endDate }).unwrap();
      console.log(response.fileUrl); // Ensure that the fileUrl is present in the response

      // Create an anchor element
      const a = document.createElement('a');
      a.href = response.fileUrl; // Set the href to the URL received from the response
      a.target = '_blank'; // Open the link in a new tab
      a.click(); // Simulate a click to open the link

    } catch (error) {
      console.error("Error downloading the report:", error);
    }
  };




  const handleDownloadSummary = async () => {
    try {
      // Fetch the report summary
      const reportSummary = await triggerSummary().unwrap();
  
      if (reportSummary.fileUrl) {
        console.log(reportSummary.fileUrl); // Log the fileUrl for debugging
  
        // Open the fileUrl in another page
        window.open(reportSummary.fileUrl, '_blank');
      } else {
        console.error("No file URL received in the response.");
      }
    } catch (error) {
      console.error("Error fetching the summary:", error);
    }
  };
  


  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex sm:max-w-lg justify-start items-center gap-4">
        <Input type="date" onChange={(e) => setMonth(e.target.value)} />
        <Input type="date" onChange={(e) => setEndDate(e.target.value)} />
        <Button onClick={handleDownloadReport}>Download Report</Button>
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
      </div>
    </main>
  );
}
