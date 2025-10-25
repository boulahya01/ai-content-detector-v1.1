import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function BillingHistory() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Billing History</CardTitle>
        <CardDescription>View your billing history and past transactions</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Billing history content will go here */}
        <p>Billing history content coming soon...</p>
      </CardContent>
    </Card>
  );
}