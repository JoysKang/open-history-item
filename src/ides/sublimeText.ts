import { readFileSync } from "fs";
import { basename } from "path";
import { checkPath, getLocalStorage, home, Project, removeLocalStorage, setLocalStorage } from "../util";
import { randomId } from "@raycast/api";

export async function sublimeParsers(): Promise<Project[]> {
  const file = home.concat("/Library/Application Support/Sublime Text/Local/Session.sublime_session");
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    await removeLocalStorage("sublimeText"); // remove old data
    return []
  }

  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, "sublimeText", mtime);
  if (isGet) {
    return LocalStorageData
  }

  let data: string = readFileSync(file).toString()
  if (!data.length) {
    return [];
  }

  data = JSON.parse(data);
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const projects = data["folder_history"].concat(data['settings']['new_window_settings']["file_history"])

  const projectList = []
  for (let i = 0; i < projects.length; i++) {
    const item = projects[i]
    projectList.push({
      key: randomId(),
      ide: "sublime Text",
      icon: "icons/sublimeText.png",
      name: basename(item),
      path: item,
      executableFile: "",
      category: "sublimeText",
      atime: atime
    });
  }

  await setLocalStorage(projectList, "sublimeText", mtime); // 缓存数据
  return projectList;
}