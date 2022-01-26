import { getLocalStorageItem, randomId, setLocalStorageItem, clearLocalStorage } from "@raycast/api";
import { execSync } from "child_process";
import { home, Project, checkPath } from "./util";
import { basename } from "path";
// eslint-disable-next-line @typescript-eslint/no-var-requires
const { isEmpty, isNil } = require('licia');


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


function readXcodeHistory() : string[] {
  // 判断 com.apple.dt.xcode.sfl2 文件是否存在
  const configPath = home.concat("/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/com.apple.dt.xcode.sfl2")
  const result = execSync(generateScript(configPath), {encoding: 'utf-8'})
  if (!isNil(result) && !isEmpty(result)) {
    return result.split(', ').map(p => p.trim())
  }

  return [];
}


export async function getXcodeParsers() {
  // 清空缓存, 测试用
  // await clearLocalStorage();

  // 判断 com.apple.dt.xcode.sfl2 文件是否存在
  const configPath = home.concat("/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/com.apple.dt.xcode.sfl2")
  const [isExist, atime, mtime] = checkPath(configPath);
  if (!isExist) {
    return []
  }

  const lastTime: string | undefined = await getLocalStorageItem("lastTime");
  console.log(lastTime, "lastTime", mtime)
  // 不常使用，使用数据库记录(缓存)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  if (mtime.toString() === lastTime) {
    const a = await getLocalStorageItem("stdout")
    console.log(a, "a")
    console.log(typeof a, "typeof a")
    return JSON.parse(<string>await getLocalStorageItem("stdout"))
  } else {
    await setLocalStorageItem("lastTime", mtime.toString());
  }
  const data = readXcodeHistory()
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
  await setLocalStorageItem("stdout", JSON.stringify(projectList));
  return projectList;
}
