import AddBookingLinkButton from "@/components/dashboard/bookingLInks/AddBookingLinkButton";
import StaffBookingsList from "@/components/dashboard/staffMember/myBookings/StaffBookingsList";
import { StaffBookingsResponse } from "@/types/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { auth } from "@clerk/nextjs/server";

const StaffBookingsPage = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const { data, error } = await apiRequest<StaffBookingsResponse>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/staff/bookings`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
  // console.log(data)

  const bookingsData = { bookings: data?.bookings, error };
  if (!data?.success || bookingsData?.bookings?.length === 0)
    return (
      <div className="w-full h-full flex justify-center items-center">
        <h4 className='text-accent-foreground font-semibold'>You don&apos;t have any bookings</h4>
      </div>
    );
  return (
    <div className="relative w-full h-full flex flex-col ">
      <AddBookingLinkButton />
      <div className="w-full">
        <StaffBookingsList data={bookingsData}></StaffBookingsList>
      </div>
    </div>
  );
};

export default StaffBookingsPage;
