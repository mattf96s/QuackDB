import { cn } from "@/lib/utils";
import { Badge } from "~/components/ui/badge";

export default function Pill(props: { children: React.ReactNode }) {
  return (
    <Badge
      variant="outline"
      className={cn("rounded-full px-1 py-0.5 text-xs font-normal")}
    >
      {props.children}
    </Badge>
  );
}
