import { NodeServer } from '@bitdev/node.node-server';

export default NodeServer.from({
  name: 'foodey-service',
  mainPath: import.meta.resolve('./foodey-service.app-root.js'),
});
