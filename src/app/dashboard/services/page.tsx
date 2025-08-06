import AddServiceButton from "@/components/dashboard/services/AddServiceButton";
import EmptyServices from "@/components/dashboard/services/EmptyServices";
import ServicesList from "@/components/dashboard/services/ServicesList";
import { ServiceResponse } from "@/types/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { auth } from "@clerk/nextjs/server";

const ServicePage = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const { data, error } = await apiRequest<ServiceResponse>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/services`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`
      },
    }
  );

  const serviceListData = { services: data?.services, error };
  if (!data || serviceListData?.services?.length === 0)
    return (
      <div className="w-full h-full flex justify-center items-centere">
        <EmptyServices />
      </div>
    );
  return (
    <div className="relative w-full h-full flex flex-col ">
      <AddServiceButton />
      <div className="w-full">
        <ServicesList data={serviceListData}></ServicesList>
      </div>
    </div>
  );
};

export default ServicePage;
