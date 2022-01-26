import {
  ActionPanel,
  Form,
  Icon,
  Color,
  SubmitFormAction,
  getLocalStorageItem
} from "@raycast/api";
import React from "react";


export default function Command() {
  return (
    <Form
      actions={
        <ActionPanel>
          <SubmitFormAction title="Submit Favorite" onSubmit={(values) => console.log(values)} />
        </ActionPanel>
      }
    >

      <Form.TagPicker id="JetBrains" title="JetBrains" defaultValue={[]}>
        <Form.TagPicker.Item value="PyCharm" title="PyCharm" icon="icons/PyCharm.png"/>
        <Form.TagPicker.Item value="WebStorm" title="WebStorm" icon="icons/WebStorm.png"/>
        <Form.TagPicker.Item value="GoLand" title="GoLand" icon="icons/GoLand.png"/>
        <Form.TagPicker.Item value="RubyMine" title="RubyMine" icon="icons/RubyMine.png"/>
        <Form.TagPicker.Item value="Rider" title="Rider" icon="icons/Rider.png"/>
        <Form.TagPicker.Item value="PhpStorm" title="PhpStorm" icon="icons/PhpStorm.png"/>
        <Form.TagPicker.Item value="IntelliJ IDEA" title="IntelliJ IDEA" icon="icons/IntelliJ IDEA.png"/>
        <Form.TagPicker.Item value="DataGrip" title="DataGrip" icon="icons/DataGrip.png"/>
        <Form.TagPicker.Item value="CLion" title="CLion" icon="icons/CLion.png"/>
        <Form.TagPicker.Item value="AppCode" title="AppCode" icon="icons/AppCode.png"/>
      </Form.TagPicker>

      <Form.Dropdown id="Visual Studio Code" title="Visual Studio Code">
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

      <Form.Dropdown id="Xcode" title="Xcode">
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

      <Form.Dropdown id="Sublime Text" title="Sublime Text">
        <Form.Dropdown.Item value="enable" title="enable" icon={{ source: Icon.Circle, tintColor: Color.Green }} />
        <Form.Dropdown.Item value="disabled" title="disabled" icon={{ source: Icon.Circle, tintColor: Color.Red }} />
      </Form.Dropdown>

    </Form>
  );
}


// 从 LocalStorage 读取用户配置
async function getConfigFromLocalStorage(): Promise<any> {
  return JSON.parse(await getLocalStorageItem("config") as string);
}
