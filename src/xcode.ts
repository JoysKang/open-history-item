import { getLocalStorageItem, randomId, setLocalStorageItem, clearLocalStorage } from "@raycast/api";
import { execSync } from "child_process";
import { home, Project, checkPath, getLocalStorage } from "./util";
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
  const file = home.concat("/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/com.apple.dt.xcode.sfl2")
  // 读取 atime, mtime
  const [isExist, atime, mtime] = checkPath(file);
  if (!isExist) {
    return []
  }

  const [LocalStorageData, isGet] = await getLocalStorage(file, "xcode", mtime);
  if (isGet) {
    return LocalStorageData
  }

  const data = readXcodeHistory();
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
  await setLocalStorageItem("xcode-stdout", JSON.stringify(projectList));
  await setLocalStorageItem("xcode-lastTime", mtime);
  return projectList;
}
