import { lstatSync, readdirSync } from "fs";
import { homedir } from "os"


// home directory
export const home = homedir();


export type Project = {
  key: string;
  ide: string;
  icon: string;
  name: string;
  path: string;
  category: string;
  atime: number;
};


// 判断路径是否存在
export function checkPath(path: string): [boolean, number] {
  try {
    const file = lstatSync(path);
    return [true, file.atimeMs]
  } catch (err) {
    return [false, 0]
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
      if (absolutePath.indexOf("JetBrains") !== -1 &&
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


// 查找项目历史文件
export function searchFiles(element: string): string[] {
  // xcode
  if (element.indexOf("xcode") !== -1) {
    return [element]
  }

  // JetBrains 中 Rider 使用的是 recentSolutions.xml 其他 IDE 使用的是 recentProjects.xml
  // 判断是文件还是文件夹
  if (element[element.length - 1] !== "/") {    // 文件
    return [home.concat(element)]
  }

  if (element.indexOf("Google") !== -1) {
    const files = readFileList(home.concat(element), [])
    return files.map(file => file.absolutePath)
  }

  // JetBrains && AndroidStudio 文件夹
  if (element.indexOf("JetBrains") !== -1) {
    const files = [];
    const ides = new Set()
    const allRecentProjects = readFileList(home.concat(element), [])

    // 先排序，后遍历，排除重复
    allRecentProjects.sort(function(a, b){return b.atimeMs - a.atimeMs});
    for (let i = 0; i < allRecentProjects.length; i++) {
      const absolutePath = allRecentProjects[i].absolutePath;
      const ideStr = absolutePath.split("JetBrains/")[1].substring(0, 4)

      if (!ides.has(ideStr)) {
        files.push(absolutePath)
        ides.add(ideStr)
      }
    }

    return files;
  }

  return []
}