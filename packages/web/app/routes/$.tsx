import Icon from "~/components/icon";

export default function Component() {
  return (
    <div className="flex size-full items-center justify-center bg-background">
      <span>
        <Icon
          name="Loader2"
          className="mr-3 h-5 w-5 animate-spin"
        />
      </span>
    </div>
  );
}
