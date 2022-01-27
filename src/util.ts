import { lstatSync, readdirSync } from "fs";
import { homedir } from "os"
import { getLocalStorageItem, removeLocalStorageItem, setLocalStorageItem, environment } from "@raycast/api";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import parse from 'parse-git-config';


// home directory
export const home = homedir();


export type Project = {
  key: string;
  ide: string;
  icon: string;
  name: string;
  path: string;
  executableFile: string;
  category: string;
  gitUrl: string;
  atime: number;
};


export type Configs = {
  FromLocalStorage: boolean;
  Xcode: string;
  JetBrains: string[];
  'Android Studio': string;
  'Visual Studio Code': string;
  'Sublime Text': string;
};


// 判断路径是否存在
export function checkPath(path: string): [boolean, number, number] {
  try {
    const file = lstatSync(path);
    return [true, file.atimeMs, file.mtimeMs];
  } catch (err) {
    return [false, 0, 0]
  }
}


// 搜索 JetBrains 的历史项目文件
function readFileList(path: string, filesList: { absolutePath: string; atimeMs: number; }[]) {
  const files = readdirSync(path);
  files.forEach(function (itm) {
    const stat = lstatSync(path + itm);
    const absolutePath = path + itm
    if (stat.isDirectory()) {
      // 过滤 AndroidStudiox.x 下的非 options 目录
      if (absolutePath.indexOf("Google") !== -1 &&
        absolutePath.indexOf("AndroidStudio") === -1 &&
        absolutePath.indexOf("options") === -1) {
        return;
      }

      // 过滤 JetBrains 下的非 options 目录
      else if (absolutePath.indexOf("JetBrains") !== -1 &&
        // !/\d/.test(absolutePath) &&
        // 排除 JetBrains 下第一级的目录
        absolutePath.split('/').indexOf('JetBrains') !== absolutePath.split('/').length - 2 &&
        absolutePath.indexOf("options") === -1) {
        return;
      }

      readFileList(absolutePath + "/", filesList)
    } else if (itm === "recentProjects.xml" || itm === "recentSolutions.xml"){
      filesList.push({"absolutePath": absolutePath, "atimeMs": stat.atimeMs});
    }
  })
  return filesList
}


// 查找 JetBrains、AndroidStudio 项目历史文件
export function searchFiles(element: string): string[] {
  // JetBrains 中 Rider 使用的是 recentSolutions.xml 其他 IDE 使用的是 recentProjects.xml
  let make = ""
  if (element.indexOf("JetBrains") !== -1) {
    make = "JetBrains/"
  } else if (element.indexOf("Google") !== -1) {
    make = "Google/"
  }
  if (make !== "") {
    const files = [];
    const ides = new Set()
    const allRecentProjects = readFileList(home.concat(element), [])

    // 先排序，后遍历，排除重复
    allRecentProjects.sort(function(a, b){return b.atimeMs - a.atimeMs});
    for (let i = 0; i < allRecentProjects.length; i++) {
      const absolutePath = allRecentProjects[i].absolutePath;
      const ideStr = absolutePath.split(make)[1].substring(0, 4)

      if (!ides.has(ideStr)) {
        files.push(absolutePath)
        ides.add(ideStr)
      }
    }

    return files;
  }

  return []
}


export async function getLocalStorage(file: string, ide: string, mtime: number): Promise<[[], boolean]> {
  // 清空缓存, 测试用
  if (environment.isDevelopment) {
    await removeLocalStorageItem(file)
    return [[], false];
  }


  const lastTime: number | undefined = await getLocalStorageItem(ide.concat("-lastTime"));
  if (mtime === lastTime) {
    return [JSON.parse(<string>await getLocalStorageItem(ide.concat("-stdout"))), true];
  }

  return [[], false];
}


export async function setLocalStorage(projectList:Project[], ide: string, mtime: number) {
  await setLocalStorageItem(ide.concat("-stdout"), JSON.stringify(projectList));
  await setLocalStorageItem(ide.concat("-lastTime"), mtime);
}


export async function removeLocalStorage(ide: string) {
  await removeLocalStorageItem(ide.concat("-lastTime"));
  await removeLocalStorageItem(ide.concat("-stdout"));
}


export function getProjectUrl(path: string): string {
  const gitConfig = parse.sync({ cwd: path, path: ".git/config", expandKeys: true });
  if (gitConfig.remote && gitConfig.remote.origin) {
    return gitConfig.remote.origin.url.replace(':', '/').replace('git@', 'https://').replace('.git', '');
  } else {
    return "";
  }
}
