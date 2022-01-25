import { randomId } from "@raycast/api";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isEmpty, isNil } = require('licia');
import { execSync } from "child_process";
import { checkPath, home, Project } from "./util";
import { basename } from "path";


function generateScript(configPath: string): string {
  return `osascript -e "use framework \\"Foundation\\"
        use scripting additions
        property |⌘| : a reference to current application
        set documentPaths to {}
        try
          set recentDocumentsPath to \\"${configPath}\\"
          set plistData to |⌘|'s NSData's dataWithContentsOfFile:recentDocumentsPath
          set recentDocuments to |⌘|'s NSKeyedUnarchiver's unarchiveObjectWithData:plistData
          repeat with doc in (recentDocuments's objectForKey:\\"items\\")
            set documentBookmark to (doc's objectForKey:\\"Bookmark\\")
            set {documentURL, resolveError} to (|⌘|'s NSURL's URLByResolvingBookmarkData:documentBookmark options:0 relativeToURL:(missing value) bookmarkDataIsStale:(missing value) |error|:(reference))
            if resolveError is missing value then
              set end of documentPaths to documentURL's |path|() as string
            end if
          end repeat
          documentPaths as list
        on error
          {}
        end try"
        `
}


function readXcodeHistory() : [string[], number] {
  // 判断 com.apple.dt.xcode.sfl2 文件是否存在
  const configPath = home.concat("/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/com.apple.dt.xcode.sfl2")
  const [isExist, atime] = checkPath(configPath);
  if (!isExist) {
    return [[], 0];
  }

  const result = execSync(generateScript(configPath), {encoding: 'utf-8'})
  if (!isNil(result) && !isEmpty(result)) {
    const paths = result.split(',').filter(p => p.trim().endsWith('.xcodeproj'));
    return [paths, atime]
  }

  return [[], 0];
}


export async function getXcodeParsers() {
  console.time('start')
  const [data, atime] = readXcodeHistory()
  console.timeEnd('start')
  if (!data.length) {
    return [];
  }

  const projectList: Project[] = [];
  for (let i = 0; i < data.length; i++) {
    const projectPath = data[i]
    projectList.push({
      key: randomId(),
      ide: "Xcode",
      icon: "icons/Xcode.png",
      name: basename(projectPath),
      path: projectPath,
      executableFile: "",
      category: "Xcode",
      atime: atime
    });
  }
  return projectList;
}
