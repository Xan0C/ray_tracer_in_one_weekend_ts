import cluster from "cluster";
import {Worker} from "cluster";
import * as os from "os";
import * as zmq from "zeromq";

function createPusher(): zmq.Socket {
    return zmq.socket("push").bind('tcp://*:5454');
}

function createPuller(): zmq.Socket {
    return zmq.socket("pull").bind('tcp://*:5455');
}

export function createMaster(): {pusher: zmq.Socket, puller: zmq.Socket, count: number} {
    const workerCount = os.cpus().length;

    const puller = createPuller();
    const pusher = createPusher();

    //Listen to Workers to come online
    cluster.on('online', (worker: Worker) => {
        console.log('Worker ' + worker.process.pid + ' is online');
    });

    cluster.on('death', function(worker) {
        console.log('worker ' + worker.pid + ' died');
    });

    for (let i = 0; i < workerCount; i++) {
        cluster.fork();
    }

    return {puller, pusher, count: workerCount};
}