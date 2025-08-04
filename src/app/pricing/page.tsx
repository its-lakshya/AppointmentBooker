"use client";

import { useAuth } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: string;
  price_id: string;
}

type User = {
  id: string;
  clerk_user_id: string;
  email: string;
  first_name: string;
  last_name: string;
  image_url: string;
  stripe_customer_id: string;
  stripe_status: string;
  stripe_subscription_id: string;
};
type Subscription = {
  id: string;
  user_id: string;
  stripe_subscription_id: string;
  stripe_price_id: string;
  stripe_customer_id: string;
  status: string;
  current_period_start: string;
  current_period_end: string;
};

const Pricing = () => {
  const router = useRouter();
  const { isSignedIn, userId } = useAuth();

  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [user, setUser] = useState<User>();
  const [userSubscriptionDetails, setUserSubscriptionDetails] = useState<Subscription>();
  const [loading, setLoading] = useState(true);

  // Fetch pricing plans
  useEffect(() => {
    async function fetchPlans() {
      try {
        const res = await fetch("/api/stripe/subscription-plans");
        if (!res.ok) throw new Error("Failed to fetch subscription plans");

        const data = await res.json();
        setPlans(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchPlans();
  }, []);

  // Fetch user details
  useEffect(() => {
    async function fetchUserDetails() {
      const res = await fetch("/api/user");
      if (!res.ok) {
        console.error("Failed to fetch user");
        return;
      }

      const data = await res.json();
      setUser(data);
    }

    if(isSignedIn) fetchUserDetails();
  }, [isSignedIn, userId]);

  // Fetch subscription details
  useEffect(() => {
    async function fetchSubscriptionDetails() {
      const res = await fetch("/api/user/subscription", {
        method: 'POST',
        body: JSON.stringify({
          userId: user?.id
        })
      });
      if (!res.ok) {
        console.error("Failed to fetch subscriptoin details");
        return;
      }

      const data = await res.json();
      setUserSubscriptionDetails(data);
    }

    if(user) fetchSubscriptionDetails();
  }, [user]);

  // Handle checkout session
  const handleClickSubscribeButton = async (priceId: string) => {
    if (!isSignedIn) {
      throw new Error("User is not signed in");
    }

    const res = await fetch("/api/stripe/create-checkout-session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: user?.id,
        email: user?.email,
        priceId,
      }),
    });

    const data = await res.json();
    if (data.url) {
      router.push(data.url);
    } else {
      console.error("Failed to create checkout session");
    }
  };


  // const handleEditPaymentDetails = async () => {
  //   const url = process.env.NEXT_PUBLIC_STRIPE_CUSTOMER_PORTAL
  //   if(url){
  //     router.push(url + "?" + user?.email)
  //   } else {
  //     throw new Error("Failed to edit payment details")
  //   }
  // }

  // Handle customer portal access
  const handleCreateCustomerPortal = async () => {
    if (!userSubscriptionDetails?.stripe_customer_id) {
      console.error("No Stripe customer ID found");
      return;
    }

    try {
      setLoading(true);
      const res = await fetch("/api/stripe/create-customer-portal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId: userSubscriptionDetails.stripe_customer_id }),
      });

      const data = await res.json();
      console.log(data)
      if (data.url) {
        router.push(data.url);
      } else {
        console.error("Error:", data.error);
      }
    } catch (error) {
      console.error("Error:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 text-center">
          <h2 className="font-manrope text-5xl font-bold text-gray-900 mb-4">
            Our pricing plans
          </h2>

          <div className="tabs">
            <div
              id="tabs-with-background-2"
              className="tabcontent mt-12"
              role="tabpanel"
              aria-labelledby="tabs-with-background-item-2"
            >
              <div className="space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-8 lg:space-y-0">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className="group relative flex flex-col mx-auto w-full max-w-sm text-gray-900 rounded-2xl border border-gray-300 text-center transition-all duration-300 p-6 xl:p-12 hover:border-indigo-600"
                  >
                    <h3 className="font-manrope text-2xl font-bold mb-6">
                      {plan.name}
                    </h3>
                    <div className="mb-20 flex flex-col">
                      <span className="font-manrope text-6xl font-semibold mb-2">
                        ${plan.price}.00
                      </span>
                      <span className="text-xl text-gray-400">
                        {plan.interval}
                      </span>
                    </div>
                    <button
                      className="py-2.5 px-5 bg-indigo-50 shadow-sm rounded-full transition-all duration-500 text-base text-indigo-600 font-semibold text-center w-fit mx-auto group-hover:bg-indigo-600 group-hover:text-white"
                      onClick={() => handleClickSubscribeButton(plan.price_id)}
                    >
                      Purchase Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {userSubscriptionDetails && (
          <div className="text-center mt-12">
            <button
              className="px-4 py-2 bg-blue-600 text-white rounded-full hover:scale-105 transition-all duration-300 cursor-pointer"
              onClick={handleCreateCustomerPortal}
            >
              Manage Subscription
            </button>
          </div>
        )}
      </div>
    </section>
  );
};

export default Pricing;
