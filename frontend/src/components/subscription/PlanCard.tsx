interface PlanCardProps {
  title?: string;
  price?: string;
  features?: string[];
}

export default function PlanCard({ title = 'Coming soon', price = '$0', features = [] }: PlanCardProps) {
  return (
    <div className="rounded-lg border p-4">
      <h3 className="text-lg font-semibold">{title}</h3>
      <p className="text-2xl font-bold my-2">{price}</p>
      <ul className="text-sm text-gray-600">
        {features.length > 0 ? features.map((f, i) => <li key={i}>• {f}</li>) : <li>Coming soon</li>}
      </ul>
    </div>
  );
}
