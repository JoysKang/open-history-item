import { Application, randomId, setLocalStorageItem } from "@raycast/api";
import { readFileSync } from "fs";
import { basename } from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parseString } from "xml2js";
import {
  checkPath,
  Configs,
  getLocalStorage,
  getProjectUrl,
  home,
  Project,
  removeLocalStorage,
  searchFiles,
} from "../util";
import { Buffer } from "buffer";

async function getIdeName(file: string): Promise<string> {
  let make = "";
  if (file.indexOf("JetBrains") !== -1) {
    make = "JetBrains/";
  } else if (file.indexOf("Google") !== -1) {
    make = "Google/";
  }

  const ideName: RegExpMatchArray | null = file.split(make)[1].match(/^[A-Za-z]+/);
  return ideName ? ideName[0] : "";
}

export async function jetBrainsParsers(
  data: Buffer,
  file: string,
  mtime: number,
  apps: Application[]
): Promise<Project[]> {
  const ide = await getIdeName(file);
  // 读取缓存
  const [LocalStorageData, isGet] = await getLocalStorage(file, ide, mtime);
  if (isGet) {
    return LocalStorageData;
  }

  const projectList: Project[] = [];
  const icon: string = ide ? "icons/".concat(ide).concat(".png") : "";
  const executableFile = await getJetBrainsExecutableFileFile(ide, apps);

  parseString(data, function (err: any, result: { application: { component: any[] } }) {
    const component = result.application.component[0];
    const option =
      component.option[
        component.option.findIndex((item: { $: { name: string } }) => item.$.name == "additionalInfo") // 获取 name="additionalInfo" 的 option 元素
      ];

    for (let i = 0; i < option.map[0].entry.length; i++) {
      const item = option.map[0].entry[i];
      const projectPath = item.$.key.replace("$USER_HOME$", home); // "$USER_HOME$" 得替换成用户的家目录
      const isExist = checkPath(projectPath)[0];
      if (!isExist) {
        continue;
      }
      const options = item.value[0].RecentProjectMetaInfo[0].option;
      const atime: number =
        options[options.findIndex((item: { $: { name: string } }) => item.$.name == "projectOpenTimestamp")].$.value;
      projectList.push({
        key: randomId(),
        ide: ide,
        icon: icon,
        name: basename(projectPath),
        path: projectPath,
        executableFile: executableFile,
        category: "JetBrains",
        gitUrl: getProjectUrl(projectPath),
        atime: atime,
      });
    }
  });
  await setLocalStorageItem(ide.concat("-stdout"), JSON.stringify(projectList));
  await setLocalStorageItem(ide.concat("-lastTime"), mtime);
  return projectList;
}

async function getFileContent(apps: Application[], configs: Configs, file: string): Promise<Project[]> {
  const ide = await getIdeName(file);
  if (configs["JetBrains"].indexOf(ide) === -1) {
    // 未启用该 IDE
    return [];
  }
  const [isExist, , mtime] = checkPath(file);
  if (!isExist) {
    await removeLocalStorage(ide);
    return [];
  }

  const data = readFileSync(file);
  if (!data.length) {
    return [];
  }

  return await jetBrainsParsers(data, file, mtime, apps);
}

// 获取 JetBrains 的项目列表
export async function getJetBrainsProjects(apps: Application[], configs: Configs): Promise<Project[]> {
  const fileList = searchFiles("/Library/Application Support/JetBrains/");
  const projectList: Project[] = [];
  for (const file of fileList) {
    const projects = await getFileContent(apps, configs, file);
    if (projects.length) {
      projectList.push(...projects);
    }
  }
  return projectList;
}

export async function getJetBrainsExecutableFileFile(ide: string, apps: Application[]): Promise<string> {
  const bin = "/usr/local/bin/" + ide.toLowerCase(); // 优先使用生成的可执行文件
  const isExist = checkPath(bin)[0];
  if (isExist) {
    return bin;
  }

  let execFile: Application | undefined = { name: "", path: "", bundleId: "" };
  if (ide === "PyCharm") {
    execFile = apps.find((app) => app.name.indexOf(ide) !== -1);
  } else {
    execFile = apps.find((app) => app.name === ide);
  }
  return execFile ? execFile.path : "";
}
