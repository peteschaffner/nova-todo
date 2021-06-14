const FUNCTIONS            = require('./functions.js')
const { Configuration }    = require('./configuration.js')
const { WorkspaceSearch }  = require('./workspace_search.js')
const { DocumentSearch }   = require('./document_search.js')
const { Group }            = require('./group.js')
const { ToDoDataProvider } = require('./todo_data_provider.js')

var config    = new Configuration()
var groupBy   = 'file'
var tagsArray = []
var treeView  = null

// var refreshTimer = null
// var dataProvider = null

/*
ON CHANGE DETECTED

if file !ignored
  get tags of changed file using extension function

  if tags different (compare arrays for file)
    reload tree
  end
end
*/
exports.activate = function() {
  console.clear()
  console.log('TODO EXTENSION ACTIVATED')

  if (FUNCTIONS.isWorkspace()) {
    let workspaceSearch = new WorkspaceSearch(nova.workspace.path, config)
    let files           = workspaceSearch.search()

    files
      .then((response, reject) => {
        response = FUNCTIONS.filterFilePathArray(response, config)

        response.forEach((filePath) => {
          let fileSearch = new DocumentSearch(config)
          tagsArray      = [...tagsArray, ...fileSearch.searchFile(filePath)]
        })

        let group = new Group()
        tagsArray = group.groupListItems(tagsArray, groupBy)

        loadTreeView()
      })
      .catch((err) => {
        console.log('TODO Extension', err)
      })
  } else {
    let openDocuments = nova.workspace.textDocuments

    openDocuments = FUNCTIONS.filterOpenDocumentArray(openDocuments, config)

    openDocuments.forEach((textDocument) => {
      let documentSearch = new DocumentSearch(config)
      tagsArray = [...tagsArray, ...documentSearch.searchOpenDocument(textDocument)]
    })

    let group = new Group()
    tagsArray = group.groupListItems(tagsArray, groupBy)

    loadTreeView()
  }
}

function loadTreeView() {
  /*
    NOTE: At time of writing, the TreeView is not editable once it is part of
    the DataProvider object. Therefore, the original ListItem array must be edited, then the Nova TreeView
    disposed and replaced by a completely new TreeView object.
  */

  // Convert array of editable ListItem objects to a Nova TreeView object.
  treeView = new TreeView('todo', {
    dataProvider: new ToDoDataProvider(tagsArray, groupBy)
  })

  nova.subscriptions.add(treeView)
}

exports.deactivate = function() {
  // Clean up state before the extension is deactivated
  // treeView = null
  // dataProvider = null
  // if (refreshTimer !== null) {
  //   clearInterval(refreshTimer)
  // }
}

nova.commands.register('todo.addPath', () => {
//   addWorkspaceIgnorePath(nova.workspace.config.get('todo.selected-ignore-path'))
//
//   nova.workspace.config.set('todo.selected-ignore-path', '')
})

nova.commands.register('todo.openFile', () => {
//   let selection = treeView.selection
//
//   nova.workspace.openFile(selection.map((e) => e.filePath))
})

nova.commands.register('todo.ignoreFile', () => {
//   let selection = treeView.selection
//
//   addWorkspaceIgnorePath(nova.path.normalize(selection.map((e) => e.filePath)))
})

nova.commands.register('todo.ignoreParentDirectory', () => {
//   let selection = treeView.selection
//
//   addWorkspaceIgnorePath(nova.path.dirname(selection.map((e) => e.filePath)))
})

function addWorkspaceIgnorePath(path) {
//   path = nova.path.normalize(path)
//   let workspaceIgnorePaths = nova.workspace.config.get('todo.workspace-ignore-paths') + ',' + path
//   workspaceIgnorePaths = workspaceIgnorePaths.replace('null,', '')
//
//   nova.workspace.config.set('todo.workspace-ignore-paths', workspaceIgnorePaths)
}

nova.commands.register('todo.doubleClick', () => {
//   let selection = treeView.selection
//
//   let path = selection.map((e) => e.filePath)
//   let line = selection.map((e) => e.line)
//   let column = selection.map((e) => e.column)
//
//   let fileStatus = nova.workspace.openFile(path, [line, column])
//
//   fileStatus.then (
//     function() {
//       let editor = nova.workspace.activeTextEditor
//       let position = parseInt(selection.map((e) => e.position))
//       let range = new Range(position, position)
//
//       editor.selectedRange = range
//       editor.scrollToPosition(position)
//     }
//   )
})

nova.commands.register('todo.refresh', () => {
  // reloadData()
})

nova.commands.register('todo.sort', () => {
//   if (sortBy == 'file') {
//     sortBy = 'tag'
//   } else {
//     sortBy = 'file'
//   }
//
//   reloadData(sortBy)
})

// nova.config.observe('todo.global-case-sensitive-tag-matching', reloadData)

// TODO: Remove this and retrieve from extension.json or a Nova API if provided - Duplicated in Configuration.js too.
// const PREFERENCE_KEYWORDS = [
//   'broken', 'bug', 'debug', 'deprecated', 'example', 'error',
//   'err', 'fail', 'fatal', 'fix', 'hack', 'idea', 'info', 'note', 'optimize', 'question',
//   'refactor', 'remove', 'review', 'task', 'trace', 'update', 'warn', 'warning'
// ]
//
// PREFERENCE_KEYWORDS.forEach(keyword => {
//   nova.config.observe(`todo.global-keyword-${keyword}`, reloadData)
// })

// nova.config.observe('todo.global-ignore-names', reloadData)
// nova.config.observe('todo.global-ignore-extensions', reloadData)
// nova.fs.watch()
if (nova.workspace.path !== undefined && nova.workspace.path !== null) {
  // It is not necessary to observe the workspace config because the file system watch detects these changes.
  // nova.fs.watch(null, reloadData)
  console.log("CHANGE DETECTED")
} else {
  // Must use polling because nova.fs.watch requires a current workspace.
  // refreshTimer = setInterval(reloadData, 15000)
}

function updateData() {
//   if (treeView !== null) {
//
//   }
}

function reloadData() {
  // if (treeView !== null) {
  //   // dataProvider.loadData(sortBy)
  //   // dataProvider.refresh()
  //   treeView.reload()
  // }
}
