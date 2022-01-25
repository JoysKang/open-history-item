import { exec } from "child_process";
import { getApplications, ActionPanel, List, showToast, closeMainWindow, ToastStyle, Application } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";
import { getJetBrainsProjects, getJetBrainsExecFile } from "./jetbrains";
import { Project } from "./util";


export default function Command() {
  console.time()
  let projects: Project[] = getJetBrainsProjects()
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
    const execFile = getJetBrainsExecFile(project.ide, props.apps);
    if (!execFile) {
      cmd = "";
    } else {
      cmd = `${execFile} "${project.path}"`;
    }
  } else if (project.category === "vscode") {
    cmd = `open -u "vscode://open?file=${project.path}"`;
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
