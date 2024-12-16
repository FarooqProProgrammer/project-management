"use client";
import React, { useEffect, useState } from "react";
import {
    Table,
    TableBody,
    TableCaption,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { useCreateSeverityMutation, useDeleteSeverityMutation, useGetSeverityQuery } from "@/store/services/apiSlice";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Trash2Icon } from "lucide-react";

const Severity = () => {
    const { data, isLoading, error, refetch } = useGetSeverityQuery({});
    const [createSeverity, { isLoading: severityLoading, isError: severityError }] = useCreateSeverityMutation();
    const [deleteSeverity, { isLoading: deleteSeverityLoading }] = useDeleteSeverityMutation();

    // State to store the new severity input
    const [severity, setSeverity] = useState("");

    // Date formatting function
    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return new Intl.DateTimeFormat("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        }).format(date);
    };

    // Handle the submit action
    const handleSubmit = async () => {
        if (!severity) return; // Ensure severity is not empty

        try {
            await createSeverity({ severityName: severity }).unwrap(); // Ensure mutation is awaited
            setSeverity(""); // Reset the input field after submission
            refetch(); // Refetch data to update the list
        } catch (error) {
            console.error("Failed to create severity", error);
        }
    };

    // Handle delete severity action
    const handleDelete = async (severityId: string) => {
        try {
            await deleteSeverity(severityId).unwrap(); // Ensure mutation is awaited
            refetch(); // Refetch to update the list after deletion
        } catch (error) {
            console.error("Failed to delete severity", error);
        }
    };

    return (
        <div className="lg:px-20 sm:px-10 space-y-4">
            {/* Create severity dialog */}
            <div className="flex justify-end items-center">
                <Dialog>
                    <DialogTrigger asChild>
                        <Button>Create Severity</Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                            <DialogTitle>Create Severity</DialogTitle>
                            <DialogDescription>
                                Add a new severity level. Click save when you're done.
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            {/* Severity Input */}
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="severity" className="text-right">
                                    Severity
                                </Label>
                                <Input
                                    id="severity"
                                    value={severity}
                                    onChange={(e) => setSeverity(e.target.value)}
                                    className="col-span-3"
                                    placeholder="Enter severity"
                                />
                            </div>
                        </div>
                        <DialogFooter>
                            {/* Save button */}
                            <Button onClick={handleSubmit} disabled={severityLoading}>
                                {severityLoading ? "Saving..." : "Save"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>

            {/* Severity table */}
            <Table className="bg-white">
                <TableHeader>
                    <TableRow>
                        <TableHead className="">Id</TableHead>
                        <TableHead>Severity</TableHead>
                        <TableHead>Slug</TableHead>
                        <TableHead>Created At</TableHead>
                        <TableHead>Updated At</TableHead>
                        <TableHead>Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {isLoading ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center">
                                Loading...
                            </TableCell>
                        </TableRow>
                    ) : error ? (
                        <TableRow>
                            <TableCell colSpan={6} className="text-center text-red-500">
                                Error loading severity data
                            </TableCell>
                        </TableRow>
                    ) : (
                        data?.data?.map((item: any) => (
                            <TableRow key={item.id}>
                                <TableCell className="font-medium">{item?.index}</TableCell>
                                <TableCell className="font-medium">{item?.Severity}</TableCell>
                                <TableCell className="font-medium">{item?.slug}</TableCell>
                                <TableCell className="font-medium">
                                    {item?.createdAt ? formatDate(item?.createdAt) : "N/A"}
                                </TableCell>
                                <TableCell className="font-medium">
                                    {item?.updatedAt ? formatDate(item?.updatedAt) : "N/A"}
                                </TableCell>
                                <TableCell>
                                    <div className="flex justify-center items-center gap-6">
                                        <Button
                                            variant="outline"
                                            color="red"
                                            onClick={() => handleDelete(item._id)}
                                            disabled={deleteSeverityLoading}
                                        >
                                             <Trash2Icon />
                                        </Button>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))
                    )}
                </TableBody>
            </Table>
        </div>
    );
};

export default Severity;
