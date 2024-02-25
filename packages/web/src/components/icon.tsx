import type { LucideProps } from "lucide-react";
import { icons } from "lucide-react";

interface IconProps extends LucideProps {
  name: keyof typeof icons;
}

/**
 * Lucide dynamic icon component.
 *
 * Use this isntead of importing icons directly from lucide-react.
 */
export default function Icon({ name, ...props }: IconProps) {
  const LucideIcon = icons[name];

  return <LucideIcon {...props} />;
}
