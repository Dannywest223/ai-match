const universities = [
    "Coventry University",
    "Campbellsville University",
    "UTM Malaysia",
    "INTI International",
    "Shinawatra University",
    "UTeM Malaysia",
    "La Salle Barcelona",
  ];
  
  export function TrustedBy() {
    return (
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold">Partnered with top universities</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Verified institutions across 6 countries</p>
          </div>
          <div className="flex flex-wrap justify-center gap-4">
            {universities.map((u) => (
              <div
                key={u}
                className="px-6 py-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 text-sm font-medium text-gray-700 dark:text-gray-300 hover:border-blue-400 dark:hover:border-blue-600 transition"
              >
                {u}
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }