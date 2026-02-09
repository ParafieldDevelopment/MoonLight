import { MoonlightWebsocketServer } from "./MoonlightWebsocketServer";
import {IndexScriptsRequest, GetScriptSourceRequest, UpdateScriptSourceRequest} from "./Requests";

const server = new MoonlightWebsocketServer(4930);
server.waitForConnection().then(async () => {
    let script_index = await server.submitRequest(new IndexScriptsRequest());
    console.log(script_index.result?.getJson());

    const get_script_source = await server.submitRequest(new GetScriptSourceRequest('Workspace.ScriptTest_ScKuLf5lQdOT8QlncsaB'));
    console.log(get_script_source.result?.getJson().source)

    await server.submitRequest(
        new UpdateScriptSourceRequest(
            'Workspace.ScriptTest_ScKuLf5lQdOT8QlncsaB',
            "print(\"If you see this then it worked!\")"
            )
    );
});