"use client";

import type * as Plot from "@observablehq/plot";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { useChart } from "../context/useChart";

// Don't seem to have any effect on Plot.auto mark.
const schemaOptions: {
  value: NonNullable<Plot.ScaleOptions["scheme"]>;
  label: string;
}[] = [
  {
    label: "Category10",
    value: "category10",
  },
  {
    label: "Accent",
    value: "accent",
  },
  {
    label: "Dark2",
    value: "dark2",
  },
  {
    label: "Paired",
    value: "paired",
  },
  {
    label: "Pastel1",
    value: "pastel1",
  },
  {
    label: "Pastel2",
    value: "pastel2",
  },
  {
    label: "Set1",
    value: "set1",
  },
  {
    label: "Set2",
    value: "set2",
  },
  {
    label: "Set3",
    value: "set3",
  },
  {
    label: "Tableau10",
    value: "tableau10",
  },
];

export default function PlotSettings() {
  const { scheme, _dispatch } = useChart();

  return (
    <div className="pr-10">
      <Card>
        <CardHeader>
          <CardTitle>Chart Settings</CardTitle>
          <CardDescription>Adjust the settings for your chart.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-full">
              <Label htmlFor="scheme">Scheme</Label>
              <Select
                value={scheme}
                onValueChange={(v) => {
                  if (!v) return;
                  _dispatch({
                    type: "SET_SCHEME",
                    payload: {
                      scheme: v as Plot.ScaleOptions["scheme"],
                    },
                  });
                }}
              >
                <SelectTrigger id="schema">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {schemaOptions.map((option) => (
                    <SelectItem
                      key={option.value}
                      value={option.value}
                    >
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
