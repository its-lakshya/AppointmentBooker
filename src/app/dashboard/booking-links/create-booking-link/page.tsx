"use client";
import { CalendarIcon } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import RequiredLabel from "@/components/forms/RequiredLabel";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  MultiSelector,
  MultiSelectorContent,
  MultiSelectorInput,
  MultiSelectorItem,
  MultiSelectorList,
  MultiSelectorTrigger,
  MultiSelectValue,
} from "@/components/ui/multi-select";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import {
  Addon,
  AddonsResponse,
  CreateBookingLinkResponse,
  Service,
  ServiceResponse,
  StaffResponse,
  User,
} from "@/types/db";
import { BookingLinkType } from "@/types/enums";
import { apiRequest } from "@/utils/api/apiRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@radix-ui/react-popover";

const weekdays: { key: string; label: string }[] = [
  { key: "Monday", label: "Monday" },
  { key: "Tuesday", label: "Tuesday" },
  { key: "Wednesday", label: "Wednesday" },
  { key: "Thursday", label: "Thursday" },
  { key: "Friday", label: "Friday" },
  { key: "Saturday", label: "Saturday" },
  { key: "Sunday", label: "Sunday" },
];

type MinimalAvailabilityConfig = {
  timezone: string;
  workingHours: {
    [day: string]: {
      enabled: boolean;
      slots: { start: string; end: string }[];
    };
  };
  startDate: string;
  maxBookingDaysInFuture: number;
  slotIntervalMinutes?: number;
  slotGapMinutes?: number;
};

const defaultAvailabilityConfig: MinimalAvailabilityConfig = {
  timezone:
    typeof window !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone
      : "Asia/Kolkata", // fallback for SSR,
  workingHours: {},
  startDate: new Date().toISOString().split("T")[0],
  maxBookingDaysInFuture: 30,
  slotIntervalMinutes: 5,
  slotGapMinutes: 0,
};

const formSchema = z.object({
  name: z.string().min(1),
  slug: z.string().min(1),
  type: z.string().min(1),
  maxAttendees: z.number().min(1),
  paymentRequired: z.boolean(),
  serviceId: z.string().min(1),
  staffIds: z.array(z.string()).optional(),
  addonIds: z.array(z.string()).optional(),
  availabilityConfig: z.object({
    timezone: z.string(),
    workingHours: z.record(
      z.string(),
      z.object({
        enabled: z.boolean(),
        slots: z.array(
          z.object({
            start: z.string(),
            end: z.string(),
          })
        ),
      })
    ),
    startDate: z.string(),
    maxBookingDaysInFuture: z.number().min(0),
    slotIntervalMinutes: z.number(),
    slotGapMinutes: z.number(),
    selectedWeekdays: z
      .array(z.string())
      .nonempty("Please select at least one weekday"),
  }),
});

