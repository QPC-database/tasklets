class Tasklet {
  export(obj) {
    this[obj.name] = obj;
    // TODO: Exports with same name?!
  }
}

registry = new Map();

addEventListener('message', event => {
  switch(event.data.type) {
    case 'LOAD':
      try {
        if(registry.has(event.data.path))
          break;

        self.tasklets = new Tasklet();
        importScripts(event.data.path);
        registry.set(event.data.path, self.tasklets);
        delete self.tasklets;
        break;
      } catch(error) {
        postMessage({
          type: 'ERROR',
          path: event.data.path,
          error: error.toString(),
        });
      }
      break;
    case 'APPLY':
      const tasklet = registry.get(event.data.path);
      const result = tasklet[event.data.exportName].apply(null, event.data.argumentsList);
      postMessage({
        id: event.data.id,
        result,
      });
      break;
    default:
      throw Error(`Unknown message type "${event.data.type}"`);
  }
  postMessage({
    type: 'LOAD_SUCCESSFUL',
    id: event.data.id,
    path: event.data.path,
    structure: Object.keys(registry.get(event.data.path)),
  });
});