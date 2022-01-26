import { readFileSync } from "fs";
import { randomId } from "@raycast/api";
import { basename } from "path";
import { checkPath, home, Project } from "./util";


function getVscodeProjectPath(vsProject: { folderUri: string; fileUri: string; workspace: { configPath: string; }; }) {
  return vsProject?.folderUri || vsProject?.fileUri || vsProject?.workspace?.configPath
}


export async function getVSCodeProjects(): Promise<Project[]> {
  const fileName = home.concat("/Library/Application Support/Code/storage.json");
  const [isExist, atime, _] = checkPath(fileName);
  if (!isExist) {
    return []
  }

  let data = readFileSync(fileName).toString();
  if (!data.length) {
    return [];
  }

  data = JSON.parse(data)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const projects = data["openedPathsList"]["entries"]     // 需清除掉 file://

  const projectList: Project[] = []
  for (let i = 0; i < projects.length; i++) {
    const item = getVscodeProjectPath(projects[i])
    if (typeof item !== 'string') {
      continue
    }
    const projectPath = item.replace("file://", "")
    projectList.push({
      key: randomId(),
      ide: "Visual Studio Code",
      icon: "icons/Visual Studio Code.png",
      name: basename(projectPath),
      path: projectPath,
      executableFile: "",
      category: "vscode",
      atime: atime
    });
  }
  return projectList;
}