export function CreateBookingLinkPage() {
  const form = useForm<
    z.infer<typeof formSchema> & {
      availabilityConfig: {
        selectedWeekdays?: string[];
        slotStart?: string;
        slotEnd?: string;
      };
    }
  >({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      slug: "",
      type: "",
      maxAttendees: 1,
      paymentRequired: false,
      serviceId: "",
      staffIds: [],
      addonIds: [],
      availabilityConfig: defaultAvailabilityConfig,
    },
  });

  const router = useRouter();

  const [services, setServices] = useState<Service[]>();
  const [staff, setStaff] = useState<User[]>();
  const [addons, setAddons] = useState<Addon[]>();

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    const selectedDays: string[] =
      form.getValues("availabilityConfig.selectedWeekdays") || [];
    const start = form.getValues("availabilityConfig.slotStart") || "09:00";
    const end = form.getValues("availabilityConfig.slotEnd") || "17:00";

    const updatedWorkingHours = { ...values.availabilityConfig.workingHours };

    const selectedDate = values.availabilityConfig.startDate; // e.g., "2025-08-05"

    const [hours, minutes] = start.split(":").map(Number);
    const [endHours, endMinutes] = end.split(":").map(Number);

    const startUTC = new Date(selectedDate);
    startUTC.setHours(hours, minutes, 0, 0);

    const endUTC = new Date(selectedDate);
    endUTC.setHours(endHours, endMinutes, 0, 0);

    // Convert to ISO string (UTC)
    const startISO = startUTC.toISOString();
    const endISO = endUTC.toISOString();

    selectedDays.forEach((day) => {
      updatedWorkingHours[day] = {
        enabled: true,
        slots: [{ start: startISO, end: endISO }],
      };
    });

    const finalValues = {
      ...values,
      availabilityConfig: {
        ...values.availabilityConfig,
        workingHours: updatedWorkingHours,
      },
    };

    try {
      const { data, error } = await apiRequest<CreateBookingLinkResponse>(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/booking-links`,
        {
          method: "POST",
          body: {
            ...finalValues,
          },
        }
      );
      if (data?.success) {
        form.reset();
        router.refresh();
        router.push("/dashboard/booking-links");
        console.log(data.bookingLink);
      } else console.log(error);
    } catch (error) {
      console.log(error);
    }
  };

  const getServices = async () => {
    try {
      const { data } = await apiRequest<ServiceResponse>(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/services`,
        { method: "GET" }
      );
      if (data?.success) setServices(data.services);
    } catch (error) {
      console.log(error);
    }
  };

  const getStaff = async () => {
    try {
      const { data } = await apiRequest<StaffResponse>(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/staff`,
        { method: "GET" }
      );
      if (data?.success) setStaff(data.staff);
    } catch (error) {
      console.log(error);
    }
  };

  const getAddons = async () => {
    try {
      const { data } = await apiRequest<AddonsResponse>(
        `${process.env.NEXT_PUBLIC_APP_URL}/api/addons`,
        {
          method: "GET",
          body: {
            serviceId: services ? services[services.length - 1].id : null,
          },
        }
      );
      if (data?.success)
        setAddons((prev = []) => [...prev, ...(data.addons || [])]);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    getServices();
    getStaff();
  }, []);

  useEffect(() => {
    if (services) getAddons();
  }, [services]);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Create Booking Link
          </h1>
          <p className="text-sm text-muted-foreground">
            Set up a new booking link by selecting a service, availability, and
            staff.
          </p>
        </div>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-4">
              {/* Name */}
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Name</RequiredLabel>
                    <FormControl>
                      <Input placeholder="Booking link name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slug */}
              <FormField
                control={form.control}
                name="slug"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>URL</RequiredLabel>
                    <FormControl>
                      <Input placeholder="Eg. service-online" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Type */}
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Type</RequiredLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={BookingLinkType.Individual}>
                          Individual
                        </SelectItem>
                        <SelectItem value={BookingLinkType.RoundRobin}>
                          Round Robin
                        </SelectItem>
                        <SelectItem value={BookingLinkType.Group}>
                          Group
                        </SelectItem>
                        <SelectItem value={BookingLinkType.Collective}>
                          Collective
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {form.watch("type") === BookingLinkType.Group && (
                <FormField
                  control={form.control}
                  name="maxAttendees"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Maximum number of attendees</RequiredLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="Number of allowed people"
                          value={field.value}
                          onChange={(e) =>
                            field.onChange(Number(e.target.value))
                          }
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Service */}
              <FormField
                control={form.control}
                name="serviceId"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Service</RequiredLabel>
                    <FormControl>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select a service" />
                        </SelectTrigger>
                        <SelectContent>
                          {services?.map((service) => (
                            <SelectItem key={service.id} value={service.id}>
                              {service.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Staff */}
              <FormField
                control={form.control}
                name="staffIds"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Staff</RequiredLabel>
                    <FormControl>
                      <MultiSelector
                        values={field?.value?.map((v) => {
                          const staffMember = staff?.find((s) => s.id === v);
                          return {
                            value: v,
                            label: staffMember?.first_name || v,
                          };
                        })}
                        onValuesChange={(vals: MultiSelectValue[]) =>
                          field.onChange(vals.map((v) => v.value))
                        }
                      >
                        <MultiSelectorTrigger>
                          <MultiSelectorInput placeholder="Select staff" />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {staff?.map((staffMember) => (
                              <MultiSelectorItem
                                key={staffMember.id}
                                value={staffMember.id}
                                label={staffMember.first_name}
                              >
                                {staffMember.first_name} {staffMember.last_name}
                              </MultiSelectorItem>
                            ))}
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Addons */}
              {form.watch("serviceId") !== "" && addons ? (
                <FormField
                  control={form.control}
                  name="addonIds"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Addons</RequiredLabel>
                      <FormControl>
                        <MultiSelector
                          values={field?.value?.map((v) => {
                            const addon = addons?.find((s) => s.id === v);
                            return { value: v, label: addon?.name || v };
                          })}
                          onValuesChange={(vals: MultiSelectValue[]) =>
                            field.onChange(vals.map((v) => v.value))
                          }
                        >
                          <MultiSelectorTrigger>
                            <MultiSelectorInput placeholder="Select Addons" />
                          </MultiSelectorTrigger>
                          <MultiSelectorContent>
                            <MultiSelectorList>
                              {addons?.map((addon) => (
                                <MultiSelectorItem
                                  key={addon.id}
                                  value={addon.id}
                                  label={addon.name}
                                >
                                  {addon.name}
                                </MultiSelectorItem>
                              ))}
                            </MultiSelectorList>
                          </MultiSelectorContent>
                        </MultiSelector>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : null}
            </div>

            {/* Right Column */}
            <div className="space-y-4">
              {/* Start Date */}
              <FormField
                control={form.control}
                name="availabilityConfig.startDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <RequiredLabel>Start Date</RequiredLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              new Date(field.value).toISOString().split("T")[0]
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={
                            field.value ? new Date(field.value) : undefined
                          }
                          onSelect={(date) =>
                            field.onChange(date?.toISOString() || "")
                          }
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Max Booking Days */}
              <FormField
                control={form.control}
                name="availabilityConfig.maxBookingDaysInFuture"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Valid Up To (Days in Future)</RequiredLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slot Interval + Gap */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availabilityConfig.slotIntervalMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Slot Interval (min)</RequiredLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availabilityConfig.slotGapMinutes"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Gap Between Slots (min)</RequiredLabel>
                      <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Weekdays */}
              <FormField
                control={form.control}
                name="availabilityConfig.selectedWeekdays"
                render={({ field }) => (
                  <FormItem>
                    <RequiredLabel>Select Weekdays</RequiredLabel>
                    <FormControl>
                      <MultiSelector
                        values={
                          field.value?.map((day) => ({
                            value: day,
                            label: day,
                          })) || []
                        }
                        onValuesChange={(vals: MultiSelectValue[]) =>
                          field.onChange(vals.map((v) => v.value))
                        }
                      >
                        <MultiSelectorTrigger>
                          <MultiSelectorInput placeholder="Weekdays" />
                        </MultiSelectorTrigger>
                        <MultiSelectorContent>
                          <MultiSelectorList>
                            {weekdays.map((day) => (
                              <MultiSelectorItem
                                key={day.key}
                                value={day.key}
                                label={day.label}
                              >
                                {day.label}
                              </MultiSelectorItem>
                            ))}
                          </MultiSelectorList>
                        </MultiSelectorContent>
                      </MultiSelector>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Slot Start + End */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="availabilityConfig.slotStart"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>Start Time</RequiredLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="availabilityConfig.slotEnd"
                  render={({ field }) => (
                    <FormItem>
                      <RequiredLabel>End Time</RequiredLabel>
                      <FormControl>
                        <Input
                          type="time"
                          {...field}
                          value={field.value || ""}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>

              {/* Payment Checkbox */}
              <FormField
                control={form.control}
                name="paymentRequired"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 border p-4 rounded-md">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel>Payment Required</FormLabel>
                      <FormDescription>
                        Enable this if the booking requires payment.
                      </FormDescription>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-4">
            <Button type="reset" variant="outline">
              Reset
            </Button>
            <Button type="submit">Submit</Button>
          </div>
        </form>
      </Form>
    </div>
  );
}

export default CreateBookingLinkPage;
