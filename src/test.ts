var plist = require('@atom/plist');
var os = require('os')
var userInfo = os.userInfo()
const objc = require('objc');

const {
  NSData,
  NSURL,
  NSArray,
  NSString,
  NSError,
  NSDictionary,
  NSKeyedUnarchiver
} = objc;

var tempPath = "/Library/Application Support/com.apple.sharedfilelist/com.apple.LSSharedFileList.ApplicationRecentDocuments/com.apple.dt.xcode.sfl2"
// tempPath 是要相对于用户目录的。所以要获取用户目录进行拼接。/Users/username/tempPath
var path = NSString.stringWithString(userInfo['homedir'] + tempPath);

console.log(path)
var url = NSURL.fileURLWithPath(path)
console.log(url)
var data = NSData.dataWithContentsOfURL(url)
if (!data) {
  return;
}

var recentListInfo = NSKeyedUnarchiver.unarchiveObjectWithData(data)
var recentList = recentListInfo.objectForKey("items")


for (var i = recentList.count() - 1; i >= 0; i--) {
  var firstObj = recentList.objectAtIndex(i)
  var bookmarkData = firstObj.objectForKey("Bookmark")
  // 由于bookmarkData是系统用Objective-C的方式写入的。也只能用Objective-C的方式读取。如下：
  var recentItemurl = NSURL.URLByResolvingBookmarkData_options_relativeToURL_bookmarkDataIsStale_error(bookmarkData, 1 << 8, null, null, null)
  console.log(String(recentItemurl), typeof(String(recentItemurl)))
}