"use client";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Booking } from "@/types/db";
import { formatToReadableDate } from "@/utils/dateTime/dateTime";

type StaffBookingsListProps = {
  data: {
    bookings?: Booking[];
    error: string | null;
  };
};

const StaffBookingsList = ({ data }: StaffBookingsListProps) => {
  return (
    <Table>
      <TableCaption style={{ captionSide: "top" }}>My Bookings</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Start</TableHead>
          <TableHead>End</TableHead>
          <TableHead>Client Name</TableHead>
          <TableHead>Client Email</TableHead>
          <TableHead>Price</TableHead>
          <TableHead>Payment Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data?.bookings?.map((booking) => (
          <TableRow key={booking.id}>
            <TableCell className="font-medium">
              {formatToReadableDate(booking.created_at)}
            </TableCell>
            <TableCell>
              {new Date(booking.start_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>
              {new Date(booking.end_time).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </TableCell>
            <TableCell>{booking.client_name}</TableCell>
            <TableCell>{booking.client_email}</TableCell>
            <TableCell>{booking.price}</TableCell>
            <TableCell>{booking.payment_status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};

export default StaffBookingsList;
