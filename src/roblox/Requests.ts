import {DataReturnHolder} from "./DataReturnHolder";
import { v4 as uuidv4 } from 'uuid';

export abstract class BaseRequest {
    type: string;
    request_id: string;
    result: DataReturnHolder | undefined;

    protected constructor(type: string) {
        this.type = type;
        this.request_id = uuidv4();
        this.result = undefined;
    }

    abstract compileData(): string;
}

export class GetScriptSourceRequest extends BaseRequest {
    path: string;
    constructor(path: string) {
        super("GetScriptSourceRequest");
        this.path = path;
    }

    compileData(): string {
        return JSON.stringify({
            type: this.type,
            path: this.path
        });
    }
}

export class UpdateScriptSourceRequest extends BaseRequest {
    path: string;
    source: string;
    constructor(path: string, source: string) {
        super("UpdateScriptSourceRequest");
        this.path = path;
        this.source = source;
    }

    compileData(): string {
        return JSON.stringify({
            type: this.type,
            path: this.path,
            source: this.source
        });
    }
}

export class IndexScriptsRequest extends BaseRequest {
    constructor() {
        super("IndexScriptsRequest");
    }

    compileData(): string {
        return JSON.stringify({
            type: this.type
        });
    }
}

export class IsClientReadyRequest extends BaseRequest {
    constructor() {
        super("IsClientReadyRequest");
    }

    compileData(): string {
        return JSON.stringify({
            type: this.type
        });
    }
}

export class CloseConnectionRequest extends BaseRequest {
    message: string;
    constructor(message: string) {
        super("CloseConnectionRequest");
        this.message = message;
    }

    compileData(): string {
        return JSON.stringify({
            type: this.type,
            message: this.message
        });
    }
}