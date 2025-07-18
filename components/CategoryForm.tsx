import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type Props = {
  name: string;
  description: string;
  onChange: (key: string, value: string) => void;
  onSubmit: () => void;
};

export default function CategoryForm({
  name,
  description,
  onChange,
  onSubmit,
}: Props) {
  return (
    <div className="flex flex-col gap-2 max-w-md">
      <Input
        placeholder="Category Name"
        value={name}
        onChange={(e) => onChange("name", e.target.value)}
      />
      <Input
        placeholder="Category Description"
        value={description}
        onChange={(e) => onChange("description", e.target.value)}
      />
      <Button onClick={onSubmit}>Add</Button>
    </div>
  );
}
