import * as Comlink from 'comlink';
import nodeEndpoint from 'comlink/dist/umd/node-adapter';
import { parentPort } from 'worker_threads';
import { workerFunc } from './workerFunction';

const nodeWorker = {
    traceImage: workerFunc,
};
Comlink.expose(nodeWorker, nodeEndpoint(parentPort));
