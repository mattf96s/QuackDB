import type { SSTConfig } from "sst";
import { Web } from "./stacks/Web";

export default {
  config(_input) {
    return {
      name: "quackdb",
      region: "eu-west-1",
      profile: "quackdb",
    };
  },
  stacks(app) {
    if (app.stage !== "production") {
      app.setDefaultRemovalPolicy("destroy");
    }
    app.setDefaultFunctionProps({
      tracing: "disabled",
      runtime: "nodejs20.x",
    });
    app.stack(Web);
  },
} satisfies SSTConfig;
