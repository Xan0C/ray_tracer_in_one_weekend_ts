import * as zmq from "zeromq";

export function createChild(cb?: (pusher:zmq.Socket, data: string) => void) {
    const puller = zmq.socket('pull').connect("tcp://localhost:5454");
    const pusher = zmq.socket('push').connect("tcp://localhost:5455");
    puller.on('message', (data) => cb(pusher, data));
    pusher.send(JSON.stringify({pid: process.pid, ready: true}));
}