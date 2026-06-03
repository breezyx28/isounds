import { useCallback, useEffect, useRef, useState } from "react";
import Autoplay from "embla-carousel-autoplay";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  type CarouselApi,
} from "@/components/ui/carousel";
import { cn } from "@/lib/utils";

type BentoCardImageCarouselProps = {
  images: string[];
  className?: string;
};

const AUTOPLAY_DELAY_MS = 3500;

export function BentoCardImageCarousel({
  images,
  className,
}: BentoCardImageCarouselProps) {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  const autoplayPlugin = useRef(
    Autoplay({
      delay: AUTOPLAY_DELAY_MS,
      stopOnInteraction: false,
      stopOnMouseEnter: false,
      playOnInit: true,
    }),
  );

  const onSelect = useCallback((carouselApi: CarouselApi) => {
    if (!carouselApi) return;
    setCurrent(carouselApi.selectedScrollSnap());
  }, []);

  useEffect(() => {
    if (!api) return;
    onSelect(api);
    api.on("select", onSelect);
    api.on("reInit", onSelect);

    const autoplay = api.plugins()?.autoplay;
    if (autoplay && !autoplay.isPlaying()) {
      autoplay.play();
    }

    return () => {
      api.off("select", onSelect);
      api.off("reInit", onSelect);
    };
  }, [api, onSelect]);

  if (images.length === 0) return null;

  return (
    <div
      className={cn("magic-bento-card__media magic-bento-card__media--carousel", className)}
      aria-hidden
    >
      <Carousel
        setApi={setApi}
        opts={{ loop: true, align: "start", duration: 28 }}
        plugins={[autoplayPlugin.current]}
        className="h-full w-full"
      >
        <CarouselContent className="ms-0 h-full">
          {images.map((src, index) => (
            <CarouselItem key={`${src}-${index}`} className="h-full basis-full ps-0">
              <img
                src={src}
                alt=""
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                draggable={false}
                className="h-full w-full object-cover"
              />
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>

      {images.length > 1 && (
        <div className="magic-bento-card__carousel-dots">
          {images.map((src, index) => (
            <button
              key={`dot-${src}-${index}`}
              type="button"
              className={cn(
                "magic-bento-card__carousel-dot",
                index === current && "magic-bento-card__carousel-dot--active",
              )}
              aria-label={`Slide ${index + 1}`}
              onClick={() => api?.scrollTo(index)}
            />
          ))}
        </div>
      )}

      <div className="magic-bento-card__overlay" aria-hidden />
    </div>
  );
}
