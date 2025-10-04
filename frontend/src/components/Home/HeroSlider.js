import React from "react";
import Slider from "react-slick";
import { ChevronLeft, ChevronRight } from "lucide-react";

function HeroSlider() {
  const sliderRef = React.useRef(null);

  const slides = [
    {
      title: "Stay Connected Anywhere",
      description:
        "Droptrix international SIMs with pay-as-you-go features and 24/7 support.",
      image:
        "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "Multiple Carriers, One SIM",
      description:
        "Choose your plan and enjoy seamless connectivity across the USA.",
      image:
        "https://images.unsplash.com/photo-1526948128573-703ee1aeb6fa?auto=format&fit=crop&w=1600&q=80",
    },
    {
      title: "24/7 Support Worldwide",
      description:
        "Wherever you go, Droptrix is always with you for hassle-free support.",
      image:
        "https://images.unsplash.com/photo-1518779578993-ec3579fee39f?auto=format&fit=crop&w=1600&q=80",
    },
  ];

  const settings = {
    dots: true,
    infinite: true,
    speed: 600,
    slidesToShow: 1,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 4000,
    arrows: false,
    appendDots: (dots) => (
      <div>
        <ul className="flex justify-center gap-3 mt-4">{dots}</ul>
      </div>
    ),
    customPaging: () => (
      <div className="w-3 h-3 bg-gray-300 rounded-full hover:bg-blue-600 transition"></div>
    ),
  };

  return (
    <div className="w-full md:h-[68vh] h-[70vh] relative overflow-hidden">
      <Slider ref={sliderRef} {...settings} className="h-full">
        {slides.map((slide, index) => {
          const isEven = index % 2 === 0;
          return (
            <div key={index}>
              <div
                className="w-full md:h-[68vh] h-[70vh] bg-cover bg-center relative flex items-center"
                style={{ backgroundImage: `url(${slide.image})` }}
              >
                {/* Strong side gradient overlay */}
                <div
                  className={`absolute top-0 bottom-0 ${
                    isEven
                      ? "left-0 bg-gradient-to-r"
                      : "right-0 bg-gradient-to-l"
                  } from-black/80 to-transparent w-full`}
                ></div>

                {/* Text Content */}
                <div
                  className={`relative z-10 lg:px-40 md:px-20 sm:px-10 px-6 w-3/4  ${
                    isEven ? "md:text-left text-center" : "md:text-right md:ml-auto text-center"
                  }`}
                > 
                  <h2 className="text-3xl sm:text-5xl font-bold text-white mb-3 sm:mb-4 drop-shadow-lg">
                    {slide.title}
                  </h2>
                  <p className="text-white text-base sm:text-lg leading-relaxed">
                    {slide.description}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </Slider>

      {/* Custom Prev Button */}
      <button
        onClick={() => sliderRef.current.slickPrev()}
        className="absolute top-1/2 left-4 sm:left-6 transform -translate-y-1/2 border border-white text-white p-2 sm:p-3 rounded-full bg-transparent hover:bg-white/20 hover:shadow-lg transition"
      >
        <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>

      {/* Custom Next Button */}
      <button
        onClick={() => sliderRef.current.slickNext()}
        className="absolute top-1/2 right-4 sm:right-6 transform -translate-y-1/2 border border-white text-white p-2 sm:p-3 rounded-full bg-transparent hover:bg-white/20 hover:shadow-lg transition"
      >
        <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
      </button>
    </div>
  );
}

export default HeroSlider;
