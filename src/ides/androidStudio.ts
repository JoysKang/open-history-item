// 获取 JetBrains 的项目列表
import { Application } from "@raycast/api";
import { checkPath, Configs, Project, removeLocalStorage, searchFiles } from "../util";
import { readFileSync } from "fs";
import { jetBrainsParsers } from "./jetbrains";


export async function getAndroidStudioProjects(apps: Application[], configs: Configs): Promise<Project[]> {
  if (configs['Android Studio'] !== "enable") {
    return [];
  }

  const fileList = searchFiles("/Library/Application Support/Google/");
  const projectList: Project[] = [];
  for (const file of fileList) {
    const [isExist, _, mtime] = checkPath(file);
    if (!isExist) {
      await removeLocalStorage('Android Studio');
      continue;
    }

    const data = readFileSync(file);
    if (!data.length) {
      continue;
    }

    const projects: Project[] = await jetBrainsParsers(data, file, mtime, apps);
    if (projects.length) {
      projectList.push(...projects);
    }
  }
  return projectList;
}