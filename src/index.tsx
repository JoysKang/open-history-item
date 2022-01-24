import { exec } from "child_process";
import { getApplications, ActionPanel, List, showToast, closeMainWindow, ToastStyle, Application } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { getBrandJetBrainsProjects } from "./jetbrains";
import { Project } from "./util";


export default function Command() {
  console.time()
  let projects: Project[] = getBrandJetBrainsProjects()
  // 排序
  projects = projects
    .sort((item1, item2) => item2.atime - item1.atime)
  console.timeEnd()

  const [state, setState] = useState<{ apps: Application[] }>({ apps: [] });

  useEffect(() => {
    async function getApps() {
      const apps = await getApplications();
      setState((oldState) => ({
        ...oldState,
        apps: apps
      }));
    }

    getApps();
  }, []);

  return (
    <List isLoading={projects.length === 0} searchBarPlaceholder="Filter articles by name...">
      {projects.map((project) => (
        <ProjectListItem key={project.key} project={project} apps={state.apps} />
      ))}
    </List>
  );
}


function ProjectListItem(props: { project: Project, apps: Application[] }) {
  const project = props.project;
  const title = "Open Project in " + project.ide;
  let cmd = "";

  if (project.category === "JetBrains") {
    const execFile = props.apps.find((app) => app.name === project.ide);
    if (!execFile) {
      cmd = "";
    } else {
      const path = execFile.path.replace(/\s+/g, "\\ ");
      if (execFile.path.toLowerCase().indexOf("toolbox") !== -1) {
        cmd = `${path}/Contents/MacOS/jetbrains-toolbox-launcher "${project.path}"`;
      } else {
        cmd = `${execFile.path}/Contents/MacOS/${project.ide.toLowerCase()} "${project.path}"`;
      }
    }
  } else if (project.category === "vscode") {
    cmd = `open -u "vscode://open?file=${project.path}"`;
  // } else if (project.category === "JetBrains") {
  //   cmd = `open -u "${project.ide}://open?file=${project.path}"`;
  }

  return (
    <List.Item
      key={project.key}
      title={project.name}
      subtitle={project.path}
      icon={project.icon}
      actions={
        <ActionPanel>
          <ActionPanel.Item title={title}
                            icon={project.icon}
                            onAction={() => {
                              exec(cmd, (err) => {
                                if (err) {  // 如果执行失败，则提示
                                  showToast(ToastStyle.Failure, err?.message);
                                } else {
                                  closeMainWindow();  // 关闭主窗口
                                }
                              });
                            }}
          />
        </ActionPanel>
      }
    />
  );
}
