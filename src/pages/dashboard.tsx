import { withAuth } from "../lib/authutils";
import { Suspense } from 'react';
import { LatestInvoicesSkeleton, RevenueChartSkeleton } from '../components/skeletons';
const Dashboard = () => {
  return (
    <>
      <h1>Dashboard</h1>
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-4 lg:grid-cols-8">
        <LatestInvoicesSkeleton />
        <LatestInvoicesSkeleton />
        <LatestInvoicesSkeleton />
        <LatestInvoicesSkeleton />

            {/* <Suspense fallback={<RevenueChartSkeleton />}>
              <RevenueChart />
            </Suspense>
            <Suspense fallback={<LatestInvoicesSkeleton />}>
              <LatestInvoices />
            </Suspense> */}

      </div>
    </>
  )
};

export default withAuth(Dashboard);