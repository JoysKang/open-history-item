import { exec } from "child_process";
import { ActionPanel, List, showToast, ToastStyle } from "@raycast/api";
import React from "react";


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

  return (
    <List isLoading={projects.length === 0} searchBarPlaceholder="Filter articles by name...">
      {projects.map((project) => (
        <ProjectListItem key={project.key} project={project} />
      ))}
    </List>
  );
}


function ProjectListItem(props: { project: Project }) {
  const project = props.project;
  const title = "Open Project in " + project.ide;

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
                              exec(`/Applications/PyCharm.app/Contents/MacOS/pycharm "${project.path}"`, (err) => err && showToast(ToastStyle.Failure, err?.message));
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

