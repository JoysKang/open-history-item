import { randomId } from "@raycast/api";
import { readFileSync, lstatSync, readdirSync } from "fs";
import { basename } from "path";
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import xml2js from "xml2js";
import { checkPath, searchFiles, home, Project } from "./util";
import * as buffer from "buffer";

const parser = new xml2js.Parser();


// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
function jetBrainsParsers(data: buffer, fileName: string): Project[] {
  const projectList: Project[] = [];
  const ideName: RegExpMatchArray | null = fileName.split("JetBrains/")[1].match(/^[A-Za-z]+/)
  const ide = ideName ? ideName[0] : ""
  const icon: string = ideName ? "icons/".concat(ide).concat(".png") : "";

  parser.parseString(data, function (err: any, result: { application: { component: any[]; }; }) {
    const component = result.application.component[0];
    const option =
      component.option[
        component.option.findIndex((item: { $: { name: string; }; }) => item.$.name == "additionalInfo") // 获取 name="additionalInfo" 的 option 元素
        ];

    for (let i = 0; i < option.map[0].entry.length; i++) {
      const item = option.map[0].entry[i]
      const projectPath = item.$.key.replace("$USER_HOME$", home)   // "$USER_HOME$" 得替换成用户的家目录
      const [isExist, _] = checkPath(projectPath)
      if (!isExist) {
        continue
      }
      const options = item.value[0].RecentProjectMetaInfo[0].option;
      const atime: number = options[options.findIndex((item: { $: { name: string; }; }) => item.$.name == "projectOpenTimestamp")].$.value;
      projectList.push({
        key: randomId(),
        ide: ide,
        icon: icon,
        name: basename(projectPath),
        path: projectPath,
        category: "JetBrains",
        atime: atime
      });
    }
  });
  return projectList;
}


// 获取 JetBrains 的项目列表
export function getBrandJetBrainsProjects(): Project[] {
  const fileList = searchFiles("/Library/Application Support/JetBrains/");
  const projectList: Project[] = [];
  for (const file of fileList) {
    const [isExist, _] = checkPath(file);
    if (!isExist) {
      continue;
    }

    const data = readFileSync(file)
    if (!data.length) {
      continue;
    }

    const projects: Project[] = jetBrainsParsers(data, file)
    if (projects.length) {
      projectList.push(...projects)
    }
  }
  return projectList;
}