import BookingLinksList from "@/components/dashboard/bookingLInks/BookingLinksManagement";
import EmptyBookingLinks from "@/components/dashboard/bookingLInks/EmptyBookingLinks";
import { BookingLinksResponse } from "@/types/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { auth } from "@clerk/nextjs/server";

const BookingLinksPage = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const { data, error } = await apiRequest<BookingLinksResponse>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/booking-links`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const bookingLinksData = { links: data?.bookingLinks, error };
  if (!data?.success || bookingLinksData?.links?.length === 0)
    return (
      <div className="w-full h-full flex justify-center items-centere">
        <EmptyBookingLinks />
      </div>
    );
  return (
    <div className="relative w-full h-full flex flex-col ">
      <div className="w-full">
        <BookingLinksList data={bookingLinksData}></BookingLinksList>
      </div>
    </div>
  );
};

export default BookingLinksPage;
