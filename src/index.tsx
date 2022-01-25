import { exec } from "child_process";
import { getApplications, ActionPanel, List, showToast, closeMainWindow, ToastStyle, Application } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { getJetBrainsProjects } from "./jetbrains";
import { getVSCodeProjects } from "./vscode";
import { Project } from "./util";


export default function Command() {
  console.time()
  const [state, setState] = useState<{
    apps: Application[],
    jetbrains: Project[],
    vscode: Project[] }>({
    apps: [],
    jetbrains: [],
    vscode: []
  });
  useEffect(() => {
    async function getApps() {
      const apps = await getApplications();
      const jetbrains = await getJetBrainsProjects(apps);
      const vscode = await getVSCodeProjects();
      setState((oldState) => ({
        ...oldState,
        apps: apps,
        jetbrains: jetbrains,
        vscode: vscode
      }));
    }
    getApps();
  }, []);

  let projects = state.jetbrains.concat(state.vscode);
  // 排序
  projects = projects
    .sort((item1, item2) => item2.atime - item1.atime)
  console.timeEnd()

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
    cmd = `${project.executableFile} "${project.path}"`;
  } else if (project.category === "vscode") {
    cmd = `open -u "vscode://open?file=${project.path}"`;
  }
  // console.log(cmd);

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
