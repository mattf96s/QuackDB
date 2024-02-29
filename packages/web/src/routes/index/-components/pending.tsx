import Icon from "@/components/icon";

export default function PendingComponent() {
  return (
    <div className="flex flex-col items-center space-y-2">
      <Icon
        name="Activity"
        className="size-8"
      />
      <div className="space-y-2 text-center">
        <h2 className="text-lg font-medium">Loading your dashboard</h2>
        <p className="text-sm opacity-70">This should only take a moment.</p>
      </div>
    </div>
  );
}
