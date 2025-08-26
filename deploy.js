import { Camunda8 } from "@camunda8/sdk";
import path from "path"; // we'll use this later

const camunda = new Camunda8();
const zeebe = camunda.getZeebeGrpcApiClient();
async function main() {
  const deploy = await zeebe.deployResource({
    processFilename: path.join(process.cwd(), "bpmn/example-process.bpmn"),
  });
  console.log(
    `[Zeebe] Deployed process ${deploy.deployments[0].process.bpmnProcessId}`
  );
}

main(); 