const countries = [
  "🇬🇧 UK",
  "🇺🇸 USA",
  "🇨🇦 Canada",
  "🇦🇺 Australia",
  "🇩🇪 Germany",
  "🇲🇾 Malaysia",
  "🇹🇭 Thailand",
  "🇪🇸 Spain",
];

export function TrustSignals() {
  return (
    <section className="border-y border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 py-10">
      <div className="max-w-5xl mx-auto px-6 text-center">
        <p className="text-sm text-gray-500 mb-4">Trusted by students from 30+ countries</p>
        <div className="flex flex-wrap justify-center gap-3">
          {countries.map((c) => (
            <span key={c} className="text-sm bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 px-3 py-1 rounded-full">
              {c}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}