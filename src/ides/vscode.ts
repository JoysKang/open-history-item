import { readFileSync } from "fs";
import { randomId } from "@raycast/api";
import { basename } from "path";
import {
  checkPath,
  getLocalStorage,
  home,
  Project,
  Configs,
  removeLocalStorage,
  setLocalStorage,
  getProjectUrl
} from "../util";


function getVscodeProjectPath(vsProject: { folderUri: string; fileUri: string; workspace: { configPath: string; }; }) {
  return vsProject?.folderUri || vsProject?.fileUri || vsProject?.workspace?.configPath
}


export async function getVSCodeProjects(configs: Configs): Promise<Project[]> {
  if (configs['Visual Studio Code'] !== "enable") {
    return [];
  }

  const file = home.concat("/Library/Application Support/Code/storage.json");
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    await removeLocalStorage("sublimeText");
    return []
  }

  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, "Visual Studio Code", mtime);
  if (isGet) {
    return LocalStorageData
  }

  let data: string = readFileSync(file).toString();
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
      gitUrl: getProjectUrl(projectPath),
      atime: atime
    });
  }
  await setLocalStorage(projectList, "Visual Studio Code", mtime); // 缓存数据
  return projectList;
}