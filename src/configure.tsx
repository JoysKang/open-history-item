import {
  ActionPanel,
  Form,
  Icon,
  Color,
  SubmitFormAction,
  getLocalStorageItem,
  setLocalStorageItem,
  closeMainWindow,
  showHUD
} from "@raycast/api";
import React, { useEffect, useState } from "react";
import { Configs } from "./util";


export default function Command() {
  const [isLoading, setIsLoading] = useState(true);
  const [state, setState] = useState<{ configs: Configs}>({ configs: {} as Configs });

  useEffect(() => {
    async function getConfigs() {
      const configs = await getConfigsFromLocalStorage();
      setState((oldState) => ({
        ...oldState,
        configs: configs
      }));
    }
    getConfigs();
    setTimeout(() => setIsLoading(false), 100);
  }, []);

  if (isLoading) {
    return <Form isLoading={isLoading}>{}</Form>;
  }

  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction title="Save configuration" onSubmit={setConfigsToLocalStorage} />
        </ActionPanel>
      }
    >
      <Form.TagPicker id="JetBrains" title="JetBrains" defaultValue={ state.configs["JetBrains"] }>
        <Form.TagPicker.Item value="PyCharm" title="PyCharm" icon="small_size/PyCharm.png"/>
        <Form.TagPicker.Item value="WebStorm" title="WebStorm" icon="small_size/WebStorm.png"/>
        <Form.TagPicker.Item value="GoLand" title="GoLand" icon="small_size/GoLand.png"/>
        <Form.TagPicker.Item value="RubyMine" title="RubyMine" icon="small_size/RubyMine.png"/>
        <Form.TagPicker.Item value="Rider" title="Rider" icon="small_size/Rider.png"/>
        <Form.TagPicker.Item value="PhpStorm" title="PhpStorm" icon="small_size/PhpStorm.png"/>
        <Form.TagPicker.Item value="IntelliJ IDEA" title="IntelliJ IDEA" icon="small_size/IntelliJ IDEA.png"/>
        <Form.TagPicker.Item value="DataGrip" title="DataGrip" icon="small_size/DataGrip.png"/>
        <Form.TagPicker.Item value="CLion" title="CLion" icon="small_size/CLion.png"/>
        <Form.TagPicker.Item value="AppCode" title="AppCode" icon="small_size/AppCode.png"/>
      </Form.TagPicker>

      <Form.Dropdown id="Visual Studio Code" title="Visual Studio Code" defaultValue={ state.configs["Visual Studio Code"] }>
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

      <Form.Dropdown id="Xcode" title="Xcode" defaultValue={ state.configs["Xcode"] }>
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

      <Form.Dropdown id="Android Studio" title="Android Studio" defaultValue={ state.configs["Android Studio"] }>
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

      <Form.Dropdown id="Sublime Text" title="Sublime Text" defaultValue={ state.configs["Sublime Text"] }>
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

    </Form>
  );
}


// 从 LocalStorage 读取用户配置
export async function getConfigsFromLocalStorage(): Promise<Configs> {
  const configs = await getLocalStorageItem("configs");
  if (configs) {
    return JSON.parse(configs as string);
  } else {
    return {  // 默认启动
      "FromLocalStorage": false,
      "JetBrains": [ "PyCharm", "WebStorm", "GoLand", "RubyMine", "Rider", "PhpStorm", "IntelliJ IDEA", "DataGrip", "CLion", "AppCode" ],
      "Android Studio": "enable",
      "Visual Studio Code": "enable",
      "Xcode": "enable",
      "Sublime Text": "enable"
    }
  }
}


// 保存用户配置到 LocalStorage
async function setConfigsToLocalStorage(configs: Configs) {
  configs.FromLocalStorage = true;
  await setLocalStorageItem("configs", JSON.stringify(configs));
  await showHUD("Saved");
  await closeMainWindow();  // 关闭主窗口
}
