import EmptyStaff from "@/components/dashboard/staff/EmptyStaff";
import StaffManagement from "@/components/dashboard/staff/StaffManagement";
import { StaffResponse } from "@/types/db";
import { apiRequest } from "@/utils/api/apiRequest";
import { auth } from "@clerk/nextjs/server";

const StaffPage = async () => {
  const { getToken } = await auth();
  const token = await getToken();
  const { data, error } = await apiRequest<StaffResponse>(
    `${process.env.NEXT_PUBLIC_APP_URL}/api/staff`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  const staffListData = { members: data?.staff, error };
  if (!data || staffListData?.members?.length === 0)
    return (
      <div className="w-full h-full flex justify-center items-centere">
        <EmptyStaff />
      </div>
    );
  return (
    <div className="relative w-full h-full flex flex-col ">
      <div className="w-full">
        <StaffManagement data={staffListData}></StaffManagement>
      </div>
    </div>
  );
};

export default StaffPage;
