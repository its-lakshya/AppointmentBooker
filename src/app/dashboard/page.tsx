import { redirect } from "next/navigation";

const Dashboard = async () => {
  redirect("/dashboard/services");
};

export default Dashboard;
