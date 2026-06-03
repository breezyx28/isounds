import { twMerge } from "tailwind-merge";

type TCompanyCard = {
  icon: string;
  name: string;
  title: string;
  className?: string;
};

export function HeroCompanyCards({ icon, name, title, className }: TCompanyCard) {
  return (
    <div className="hero-company-cards flex max-w-[fit-content] gap-6">
      <div
        className={twMerge(
          "company-icon flex h-14 w-14 items-center justify-center rounded-full bg-gradient-to-tr from-primary-bright/30 to-primary/20",
          className,
        )}
      >
        <img src={icon} alt={name} className="h-12 w-12 object-contain" />
      </div>
      <div className="company-content">
        <p className="text-sm font-normal text-text-muted">{title}</p>
        <p className="text-lg font-bold capitalize text-text">{name}</p>
      </div>
    </div>
  );
}
