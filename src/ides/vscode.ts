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
  getProjectUrl,
  readJSONFile
} from "../util";


export async function getVSCodeProjects(configs: Configs): Promise<Project[]> {
  if (configs["Visual Studio Code"] !== "enable") {
    return [];
  }

  const file = home.concat("/Library/Application Support/Code/User/globalStorage/storage.json");
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    await removeLocalStorage("Visual Studio Code");
    return [];
  }

  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, "Visual Studio Code", mtime);
  if (isGet) {
    return LocalStorageData;
  }

  const data: any = readJSONFile(file);
  if (Object.keys(data).length === 0) {
    return [];
  }
  const submenu = data["lastKnownMenubarData"]["menus"]["File"]["items"].filter((item: { submenu: undefined; }) => item.submenu !== undefined);
  if (!submenu.length) {
    return [];
  }
  const uriList = submenu[0].submenu.items.filter((item: { uri: undefined }) => item.uri !== undefined);
  const projects = uriList.map((item: { uri: any; path: any }) => {
    if (item.uri.authority !== undefined) {
      return item.uri.authority + ' ' + item.uri.path
    }
    return item.uri.path;
  });

  const projectList: Project[] = [];
  for (let i = 0; i < projects.length; i++) {
    const projectPath = projects[i];
    projectList.push({
      key: randomId(),
      ide: "Visual Studio Code",
      icon: "icons/Visual Studio Code.png",
      name: basename(projectPath),
      path: projectPath,
      executableFile: "",
      category: "vscode",
      gitUrl: getProjectUrl(projectPath),
      atime: atime,
    });
  }
  await setLocalStorage(projectList, "Visual Studio Code", mtime); // 缓存数据
  return projectList;
}
