type TFeaturesCards = {
    icon: React.ReactNode;
    title: string;
    description: string;
}

export function FeaturesCards({ icon, title, description }: TFeaturesCards) {
  return (
    <div className="max-h-[350px] h-full flex flex-col items-start justify-between bg-white rounded-2xl p-10">

        <div className="feature-content flex items-start gap-4">
            <div className="feature-icon p-4 bg-purple-200 rounded-full">
                {icon}
            </div>
            <div className="feature-title">
                <h3 className="text-2xl font-bold">{title}</h3>
            </div>
        </div>

        <div className="feature-description mt-6">
            <p className="text-black/80 text-sm">{description}</p>
        </div>
    </div>
  );
}