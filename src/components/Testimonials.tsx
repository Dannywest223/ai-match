const testimonials = [
    {
      quote: "Arrows found me a scholarship in Canada I didn't even know existed. The 2-minute match process is insane.",
      name: "Amina D.",
      country: "Senegal 🇸🇳",
      rating: 5,
    },
    {
      quote: "I was overwhelmed by UK applications. Arrows broke it down step-by-step and I got my offer in 3 weeks.",
      name: "Kwame M.",
      country: "Ghana 🇬🇭",
      rating: 5,
    },
    {
      quote: "The AI chat answered all my visa questions instantly at 2 AM. Highly recommend!",
      name: "Fatima B.",
      country: "Nigeria 🇳🇬",
      rating: 5,
    },
  ];
  
  export function Testimonials() {
    return (
      <section className="py-20 bg-gray-50 dark:bg-gray-900/50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold">What students say</h2>
            <p className="text-gray-600 dark:text-gray-400 mt-2">Real feedback from students using Arrows</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {testimonials.map((t) => (
              <div key={t.name} className="p-6 rounded-2xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
                <div className="flex gap-0.5 mb-4 text-yellow-500">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed mb-4">
                  "{t.quote}"
                </p>
                <div className="pt-4 border-t border-gray-100 dark:border-gray-800">
                  <p className="font-semibold text-sm">{t.name}</p>
                  <p className="text-xs text-gray-500">{t.country}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    );
  }