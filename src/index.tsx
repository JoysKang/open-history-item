import { exec } from "child_process";
import {
  getApplications,
  ActionPanel,
  List,
  showToast,
  closeMainWindow,
  ShowInFinderAction,
  CopyToClipboardAction,
  OpenInBrowserAction,
  ToastStyle,
  Application,
  // environment,
} from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { getJetBrainsProjects } from "./ides/jetbrains";
import { getAndroidStudioProjects } from "./ides/androidStudio";
import { getVSCodeProjects } from "./ides/vscode";
import { getXcodeParsers } from "./ides/xcode";
import { sublimeParsers } from "./ides/sublimeText";
import { Project, ExecutableFileStart } from "./util";
import { getConfigsFromLocalStorage } from "./config";

export default function Command() {
  // if (environment.isDevelopment) {
  //   console.time();
  // }
  const [state, setState] = useState<{
    apps: Application[];
    jetbrains: Project[];
    androidStudio: Project[];
    vscode: Project[];
    xcode: Project[];
    sublimeText: Project[];
  }>({
    apps: [],
    jetbrains: [],
    androidStudio: [],
    vscode: [],
    xcode: [],
    sublimeText: [],
  });
  useEffect(() => {
    async function getApps() {
      let jetbrains: Project[] = [];
      let androidStudio: Project[] = [];
      let vscode: Project[] = [];
      let xcode: Project[] = [];
      let sublimeText: Project[] = [];
      const apps = await getApplications();
      const configs = await getConfigsFromLocalStorage();
      try {
        jetbrains = await getJetBrainsProjects(apps, configs);
      } catch (e) {
        console.error(e);
      }
      try {
        androidStudio = await getAndroidStudioProjects(apps, configs);
      } catch (e) {
        console.error(e);
      }
      try {
        vscode = await getVSCodeProjects(configs);
      } catch (e) {
        console.error(e);
      }
      try {
        xcode = await getXcodeParsers(configs);
      } catch (e) {
        console.error(e);
      }
      try {
        sublimeText = await sublimeParsers(configs);
      } catch (e) {
        console.error(e);
      }
      setState((oldState) => ({
        ...oldState,
        apps: apps,
        jetbrains: jetbrains,
        androidStudio: androidStudio,
        vscode: vscode,
        xcode: xcode,
        sublimeText: sublimeText,
      }));
    }

    getApps().then(() => {
      // if (environment.isDevelopment) {
      //   console.timeEnd();
      // }
    });
  }, []);

  let projects = state.jetbrains
    .concat(state.androidStudio)
    .concat(state.vscode)
    .concat(state.xcode)
    .concat(state.sublimeText);
  // 排序
  projects = projects.sort((item1, item2) => item2.atime - item1.atime);

  return (
    <List isLoading={projects.length === 0} searchBarPlaceholder="Search your project by name...">
      {projects.map((project) => (
        <ProjectListItem key={project.key} project={project} apps={state.apps} />
      ))}
    </List>
  );
}

function ProjectListItem(props: { project: Project; apps: Application[] }) {
  const project = props.project;
  const title = "Open Project in " + project.ide;
  let cmd = "";

  if (project.category === "JetBrains") {
    if (ExecutableFileStart.indexOf(project.ide) !== -1) {  // ExecutableFileStart 是不支持和 url scheme 的 ide
      cmd = `${project.executableFile} "${project.path}"`;
    } else {
      cmd = `open -u "${project.ide}://open?file=${project.path}"`;
    }
  } else if (project.category === "vscode") {
    cmd = `open -u "vscode://file/${project.path}"`;
  } else if (project.category === "Xcode") {
    cmd = `open "${project.path}"`;
  } else if (project.category === "sublimeText") {
    cmd = `open -a "sublime text" "${project.path}"`;
    // console.log(cmd);
  }

  return (
    <List.Item
      key={project.key}
      title={project.name}
      subtitle={project.path}
      icon={project.icon}
      actions={
        <ActionPanel>
          <ActionPanel.Item
            title={title}
            icon={project.icon}
            onAction={() => {
              exec(cmd, (err) => {
                if (err) {
                  // 如果执行失败，则提示
                  showToast(ToastStyle.Failure, err?.message);
                } else {
                  closeMainWindow(); // 关闭主窗口
                }
              });
            }}
          />
          <ShowInFinderAction
            title={"Open in Finder"}
            key="finder"
            onShow={() => project.name}
            path={project.path}
            shortcut={{ modifiers: ["cmd"], key: "f" }}
          />
          <CopyToClipboardAction
            title={"Copy Path to Clipboard"}
            key="clipboard"
            onCopy={() => project.path}
            content={project.path}
            shortcut={{ modifiers: ["cmd"], key: "p" }}
          />
          {getOpenInBrowserAction(project)}
        </ActionPanel>
      }
    />
  );
}

function getOpenInBrowserAction(project: Project) {
  if (!project.gitUrl) {
    return null;
  }
  return (
    <OpenInBrowserAction
      title={"Open on Browser"}
      key={project.key}
      url={project.gitUrl}
      onOpen={() => project.name}
      shortcut={{ modifiers: ["cmd"], key: "b" }}
    />
  );
}
