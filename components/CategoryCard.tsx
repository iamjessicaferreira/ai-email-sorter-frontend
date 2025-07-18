import { Card, CardContent } from "@/components/ui/card";

type Props = {
  name: string;
  description: string;
};

export default function CategoryCard({ name, description }: Props) {
  return (
    <Card>
      <CardContent>
        <h3 className="font-bold text-lg">{name}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
