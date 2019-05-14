import * as cluster from "cluster";
import * as zmq from "zeromq";
import {createMaster} from "./master";
import {createChild} from "./child";

export function createCluster(childCb: (pusher: zmq.Socket, data:string) => void): {puller: zmq.Socket, pusher: zmq.Socket, count:number} | null{
    if (cluster.isMaster) {
        return createMaster();
    } else {
        createChild(childCb);
    }
}