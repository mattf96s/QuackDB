import { SSTConfig } from "sst";
import { Web } from "./stacks/Web";
import { DNS } from "./stacks/DNS";

export default {
  config(_input) {
    return {
      name: "quackdb",
      region: "eu-west-1",
      profile: 'exifbrowser'
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
    app.stack(DNS).stack(Web);
  }
} satisfies SSTConfig;
