export function CommissionCard({
  earned,
  pending,
  paid,
}: {
  earned: number;
  pending: number;
  paid: number;
}) {
  const fmt = (n: number) => `$${n.toLocaleString()}`;
  return (
    <div className="rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 p-6">
      <h2 className="text-xl font-semibold mb-4">Commission</h2>
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <p className="text-sm text-gray-500">Earned</p>
          <p className="text-lg font-bold">{fmt(earned)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Pending</p>
          <p className="text-lg font-bold text-amber-600">{fmt(pending)}</p>
        </div>
        <div>
          <p className="text-sm text-gray-500">Paid</p>
          <p className="text-lg font-bold text-green-600">{fmt(paid)}</p>
        </div>
      </div>
      <button className="mt-4 w-full rounded-full border border-gray-300 dark:border-gray-700 py-2 text-sm font-medium hover:bg-gray-100 dark:hover:bg-gray-800">
        Request withdrawal
      </button>
    </div>
  );
}
