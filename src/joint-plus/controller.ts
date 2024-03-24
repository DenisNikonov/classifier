import { mvc } from "@joint/plus";
import JointPlusService from "../services/joint-plus.service";

export enum SharedEvents {
    JSON_EDITOR_CHANGED = "json-editor-changed",
    SELECTION_CHANGED = "selection-changed",
    GRAPH_CHANGED = "graph-changed",
    GRAPH_START_BATCH = "graph-start-batch",
    GRAPH_STOP_BATCH = "graph-stop-batch",
}

export abstract class Controller extends mvc.Listener<[JointPlusService]> {
    constructor(public readonly service: JointPlusService) {
        super(service);
        this.startListening();
    }

    abstract startListening(): void;
}
