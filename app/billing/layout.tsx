import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Billing - CalmPath AI',
  description: 'Payment processing for CalmPath AI family member subscriptions',
};

export default function BillingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="billing-layout">
      {children}
    </div>
  );
}
