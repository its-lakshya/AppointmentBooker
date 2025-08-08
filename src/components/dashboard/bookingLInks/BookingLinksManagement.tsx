"use client";

import { Copy, MoreVertical } from 'lucide-react';
import { useRouter } from 'next/navigation';

import { Button } from '@/components/ui/button';
import {
    DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import {
    Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from '@/components/ui/table';
import { BookingLink } from '@/types/db';
import { formatToReadableDate } from '@/utils/dateTime/dateTime';

type BookingLinksManagementProps = {
  data: {
    links?: BookingLink[];
    error: string | null;
  };
};

const BookingLinksManagement = ({ data }: BookingLinksManagementProps) => {
  const router = useRouter();

  const handleCopy = (url: string) => {
    navigator.clipboard.writeText(url);
  };

  const isActive = (startDate: string, days: number): boolean => {
    const start = new Date(startDate);
    const expiry = new Date(start);
    expiry.setDate(expiry.getDate() + days);

    const now = new Date();

    return now >= start && now <= expiry;
  };

  return (
    <div className="w-full mx-auto">
      <div className="flex flex-col gap-8">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Booking Links</h1>
            <p className="text-sm text-muted-foreground">
              Manage your booking links and their settings
            </p>
          </div>
          <Button
            onClick={() =>
              router.push("/dashboard/booking-links/create-booking-link")
            }
          >
            Create Booking Link
          </Button>
        </div>

        {/* Table */}
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Created At</TableHead>
                <TableHead>Start</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Booking Link</TableHead>
                <TableHead>Payment Required</TableHead>
                <TableHead className="text-center">Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.links?.map((link) => {
                const bookingUrl = `${process.env.NEXT_PUBLIC_APP_URL}/book/spectrum-might/${link.slug}`;
                return (
                  <TableRow key={link.id}>
                    <TableCell className="font-medium">
                      {formatToReadableDate(link.created_at)}
                    </TableCell>
                    <TableCell>
                      {formatToReadableDate(
                        link?.availability_config?.startDate
                      )}
                    </TableCell>
                    <TableCell>{link.name}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="truncate max-w-[200px]">
                          {bookingUrl}
                        </span>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleCopy(bookingUrl)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      {link.payment_required ? "Required" : "Not Required"}
                    </TableCell>
                    <TableCell className="text-center align-middle">
                      {isActive(
                        link?.availability_config?.startDate,
                        link?.availability_config?.maxBookingDaysInFuture
                      ) === true ? (
                        <span
                          className={`mx-auto px-2 py-1 rounded-full text-xs font-medium bg-black text-white`}
                        >
                          Active
                        </span>
                      ) : (
                        <span
                          className={`mx-auto px-2 py-1 rounded-full text-xs font-medium bg-white text-black border`}
                        >
                          Inactive
                        </span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem>View</DropdownMenuItem>
                          <DropdownMenuItem>Edit</DropdownMenuItem>
                          <DropdownMenuItem className="text-destructive">
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default BookingLinksManagement;
