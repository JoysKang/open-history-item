import { exec } from "child_process";
import { getApplications, ActionPanel, List, showToast, closeMainWindow, ToastStyle, Application } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";


export default function Command() {
  const projects = [
    {
      key: "1",
      ide: "PyCharm",
      icon: "icons/PyCharm.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api",
      category: "JetBrains"
    },
    {
      key: "2",
      ide: "PyCharm",
      icon: "icons/PyCharm.png",
      name: "depushu_sim_api",
      path: "/Users/joys/work/depushu_sim_api",
      category: "JetBrains"
    },
    {
      key: "3",
      ide: "Visual Studio Code",
      icon: "icons/Visual Studio Code.png",
      name: "workspace.code-workspace",
      path: "/Users/joys/work/workspace.code-workspace",
      category: "vscode"
    },
    {
      key: "4",
      ide: "Rider",
      icon: "icons/Rider.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api",
      category: "JetBrains"
    }
  ];

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

// 解释下为什么只有 Rider 使用可执行文件启动
// Rider 无法通过 URL Scheme 启动，原因未知

// 解释下为什么已经可以使用可执行文件启动，为什么还要用 URL Scheme 方式启动。
// 因为使用可执行文件启动时，IDE 在前台时，使用可执行文件无法切换同 IDE 的项目。
function ProjectListItem(props: { project: Project, apps: Application[] }) {
  const project = props.project;
  const title = "Open Project in " + project.ide;
  let cmd = "";
  if (project.ide === "Rider") {  // Rider 无法通过 URL Scheme 启动，原因未知
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
  } else if (project.category === "JetBrains") {
    cmd = `open -u "${project.ide}://open?file=${project.path}"`;
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


type Project = {
  key: string;
  ide: string;
  icon: string;
  name: string;
  path: string;
  category: string;
};

