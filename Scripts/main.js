const { ToDoDataProvider } = require("./ToDoDataProvider.js");
console.clear();
// TODO: ADD screenshots to README
// TODO: Add reset preferences for global
// TODO: Add reset preferences for workspace
// FIXME: Remove , in paths setting
var treeView = null;
var dataProvider = null;
var refreshTimer = null;
var sortBy = 'file';

var activate = exports.activate = function() {
  // Do work when the extension is activated
  dataProvider = new ToDoDataProvider(sortBy);
  
  // Create the TreeView
  treeView = new TreeView("todo", {
    dataProvider: dataProvider
  });
  
  // TreeView implements the Disposable interface
  nova.subscriptions.add(treeView);
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
  treeView = null;
  dataProvider = null;
  if (refreshTimer !== null) {
    clearInterval(refreshTimer);
  }
}

nova.commands.register("todo.addPath", () => {
  addWorkspaceIgnorePath(nova.workspace.config.get("todo.selected-ignore-path"));

  nova.workspace.config.set("todo.selected-ignore-path", "");
});

nova.commands.register("todo.openFile", () => {
  let selection = treeView.selection;
  
  nova.workspace.openFile(selection.map((e) => e.filePath));
});

nova.commands.register("todo.ignoreFile", () => {
  let selection = treeView.selection;
  
  addWorkspaceIgnorePath(nova.path.normalize(selection.map((e) => e.filePath)));
});

nova.commands.register("todo.ignoreParentDirectory", () => {
  let selection = treeView.selection;
  
  addWorkspaceIgnorePath(nova.path.dirname(selection.map((e) => e.filePath)));
});

// TODO: Move to configuration class.
function addWorkspaceIgnorePath(path) {
  path = nova.path.normalize(path);
  let workspaceIgnorePaths = nova.workspace.config.get("todo.workspace-ignore-paths") + "," + path;
  workspaceIgnorePaths = workspaceIgnorePaths.replace("null,", "");
  
  nova.workspace.config.set("todo.workspace-ignore-paths", workspaceIgnorePaths);
}

nova.commands.register("todo.doubleClick", () => {
  let selection = treeView.selection;
  let fileStatus = nova.workspace.openFile(selection.map((e) => e.filePath));
  
  fileStatus.then (
    function() {
      let editor = nova.workspace.activeTextEditor;
      let position = parseInt(selection.map((e) => e.position));
      let range = new Range(position, position);
      
      editor.selectedRange = range;
      editor.scrollToPosition(position);
    }
  );
});

nova.commands.register("todo.refresh", () => {
  reloadData();
});

nova.commands.register("todo.sort", () => {
  toggleSortBy();
  reloadData(sortBy);
});

nova.config.observe("todo.global-case-sensitive-tag-matching", reloadData);

// TODO: Remove this and retrieve from extension.json or a Nova API if provided.
const PREFERENCE_KEYWORDS = [
  "broken", "bug", "debug", "deprecated", "example", "error",
  "err", "fail", "fatal", "fix", "hack", "idea", "info", "note", "optimize", "question",
  "refactor", "remove", "review", "task", "trace", "update", "warn", "warning"
];

PREFERENCE_KEYWORDS.forEach(keyword => {
  nova.config.observe(`todo.global-keyword-${keyword}`, reloadData);  
});

nova.config.observe("todo.global-ignore-names", reloadData);
nova.config.observe("todo.global-ignore-extensions", reloadData);

if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  // It is not necessary to observe the workspace config because the file system watch detects these changes.
  nova.fs.watch(null, reloadData);
} else {
  // Must use polling because nova.fs.watch requires a current workspace.
  refreshTimer = setInterval(reloadData, 15000);
}

function reloadData() {
  if (treeView !== null) {
    dataProvider.loadData(sortBy);
    treeView.reload();
  }
}

function toggleSortBy() {
  if (sortBy == 'file') {
    sortBy = 'tag';
  } else {
    sortBy = 'file';
  }
}