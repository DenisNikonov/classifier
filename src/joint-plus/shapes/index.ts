import { dia } from "@joint/plus";

import "./app.shapes";
import "./stencil.shapes";

declare module "@joint/plus" {
    namespace shapes {
        namespace app {
            class Base extends dia.Element {
                static fromStencilShape(element: dia.Element): Base;
                getBoundaryPadding(): dia.PaddingJSON;
            }
            class Message extends Base {
                addDefaultPort(): void;
                canAddPort(group: string): boolean;
                toggleAddPortButton(group: string): void;
            }
            class FlowchartStart extends Base {}
            class FlowchartFinish extends Base {}
            class Link extends dia.Link {}
        }
        namespace stencil {
            class Message extends dia.Element {}
            class FlowchartStart extends dia.Element {}
            class FlowchartFinish extends dia.Element {}
        }
    }
}
