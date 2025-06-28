# jupyter-agent-extension

[EN](#en)

配合jupyter-agent工具使用的Vscode扩展插件，提高用户的使用体验。jupyter-agent是一个jupyter的扩展组件，提供`%%bot`命令，实现在Notebook中自动生成代码以完成指定的任务，具体见[jupyer-agent项目主页](https://github.com/viewstar000/jupyter-agent)。

## 使用方法

### 安装jupyter-agent

```bash
# 激活当前Notebook所使用的虚拟环境
source .venv/bin/activate

# 安装jupyter-agent
pip install jupyter-agent
```

### 安装jupyter-agent-extension

插件下载地址：[jupyter-agent-extension](https://marketplace.visualstudio.com/items?itemName=viewstar000.jupyter-agent-extension)

### 使用jupyter-agent

#### 配置Notebook

在Vscode中新建或打开一个Notebook，新建一个单元格，输入并执行以下命令:

```python
# 加载扩展的Magic命令
%load_ext jupyter_agent.bot_magics

# 设置模型调用的API地址，不同的Agent可以调用不同的模型，这里以调用lmstudio本地部署的模型为例
%config BotMagics.default_api_url = 'http://127.0.0.1:1234/v1'
%config BotMagics.default_api_key = 'API_KEY'
%config BotMagics.default_model_name = 'qwen3-30b-a3b' 
%config BotMagics.coding_model_name = 'devstral-small-2505-mlx'

# 设置是否支持保存任务数据到Metadata中，权在Vscode安装jupyter-agent-extension后支持
%config BotMagics.support_save_meta = True
# 设置运行环境是否设置单元格内容，权在Vscode中安装jupyter-agent-extension后支持
%config BotMagics.support_set_cell_content = True
```

接下来就可以使用`%%bot`指令进行任务规则与代码生成的工作了。

#### 进行全局任务规划

```python
%%bot -P

# 全局目标（Global goal）
...
```

#### 执行任务规则并生成子任务代码

```python
%%bot [-s stage]

# Some random characters ...
```

具体用法见[使用说明](https://github.com/viewstar000/jupyter-agent/blob/main/README.md)

## 贡献

欢迎提交 issue 或 pull request 参与贡献。

## 许可证

本项目基于 [MIT License](https://github.com/viewstar000/jupyter-agent-extension/blob/main/LICENSE) 开源。

Copyright (c) 2025 viewstar000

---

## EN

VSCode extension plugin for use with the jupyter-agent tool, enhancing the user experience. jupyter-agent is an extension component for Jupyter that provides the `%%bot` command, enabling automatic code generation in Notebooks to accomplish specified tasks. For more details, see the [jupyter-agent project homepage](https://github.com/viewstar000/jupyter-agent).

## Usage

### Install jupyter-agent

```bash
# Activate the virtual environment used by the current notebook
source .venv/bin/activate

# Install jupyter-agent
pip install jupyter-agent
```

### Install jupyter-agent-extension

Plugin download address: [jupyter-agent-extension](https://marketplace.visualstudio.com/items?itemName=viewstar000.jupyter-agent-extension)

### Use jupyter-agent

#### Configure Notebook

Create or open a Notebook in Vscode, create a new cell, enter and execute the following commands:

```python
# Load the Magic commands of the extension
%load_ext jupyter_agent.bot_magics

# Set the API address of the model to be called, different Agents can call different models, here we call the model deployed locally in lmstudio
%config BotMagics.default_api_url = 'http://127.0.0.1:1234/v1'
%config BotMagics.default_api_key = 'API_KEY'
%config BotMagics.default_model_name = 'qwen3-30b-a3b' 
%config BotMagics.coding_model_name = 'devstral-small-2505-mlx'


# Set whether to save task data to Metadata, only Vscode installed with jupyter-agent-extension supports
%config BotMagics.support_save_meta = True
# Set whether to set cell content, only Vscode installed with jupyter-agent-extension supports
%config BotMagics.support_set_cell_content = True
```

Now, you can use the `%%bot` command to work on task rules and code generation.

#### Perform global task planning

```python
%%bot -P

# Global Goal
...
```

#### Execute task rules and generate subtask code

```python
%%bot [-s stage]

# Some random characters ...
```

More usage instructions can be found at [README](https://github.com/viewstar000/jupyter-agent/blob/main/README.md)

## Contribution

Welcome to submit issues or pull requests to participate in contributions.

## License

This project is based on the [MIT License](https://github.com/viewstar000/jupyter-agent-extension/blob/main/LICENSE) open source. Copyright (c) 2025 viewstar000
