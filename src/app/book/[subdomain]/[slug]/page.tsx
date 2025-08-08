"use client";

import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { BookingLinkResponse } from "@/types/db";
import { BookingLinkType } from "@/types/enums";
import { apiRequest } from "@/utils/api/apiRequest";
import { Spinner } from "@/components/ui/spinner";

function formatDateToYMD(date: Date): string {
  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

const BookPage = () => {
  const params = useParams();
  const [bookingDetails, setBookingDetails] = useState<Omit<BookingLinkResponse, "success"> | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedSlot, setSelectedSlot] = useState<{ start: string; end: string } | null>(null);
  const [selectedStaffId, setSelectedStaffId] = useState<string>("");

  const [availableSlots, setAvailableSlots] = useState<{ start: string; end: string }[]>([]);
  const [bookedSlots, setBookedSlots] = useState<{ start: string; end: string }[]>([]);
  const [timezone, setTimezone] = useState<string>("UTC");
  const [loadingSlots, setLoadingSlots] = useState(false);
  const [errorLoadingSlots, setErrorLoadingSlots] = useState<string | null>(null);

  // Fetch booking link details
  useEffect(() => {
    const getBookingLinkDetails = async () => {
      if (!params?.subdomain || !params?.slug) return;
      const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/public/booking-link/${params.subdomain}/${params.slug}`;
      const { data } = await apiRequest<BookingLinkResponse>(apiUrl);
      if (data?.success) {
        const { bookingLink, service, staff } = data;
        setBookingDetails({ bookingLink, service, staff });
        setSelectedStaffId(staff[0]?.id || "");
        setTimezone(bookingLink.availability_config?.timezone || "UTC");
      }
    };
    getBookingLinkDetails();
  }, [params]);

  // Fetch available slots on date change
  useEffect(() => {
    if (!selectedDate || !bookingDetails) {
      setAvailableSlots([]);
      setBookedSlots([]);
      setSelectedSlot(null);
      return;
    }

    const fetchSlots = async () => {
      setLoadingSlots(true);
      setErrorLoadingSlots(null);
      setSelectedSlot(null);

      const dayStr = formatDateToYMD(selectedDate);

      const url = new URL(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/public/availability/${params.subdomain}/${params.slug}`
      );
      url.searchParams.append("start", dayStr);
      url.searchParams.append("end", dayStr);

      try {
        const response = await fetch(url.toString());
        if (!response.ok) throw new Error("Failed to load available slots");
        const data = await response.json();
        setAvailableSlots(data.availableSlots || []);
        setBookedSlots(data.bookedSlots || []);
        setTimezone(data.timezone || "UTC");
        //eslint-disable-next-line
      } catch (error: any) {
        setErrorLoadingSlots(error.message || "Unknown error");
        setAvailableSlots([]);
        setBookedSlots([]);
      } finally {
        setLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedDate, bookingDetails, params.subdomain, params.slug]);

  const isSlotBooked = (slot: { start: string; end: string }) => {
    return bookedSlots.some((b) => slot.start === b.start && slot.end === b.end);
  };

  const formatSlotTime = (isoString: string) => {
    return new Date(isoString).toLocaleTimeString("en-US", {
      hour12: false,
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot || !bookingDetails || !params.subdomain || !params.slug) return;

    const form = e.currentTarget as HTMLFormElement;
    const name = (form.name as HTMLInputElement).value;
    const email = (form.email as HTMLInputElement).value;
    const phone = (form.phone as HTMLInputElement).value;
    const message = (form.message as HTMLTextAreaElement).value;

    const payload = {
      serviceId: bookingDetails.service.id,
      staffUserId: selectedStaffId,
      clientName: name,
      clientEmail: email,
      clientPhone: phone,
      startTime: new Date(selectedSlot.start).toISOString(),
      endTime: new Date(selectedSlot.end).toISOString(),
      timezone,
      paymentStatus: "unpaid",
      intakeData: {
        message,
      },
    };

    const apiUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/public/book/${params.subdomain}/${params.slug}`;

    try {
      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        alert("Booking failed: " + (result.message || "Unknown error"));
      } else {
        alert("Booking successful!");
        // Optionally, redirect or reset form
      }
    } catch (error) {
      alert("An error occurred during booking.");
      console.error(error);
    }
  };

  if (!bookingDetails) {
    return (
      <div className="w-screen h-screen flex justify-center items-center text-muted-foreground">
        <Spinner />
      </div>
    );
  }

  const { bookingLink, service, staff } = bookingDetails;

  return (
    <div className="min-h-screen bg-white px-4 py-6 md:p-8 lg:p-12">
      <div className="max-w-6xl mx-auto">
        <Card>
          <CardContent className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1fr_1fr_1.2fr] p-6">
            {/* STAFF & SERVICE */}
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-semibold">{bookingLink.name}</h2>
                <p className="text-sm text-muted-foreground mt-1 line-clamp-4">
                  {service.description}
                </p>
              </div>

              <div className="space-y-2">
                <Button
                  key={service.id}
                  variant={"default"}
                  className="w-full justify-between text-base py-5"
                >
                  <span>{service.name}</span>
                  <div className="flex gap-2">
                    <span>${service.price}</span>
                    <span>•</span>
                    <span>{service.duration_minutes} min</span>
                  </div>
                </Button>
              </div>

              {bookingLink.type !== BookingLinkType.RoundRobin && staff.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h3 className="text-base font-medium">Staff</h3>
                  <div className="flex gap-3 flex-wrap max-h-[160px] overflow-y-auto pr-1">
                    {staff.map((member) => (
                      <button
                        key={member.id}
                        type="button"
                        onClick={() => setSelectedStaffId(member.id)}
                        className={`flex items-center gap-3 p-2 border rounded-md w-fit text-left transition-colors ${
                          selectedStaffId === member.id
                            ? "border-black bg-gray-100"
                            : "border-gray-300 hover:border-black"
                        }`}
                      >
                        <Avatar className="w-10 h-10">
                          <AvatarImage src={member.image_url} alt={member.first_name} />
                          <AvatarFallback>{member.first_name[0]}</AvatarFallback>
                        </Avatar>
                        <span className="text-sm font-medium">{member.first_name}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* CALENDAR */}
            <div className="space-y-5">
              <h3 className="text-base font-medium">Select a date</h3>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => {
                  if (!bookingDetails.bookingLink.availability_config?.startDate) return false;
                  const startDate = new Date(
                    bookingDetails.bookingLink.availability_config.startDate
                  );
                  return date < startDate;
                }}
              />
              {!selectedDate && (
                <p className="text-sm text-muted-foreground">
                  Please select a date to view available times.
                </p>
              )}
            </div>

            {/* TIME + FORM */}
            <div className="space-y-6">
              <div>
                <h3 className="text-base font-medium mb-2">Available Time Slots</h3>

                {loadingSlots ? (
                  <Spinner />
                ) : errorLoadingSlots ? (
                  <p className="text-sm text-red-500">{errorLoadingSlots}</p>
                ) : selectedDate ? (
                  availableSlots.length > 0 ? (
                    <div className="max-h-64 overflow-auto grid grid-cols-2 gap-2">
                      {availableSlots.map((slot) => {
                        const timeStr = formatSlotTime(slot.start) + " - " + formatSlotTime(slot.end);
                        const disabled = isSlotBooked(slot);
                        const isSelected =
                          selectedSlot?.start === slot.start && selectedSlot?.end === slot.end;
                        return (
                          <Button
                            key={slot.start}
                            variant={isSelected ? "default" : "outline"}
                            disabled={disabled}
                            onClick={() => {
                              if (!disabled) setSelectedSlot(slot);
                            }}
                            className={`w-full ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
                            title={disabled ? "Already booked" : undefined}
                          >
                            {timeStr}
                          </Button>
                        );
                      })}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No slots available for this date.</p>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Select a date first.</p>
                )}
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name *</Label>
                  <Input id="name" name="name" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address *</Label>
                  <Input id="email" name="email" type="email" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input id="phone" name="phone" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">Additional Notes</Label>
                  <Textarea id="message" name="message" rows={3} />
                </div>
                <Button type="submit" className="w-full mt-2" disabled={!selectedSlot}>
                  Confirm Booking
                </Button>
              </form>
            </div>
          </CardContent>

          <CardFooter className="text-center text-xs text-muted-foreground py-4">
            Powered by&nbsp;<span className="font-semibold">Bookly</span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default BookPage;
