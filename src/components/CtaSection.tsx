import { Link } from "react-router-dom";

export function CtaSection() {
  return (
    <section className="bg-blue-600 text-white py-20 text-center">
      <div className="max-w-2xl mx-auto px-6">
        <h2 className="text-3xl md:text-4xl font-bold">Start your study abroad journey today</h2>
        <p className="mt-3 opacity-90">Free for students. Matched in minutes.</p>
        <Link to="/matches" className="inline-block mt-8 rounded-full bg-white text-blue-600 px-6 py-3 font-medium hover:bg-gray-100">
          Get My Matches Now
        </Link>
      </div>
    </section>
  );
}
