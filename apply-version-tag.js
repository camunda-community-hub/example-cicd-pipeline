const fs = require("fs");
const BpmnModdle = require("bpmn-moddle");
const zeebeModdle = require("zeebe-bpmn-moddle/resources/zeebe.json");

const processTag = process.argv[2];
if (!processTag) {
  console.error("Please provide a process tag as an argument");
  process.exit(1);
}

const moddle = new BpmnModdle({ zeebe: zeebeModdle });

const hasProcessTag = (process) => {
  return (
    process.extensionElements &&
    process.extensionElements.values &&
    process.extensionElements.values.filter(
      (el) => el.$type === "zeebe:VersionTag"
    ).length > 0
  );
};

const updateProcessTag = (process, tag) => {
  const versionTagElement = process.extensionElements.values.find(
    (el) => el.$type === "zeebe:VersionTag"
  );
  versionTagElement.value = tag;
  console.log(`Updated process ${process.id} with tag ${tag}`);
};

const createProcessTag = (process, tag) => {
  const versionTagElement = moddle.create("zeebe:VersionTag", { value: tag });
  if (!process.extensionElements) {
    process.extensionElements = moddle.create("bpmn:ExtensionElements", {
      values: [versionTagElement],
    });
  } else if (!process.extensionElements.values) {
    process.extensionElements.values = [versionTagElement];
  } else {
    process.extensionElements.values.push(versionTagElement);
  }
  console.log(`Created process tag for ${process.id} with tag ${tag}`);
};

const main = async () => {
  const { rootElement: definitions } = await moddle.fromXML(
    fs.readFileSync("bpmn/example-process.bpmn", "utf8")
  );
  const processes = definitions.rootElements.filter(
    (element) => element.$type === "bpmn:Process"
  );
  processes.forEach((process) => {
    if (hasProcessTag(process)) {
      updateProcessTag(process, processTag);
    } else {
      createProcessTag(process, processTag);
    }
  });
  const updatedBpmn = await moddle.toXML(definitions, { format: true });
  fs.writeFileSync("bpmn/example-process.bpmn", updatedBpmn.xml);
};

main();
