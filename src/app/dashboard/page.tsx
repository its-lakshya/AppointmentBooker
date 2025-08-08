"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

const Dashboard = () => {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/services");
  }, [router]);

  return null; // or a loading spinner if you want
};

export default Dashboard;