import { twMerge } from "tailwind-merge";

type TCompanyCard = {
  icon: string;
  name: string;
  title: string;
  className?: string;
};

export function HeroCompanyCards({ icon, name, title, className }: TCompanyCard) {
  return (
    <div className="hero-company-cards flex min-w-0 max-w-full items-center gap-3 sm:max-w-[fit-content] sm:gap-6">
      <div
        className={twMerge(
          "company-icon flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-primary-bright/30 to-primary/20 sm:h-14 sm:w-14",
          className,
        )}
      >
        <img src={icon} alt={name} className="h-10 w-10 object-contain sm:h-12 sm:w-12" />
      </div>
      <div className="company-content min-w-0">
        <p className="truncate text-xs font-normal text-text-muted sm:text-sm">{title}</p>
        <p className="truncate text-base font-bold capitalize text-text sm:text-lg">{name}</p>
      </div>
    </div>
  );
}
