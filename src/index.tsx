import { exec } from "child_process";
import { getApplications, ActionPanel, List, showToast, ToastStyle, Application } from "@raycast/api";
import React from "react";
import { useEffect, useState } from "react";


export default function Command() {
  const projects = [
    {
      key: "1",
      ide: "PyCharm",
      icon: "icons/PyCharm.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api"
    },
    {
      key: "2",
      ide: "Visual Studio Code",
      icon: "icons/Visual Studio Code.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api"
    },
    {
      key: "3",
      ide: "JetBrains Toolbox",
      icon: "icons/Visual Studio Code.png",
      name: "depushu-api",
      path: "/Users/joys/work/depushu-api"
    }
  ];

  const [state, setState] = useState<{ apps: Application[] }>({ apps: [] });

  useEffect(() => {
    async function getApps() {
      const apps = await getApplications();
      setState((oldState) => ({
        ...oldState,
        apps: apps,
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
  )
}


function ProjectListItem(props: { project: Project, apps: Application[] }) {
  const project = props.project;
  const title = "Open Project in " + project.ide;
  const execFile = props.apps.find((app) => app.name === project.ide);
  const cmd = execFile ? `${execFile.path}/Contents/MacOS/${project.ide.toLowerCase()} "${project.path}"` : "";

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
                              exec(cmd, (err) => err && showToast(ToastStyle.Failure, err?.message));
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
};

