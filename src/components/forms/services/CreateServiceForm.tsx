import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ServiceCreateResponse } from "@/types/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import RequiredLabel from "../RequiredLabel";
import { useRouter } from "next/navigation";

type CreateServiceFormProps = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

const formSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  duration: z
    .number({ message: "Duration is required" })
    .int({ message: "Duration must be an integer" })
    .positive({ message: "Duration must be positive" }),
  price: z
    .number({ message: "Price is required" })
    .int({ message: "Price must be an integer" })
    .positive({ message: "Price must be positive" }),
});

type FormInputValues = {
  name: string;
  description: string;
  duration: number;
  price: number;
};

export const CreateServiceForm = ({
  open,
  setOpen,
}: CreateServiceFormProps) => {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Temporary workaround
    defaultValues: {
      name: "",
      description: "",
      duration: 0,
      price: 0,
    },
  });

  const onSubmit = async (values: FormInputValues) => {
    try {
      const result = formSchema.safeParse(values);
      if (result.success) {
        const { data, error } = await apiRequest<ServiceCreateResponse>(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/services`,
          {
            method: "POST",
            body: {
              ...values,
            },
          }
        );
        if(data?.success) {
          router.refresh();
          setOpen(false);
          form.reset()
        }
        else {
          console.log(error)
        }
      } else {
        console.log(result.error.format());
      }
    } catch (error) {
      console.error("Form submission error", error);
      toast.error("Failed to submit the form. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add new service</DialogTitle>
          <DialogDescription>
            Fill in the details to create a service.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Name */}
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Service Name</RequiredLabel>
                  <FormControl>
                    <Input placeholder="Your service" type="text" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Description */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Description</RequiredLabel>
                  <FormControl>
                    <Input placeholder="Describe your service" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Duration */}
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Duration</RequiredLabel>
                  <FormControl>
                    <Input
                      placeholder="Eg. 60"
                      type="number"
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormDescription>
                    Duration should be in minutes only.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Price */}
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <RequiredLabel>Price</RequiredLabel>
                  <FormControl>
                    <Input
                      placeholder="Eg. $25"
                      type="number"
                      inputMode="numeric"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Footer */}
            <DialogFooter className="pt-2">
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit">Save changes</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default CreateServiceForm;
