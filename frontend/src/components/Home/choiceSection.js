import { ArrowRight } from "lucide-react";

function ChoiceSection() {
  const features = [
    {
      title: "Top Carriers",
      desc: "Connect with the most reliable USA networks, all in one SIM.",
      img: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "30 Days Plans",
      desc: "Affordable monthly packages tailored to your needs.",
      img: "https://images.unsplash.com/photo-1502920917128-1aa500764b3a?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "International Plans",
      desc: "Stay connected abroad with low-cost international calling & data.",
      img: "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  return (
    <div className="lg:px-40 md:px-20 sm:px-10 px-6 flex flex-col justify-center items-center py-16 gap-y-10">
      {/* Section Header */}
      <div className="text-center space-y-3 max-w-2xl">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
          Choose a Carrier Plan Today
        </h2>
        <p className="text-gray-600">
          Want flexibility with international calling benefits? Explore our 
          carriers, 30-day packages, and worldwide plans.
        </p>
      </div>

      {/* Feature Grid */}
      <div className="w-full flex flex-col lg:flex-row gap-6 h-auto lg:h-[80vh]">
        {/* Left Large Card */}
        <div className="relative rounded-2xl w-full lg:w-1/2 h-[60vh] lg:h-full overflow-hidden group cursor-pointer transform transition duration-500 hover:scale-[1.02]">
          <img
            src={features[0].img}
            alt={features[0].title}
            className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent rounded-2xl"></div>
          <div className="absolute bottom-0 left-0 p-8 space-y-4">
            <h3 className="text-white text-3xl font-bold drop-shadow-md">
              {features[0].title}
            </h3>
            <p className="text-gray-200 text-lg font-medium leading-relaxed">
              {features[0].desc}
            </p>
            <span className="inline-flex items-center gap-2 text-blue-200 font-semibold text-lg group-hover:text-white transition">
              Explore More
              <ArrowRight className="w-5 h-5 transition-transform duration-300 group-hover:translate-x-2" />
            </span>
          </div>
        </div>

        {/* Right Column with 2 stacked cards */}
        <div className="flex flex-col gap-6 w-full lg:w-1/2 h-[60vh] lg:h-full">
          {features.slice(1).map((feature, i) => (
            <div
              key={i}
              className="relative rounded-2xl w-full h-[30vh] lg:h-1/2 overflow-hidden group cursor-pointer transform transition duration-500 hover:scale-[1.02]"
            >
              <img
                src={feature.img}
                alt={feature.title}
                className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/90 via-blue-900/40 to-transparent rounded-2xl"></div>
              <div className="absolute bottom-0 left-0 p-6 space-y-2">
                <h3 className="text-white text-2xl font-bold drop-shadow-md">
                  {feature.title}
                </h3>
                <p className="text-gray-200 text-base font-medium max-w-sm leading-relaxed">
                  {feature.desc}
                </p>
                <span className="inline-flex items-center gap-2 text-blue-200 font-semibold text-base group-hover:text-white transition">
                  Explore More
                  <ArrowRight className="w-4 h-4 transition-transform duration-300 group-hover:translate-x-2" />
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default ChoiceSection;
