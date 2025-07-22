import { LucideIcon } from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
}

export const FeatureCard = ({ icon: Icon, title, description }: FeatureCardProps) => {
  return (
    <Card className="w-full h-full bg-nightBlue flex flex-col">
      <CardHeader className="flex-shrink-0">
        <div className="bg-primary p-3 rounded-lg w-fit mb-4 border-2 border-midBlack">
          <Icon className="w-6 h-6 text-primary-foreground" />
        </div>
        <CardTitle className='font-heading font-bold text-xl text-boneWhite mb-3 tracking-wide'>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex-grow flex items-start">
        <p className="font-body text-boneWhite leading-relaxed">
          {description}
        </p>
      </CardContent>
    </Card>
  );
};
