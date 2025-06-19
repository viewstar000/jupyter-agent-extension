// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

let deactivated = false;

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "jupyter-agent-extension" is now active!');
    deactivated = false;
    context.subscriptions.push(
        vscode.workspace.onDidChangeNotebookDocument((e) => {
            console.log('jupyter-agent.notebookChanged:', e);
            e.cellChanges.forEach((change) => {
                if (change.cell.kind === vscode.NotebookCellKind.Code && change.cell.outputs.length > 0) {
                    const cellTimestamp = change.cell.metadata.metadata['jupyter-agent-data-timestamp'] || 0;
                    console.log(
                        'jupyter-agent.notebookChanged.codeCell:',
                        change.cell.index,
                        cellTimestamp,
                        change.cell.outputs.length
                    );
                    let updateTimestamp = 0;
                    let updateMetadata: { [key: string]: any } = {};
                    change.cell.outputs.forEach((output) => {
                        if (
                            output.metadata &&
                            output.metadata.outputType === 'display_data' &&
                            output.metadata.metadata &&
                            output.metadata.metadata['jupyter-agent-data-store'] === true
                        ) {
                            const outputTimestamp = output.metadata.metadata['jupyter-agent-data-timestamp'] || 0;
                            console.log('jupyter-agent.notebookChanged.codeCell.outputs.timestamp:', outputTimestamp);
                            if (outputTimestamp > cellTimestamp && output.metadata.metadata['jupyter-agent-data']) {
                                for (const key in output.metadata.metadata['jupyter-agent-data']) {
                                    if (!updateMetadata.metadata) {
                                        updateMetadata = JSON.parse(JSON.stringify(change.cell.metadata));
                                        if (!('jupyter-agent-data' in updateMetadata.metadata)) {
                                            updateMetadata.metadata['jupyter-agent-data'] = {};
                                        }
                                        console.log(
                                            'jupyter-agent.notebookChanged.codeCell.outputs.updateMetadata.init',
                                            updateMetadata
                                        );
                                    }
                                    console.log('jupyter-agent.notebookChanged.codeCell.outputs.updateMetadata', key);
                                    updateMetadata.metadata['jupyter-agent-data'][key] =
                                        output.metadata.metadata['jupyter-agent-data'][key];
                                }
                                updateTimestamp = outputTimestamp > updateTimestamp ? outputTimestamp : updateTimestamp;
                            }
                        }
                    });
                    if (updateTimestamp > cellTimestamp) {
                        updateMetadata.metadata['jupyter-agent-data-store'] = true;
                        updateMetadata.metadata['jupyter-agent-data-timestamp'] = updateTimestamp;
                        console.log(
                            'jupyter-agent.notebookChanged.codeCell.updateMetadata',
                            updateTimestamp,
                            updateMetadata
                        );
                        const edit = new vscode.WorkspaceEdit();
                        const nbEdit = vscode.NotebookEdit.updateCellMetadata(change.cell.index, updateMetadata);
                        edit.set(change.cell.notebook.uri, [nbEdit]);
                        vscode.workspace.applyEdit(edit);
                    }
                }
            });
        })
    );
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Your extension "jupyter-agent-extension" is now deactivated!');
    deactivated = true;
}
