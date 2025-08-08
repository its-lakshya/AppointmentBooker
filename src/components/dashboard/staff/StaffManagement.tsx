"use client";

import { MoreVertical } from "lucide-react";
import { useState } from "react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { User } from "@/types/db";
import { formatToReadableDate } from "@/utils/dateTime/dateTime";
import { AvatarImage } from "@radix-ui/react-avatar";

type StaffManagementProps = {
  data: {
    members?: User[];
    error: string | null;
  };
};

const StaffManagement = ({ data }: StaffManagementProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Staff Management
            </h1>
            <p className="text-sm text-muted-foreground">
              Manage your staff members and invitations
            </p>
          </div>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button>Invite Staff</Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Invite Staff</DialogTitle>
                <DialogDescription>
                  Send an invitation to a new staff member.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input id="name" placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input id="email" placeholder="name@example.com" />
                </div>
              </div>
              <DialogFooter>
                <Button type="submit" onClick={() => setOpen(false)}>
                  Send Invite
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Staff Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead className=" text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.members?.map((staff) => (
                <TableRow key={staff.id}>
                  <TableCell className="font-medium">
                    <div className='flex items-center gap-2'>
                      <Avatar className="size-6">
                        <AvatarImage
                          src={staff.image_url}
                          alt={staff.first_name}
                        />
                        <AvatarFallback>
                          {staff.first_name?.[0]}
                          {staff.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      {staff.first_name + " " + staff.last_name}
                    </div>
                  </TableCell>
                  <TableCell>{staff.email}</TableCell>
                  <TableCell>
                    {formatToReadableDate(staff.created_at)}
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>View Profile</DropdownMenuItem>
                        <DropdownMenuItem>Edit</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive">
                          Remove
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default StaffManagement;
