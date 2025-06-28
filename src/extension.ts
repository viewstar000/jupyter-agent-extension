// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
    // Use the console to output diagnostic information (console.log) and errors (console.error)
    // This line of code will only be executed once when your extension is activated
    console.log('Congratulations, your extension "jupyter-agent-extension" is now active!');
    let disposableNotebookChanged = vscode.workspace.onDidChangeNotebookDocument((e) => {
        console.log('JAE.nbChanged:', e);
        let nbEditList: vscode.NotebookEdit[] = [];
        e.cellChanges.forEach((change) => {
            if (
                change.cell.index >= 0 &&
                change.cell.kind === vscode.NotebookCellKind.Code &&
                change.cell.outputs.length > 0
            ) {
                console.log(
                    'JAE.nbChanged.cell:',
                    change.cell.index,
                    change.cell.outputs.length,
                    change.cell.metadata.metadata
                );
                let metadataModified = false;
                let updateMetadata = JSON.parse(JSON.stringify(change.cell.metadata));
                const { metadata, modified } = handleAgentData(change, updateMetadata);
                if (modified) {
                    updateMetadata = metadata;
                    metadataModified = true;
                }
                const { metadata: actionMetadata, modified: actionModified } = handleAgentAction(
                    change,
                    updateMetadata,
                    nbEditList
                );
                if (actionModified) {
                    updateMetadata = actionMetadata;
                    metadataModified = true;
                }
                if (metadataModified) {
                    console.log('JAE.nbChanged.cell.meta.update', change.cell.index, updateMetadata);
                    nbEditList.push(vscode.NotebookEdit.updateCellMetadata(change.cell.index, updateMetadata));
                }
            }
        });
        if (nbEditList.length > 0) {
            const edit = new vscode.WorkspaceEdit();
            edit.set(e.notebook.uri, nbEditList);
            vscode.workspace.applyEdit(edit);
        }
    });
    context.subscriptions.push(disposableNotebookChanged);
}

function handleAgentData(change: vscode.NotebookDocumentCellChange, updateMetadata: { [key: string]: any }) {
    const cellDataTimestamp = change.cell.metadata.metadata['jupyter-agent-data-timestamp'] || 0;
    let handledDataTimestamp = 0;
    let modified = false;
    change.cell.outputs.forEach((output) => {
        if (output.metadata && output.metadata.outputType === 'display_data' && output.metadata.metadata) {
            const outputMeta = output.metadata.metadata;
            if (
                outputMeta['jupyter-agent-data-store'] === true &&
                outputMeta['jupyter-agent-data-timestamp'] > cellDataTimestamp &&
                outputMeta['jupyter-agent-data']
            ) {
                console.log(
                    'JAE.nbChanged.cell.outs.data.handling',
                    change.cell.index,
                    cellDataTimestamp,
                    outputMeta['jupyter-agent-data-timestamp'],
                    outputMeta['jupyter-agent-data']
                );
                for (const key in outputMeta['jupyter-agent-data']) {
                    if (!updateMetadata) {
                        updateMetadata = JSON.parse(JSON.stringify(change.cell.metadata));
                    }
                    if (!('jupyter-agent-data' in updateMetadata.metadata)) {
                        updateMetadata.metadata['jupyter-agent-data'] = {};
                    }
                    updateMetadata.metadata['jupyter-agent-data'][key] = outputMeta['jupyter-agent-data'][key];
                }
                handledDataTimestamp = Math.max(handledDataTimestamp, outputMeta['jupyter-agent-data-timestamp']);
            }
        }
    });
    if (handledDataTimestamp > cellDataTimestamp) {
        console.log('JAE.nbChanged.cell.meta.setDataTimestamp', change.cell.index, handledDataTimestamp);
        updateMetadata.metadata['jupyter-agent-data-store'] = true;
        updateMetadata.metadata['jupyter-agent-data-timestamp'] = handledDataTimestamp;
        modified = true;
    }
    return { metadata: updateMetadata, modified };
}

let handledActions: { [key: string]: any } = {};

function handleAgentAction(
    change: vscode.NotebookDocumentCellChange,
    updateMetadata: { [key: string]: any },
    nbEditList: vscode.NotebookEdit[]
) {
    const cellActionTimestamp = change.cell.metadata.metadata['jupyter-agent-action-timestamp'] || 0;
    let handledActionTimestamp = 0;
    let modified = false;
    change.cell.outputs.forEach((output) => {
        if (output.metadata && output.metadata.outputType === 'display_data' && output.metadata.metadata) {
            const outputMeta = output.metadata.metadata;
            if (outputMeta['jupyter-agent-action-records'] && outputMeta['jupyter-agent-action-records'].length > 0) {
                outputMeta['jupyter-agent-action-records'].forEach((action: any) => {
                    if (action.timestamp > cellActionTimestamp && !handledActions[action.uuid]) {
                        console.log('JAE.nbChanged.cell.outs.actions.handling', action);
                        handledActions[action.uuid] = action;
                        handledActionTimestamp = Math.max(handledActionTimestamp, action.timestamp);
                        if (!updateMetadata) {
                            updateMetadata = JSON.parse(JSON.stringify(change.cell.metadata));
                        }
                        if (action.action === 'set_cell_content') {
                            let newCell = new vscode.NotebookCellData(
                                action.params.type === 'code'
                                    ? vscode.NotebookCellKind.Code
                                    : vscode.NotebookCellKind.Markup,
                                action.params.source,
                                action.params.type === 'code' ? 'python' : 'markdown'
                            );
                            newCell.metadata = { metadata: action.params.metadata };
                            newCell.metadata.metadata.tags = action.params.tags;
                            if (action.params.index === 0) {
                                let range = new vscode.NotebookRange(change.cell.index, change.cell.index + 1);
                                nbEditList.push(vscode.NotebookEdit.replaceCells(range, [newCell]));
                                updateMetadata = newCell.metadata;
                            } else if (action.params.index >= 1) {
                                let insertIdx = change.cell.index + action.params.index;
                                nbEditList.push(vscode.NotebookEdit.insertCells(insertIdx, [newCell]));
                            } else if (action.params.index <= -1) {
                                let insertIdx = change.cell.index + action.params.index + 1;
                                nbEditList.push(vscode.NotebookEdit.insertCells(insertIdx, [newCell]));
                            }
                        }
                    }
                });
            }
        }
    });
    if (handledActionTimestamp > cellActionTimestamp) {
        console.log('JAE.nbChanged.cell.meta.setActionTimestamp', change.cell.index, handledActionTimestamp);
        updateMetadata.metadata['jupyter-agent-action-timestamp'] = handledActionTimestamp;
        modified = true;
    }
    return { metadata: updateMetadata, modified };
}

// This method is called when your extension is deactivated
export function deactivate() {
    console.log('Your extension "jupyter-agent-extension" is now deactivated!');
}
