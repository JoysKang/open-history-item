import { readFileSync } from "fs";
import { randomId, setLocalStorageItem } from "@raycast/api";
import { basename } from "path";
import { checkPath, getLocalStorage, home, Project } from "./util";


function getVscodeProjectPath(vsProject: { folderUri: string; fileUri: string; workspace: { configPath: string; }; }) {
  return vsProject?.folderUri || vsProject?.fileUri || vsProject?.workspace?.configPath
}


export async function getVSCodeProjects(): Promise<Project[]> {
  const file = home.concat("/Library/Application Support/Code/storage.json");
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    return []
  }

  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, "Visual Studio Code", mtime);
  if (isGet) {
    return LocalStorageData
  }

  let data = readFileSync(file).toString();
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
  await setLocalStorageItem("Visual Studio Code-stdout", JSON.stringify(projectList));
  await setLocalStorageItem("Visual Studio Code-lastTime", mtime);
  return projectList;
}