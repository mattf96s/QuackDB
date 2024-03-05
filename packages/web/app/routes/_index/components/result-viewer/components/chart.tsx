import type { AutoOptions } from "@observablehq/plot";
import { memo, useEffect } from "react";
import Chart from "~/components/plot";
import { ChartProvider } from "~/components/plot/context/provider";
import { useChart } from "~/components/plot/context/useChart";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useQuery } from "~/context/query/useQuery";
import EmptyResults from "./empty";

export const ChartContainer = memo(function ChartContainer() {
  return (
    <ChartProvider>
      <ChartViewer />
    </ChartProvider>
  );
});

/**
 * WIP
 */
function ChartViewer() {
  const { rows, schema } = useQuery();

  const { _dispatch } = useChart();

  useEffect(() => {
    if (!schema.length) return;

    _dispatch({
      type: "INITIALIZE",
      payload: {
        data: {
          rows,
          columns: schema,
        },

        options: {
          x: schema.length > 0 && schema[0] ? schema[0].name : "",
          y: schema.length > 1 && schema[1] ? schema[1].name : "",
        },
      },
    });
  }, [_dispatch, rows, schema]);

  if (!rows.length || !schema.length) {
    return <EmptyResults />;
  }

  return (
    <div className="flex h-full max-h-full flex-1 flex-col justify-between gap-4 overflow-y-auto px-2 py-4 pb-20">
      <Settings />
      <ScrollArea className="mb-4 h-full max-h-[550px] border p-4">
        <Chart />
      </ScrollArea>
    </div>
  );
}

function Settings() {
  return (
    <div className="inline-flex w-full items-center gap-2">
      <MarkPicker />
      <SelectAxis axis="x" />
      <SelectAxis axis="y" />
    </div>
  );
}

type SelectAxisProps = {
  axis: "x" | "y";
};

function SelectAxis(props: SelectAxisProps) {
  const { axis } = props;

  const { x, y, _dispatch, columns } = useChart();

  const current = axis === "x" ? x : y;
  const options = columns.map((c) => c.name);

  const onValueChange = (value: string) => {
    _dispatch({
      type: axis === "x" ? "SET_X" : "SET_Y",
      payload: {
        ...(axis === "x" ? { x: value } : { y: value }),
      },
    });
  };

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">{`${axis.toUpperCase()} Axis`}</p>
      <Select
        value={current?.toString()}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={`Select ${axis}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{`${axis} Axis`}</SelectLabel>
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
              >
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}

type OptionPickerProps = {
  title: string;
  onValueChange: (value: string) => void;
  current: string;
  options: string[];
};

const markOptions: NonNullable<AutoOptions["mark"]>[] = [
  "line",
  "area",
  "bar",
  "dot",
  "rule",
];

function MarkPicker() {
  const { _dispatch, mark } = useChart();

  const onValueChange = (mark: AutoOptions["mark"]) => {
    _dispatch({
      type: "SET_MARK",
      payload: {
        mark,
      },
    });
  };

  return (
    <OptionPicker
      current={mark ?? "line"}
      onValueChange={(v) => onValueChange(v as AutoOptions["mark"])}
      options={markOptions}
      title="Mark"
    />
  );
}

function OptionPicker(props: OptionPickerProps) {
  const { onValueChange, current, options, title } = props;

  return (
    <div className="flex flex-col gap-2">
      <p className="text-xs text-gray-500">{title}</p>
      <Select
        value={current}
        onValueChange={onValueChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder={`Select ${title}`} />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectLabel>{`${title}`}</SelectLabel>
            {options.map((option) => (
              <SelectItem
                key={option}
                value={option}
              >
                {option}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
}
