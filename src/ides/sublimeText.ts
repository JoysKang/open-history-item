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
  readJSONFile,
} from "../util";
import { randomId } from "@raycast/api";

export async function sublimeParsers(configs: Configs): Promise<Project[]> {
  if (configs["Sublime Text"] !== "enable") {
    return [];
  }

  const file = home.concat("/Library/Application Support/Sublime Text/Local/Session.sublime_session");
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    await removeLocalStorage("sublimeText"); // remove old data
    return [];
  }

  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, "sublimeText", mtime);
  if (isGet) {
    return LocalStorageData;
  }

  let data: any = readJSONFile(file);
  if (Object.keys(data).length === 0) {
    return [];
  }
  const projects = data["folder_history"].concat(data["settings"]["new_window_settings"]["file_history"]);

  const projectList = [];
  for (let i = 0; i < projects.length; i++) {
    const item = projects[i];
    projectList.push({
      key: randomId(),
      ide: "Sublime Text",
      icon: "icons/sublimeText.png",
      name: basename(item),
      path: item,
      executableFile: "",
      category: "sublimeText",
      gitUrl: getProjectUrl(item),
      atime: atime,
    });
  }

  await setLocalStorage(projectList, "sublimeText", mtime); // 缓存数据
  return projectList;
}
