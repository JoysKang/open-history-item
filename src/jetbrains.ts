import { randomId, Application } from "@raycast/api";
import { readFileSync } from "fs";
import { basename } from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { parseString } from "xml2js";
import { checkPath, searchFiles, home, Project } from "./util";
import { Buffer } from "buffer";


async function jetBrainsParsers(data: Buffer, fileName: string, apps: Application[]): Promise<Project[]> {
  const projectList: Project[] = [];
  const ideName: RegExpMatchArray | null = fileName.split("JetBrains/")[1].match(/^[A-Za-z]+/);
  const ide = ideName ? ideName[0] : "";
  const icon: string = ideName ? "icons/".concat(ide).concat(".png") : "";
  const executableFile = await getJetBrainsExecutableFileFile(ide, apps);

  parseString(data, function(err: any, result: { application: { component: any[]; }; }) {
    const component = result.application.component[0];
    const option =
      component.option[
        component.option.findIndex((item: { $: { name: string; }; }) => item.$.name == "additionalInfo") // 获取 name="additionalInfo" 的 option 元素
        ];

    for (let i = 0; i < option.map[0].entry.length; i++) {
      const item = option.map[0].entry[i];
      const projectPath = item.$.key.replace("$USER_HOME$", home);   // "$USER_HOME$" 得替换成用户的家目录
      const isExist = checkPath(projectPath)[0];
      if (!isExist) {
        continue;
      }
      const options = item.value[0].RecentProjectMetaInfo[0].option;
      const atime: number = options[options.findIndex((item: { $: { name: string; }; }) => item.$.name == "projectOpenTimestamp")].$.value;
      projectList.push({
        key: randomId(),
        ide: ide,
        icon: icon,
        name: basename(projectPath),
        path: projectPath,
        executableFile: executableFile,
        category: "JetBrains",
        atime: atime
      });
    }
  });
  return projectList;
}


// 获取 JetBrains 的项目列表
export async function getJetBrainsProjects(apps: Application[]): Promise<Project[]> {
  const fileList = searchFiles("/Library/Application Support/JetBrains/");
  const projectList: Project[] = [];
  for (const file of fileList) {
    const isExist = checkPath(file)[0];
    if (!isExist) {
      continue;
    }

    const data = readFileSync(file);
    if (!data.length) {
      continue;
    }

    const projects: Project[] = await jetBrainsParsers(data, file, apps);
    if (projects.length) {
      projectList.push(...projects);
    }
  }
  return projectList;
}


export async function getJetBrainsExecutableFileFile(ide: string, apps: Application[]): Promise<string> {
  const bin = "/usr/local/bin/" + ide.toLowerCase();  // 优先使用生成的可执行文件
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
