import { runCluster } from './cluster';
import { runWorker } from './worker';
import { runSingle } from './single';

if (process.env.SINGLE) {
    runSingle();
} else if (process.env.CLUSTER) {
    runCluster();
} else {
    runWorker();
}
