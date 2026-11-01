export function StatsBar() {
    const stats = [
      { value: "7", label: "Partner universities" },
      { value: "400+", label: "Programs available" },
      { value: "6", label: "Countries covered" },
      { value: "2 min", label: "To get matched" },
    ];
    return (
      <section className="border-y border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 py-12">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-3xl md:text-4xl font-bold text-blue-600">{s.value}</p>
                <p className="text-sm text-gray-500 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }