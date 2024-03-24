import { dia, shapes, ui } from "@joint/plus";

import { enableVirtualRendering } from "./features/virtual-rendering";
import { toolbarConfig } from "./config/toolbar.config";
import { BACKGROUND_COLOR, SECONDARY_BACKGROUND_COLOR, GRID_SIZE, PADDING_L, PADDING_S, warning } from "../theme";
import "./shapes/index";
import { ShapeTypesEnum } from "./shapes/app.shapes";

export function createPlugins(scopeElement: Element, paperElement: Element, stencilElement: Element, toolbarElement: Element) {
    const graph = new dia.Graph({}, { cellNamespace: shapes });

    graph.on("add", function (cell) {
        if ([ShapeTypesEnum.FLOWCHART_START, ShapeTypesEnum.FLOWCHART_END].includes(cell.get("type"))) {
            const count = graph.getElements().filter((element) => element.get("type") === cell.get("type")).length;

            if (count === 2) {
                warning(
                    `Элемент ${
                        cell.get("type") === ShapeTypesEnum.FLOWCHART_START ? "Старт" : "Финиш"
                    } уже существует. Добавление ограничено до одного экземпляра.`
                );

                setTimeout(() => {
                    graph.removeCells(cell);
                }, 10);
            }
        }
    });

    const paper = new dia.Paper({
        model: graph,
        async: true,
        sorting: dia.Paper.sorting.APPROX,
        gridSize: GRID_SIZE,
        linkPinning: false,
        multiLinks: false,
        snapLinks: true,
        moveThreshold: 5,
        magnetThreshold: "onleave",
        background: { color: BACKGROUND_COLOR },
        cellViewNamespace: shapes,
        interactive: {
            labelMove: true,
            linkMove: false,
        },
        defaultRouter: {
            name: "manhattan",
            args: {
                padding: { bottom: PADDING_L, vertical: PADDING_S, horizontal: PADDING_S },
                step: GRID_SIZE,
            },
        },
        defaultConnector: {
            name: "rounded",
        },
        defaultLink: function (cellView, magnet) {
            const portGroup = magnet.parentElement!.getAttribute("port-group");

            if (portGroup === "error") {
                return new shapes.app.ErrorLink();
            } else {
                return new shapes.app.Link();
            }
        },
        // defaultLink: () => new shapes.app.Link(),
        validateConnection: (
            sourceView: dia.CellView,
            sourceMagnet: SVGElement,
            targetView: dia.CellView,
            targetMagnet: SVGElement
        ) => {
            if (sourceView === targetView) return false;

            const targetGroup = targetView.findAttribute("port-group", targetMagnet);
            const sourceGroup = sourceView.findAttribute("port-group", sourceMagnet);

            if (targetGroup !== "in") return false;
            if (sourceGroup !== "out" && sourceGroup !== "error") return false;

            return true;
        },
    });

    paper.on("link:connect", function (linkView) {
        const sourcePortId = linkView.model.get("source").port;
        const sourceElementId = linkView.model.get("source").id;
        const sourceElement = graph.getCell(sourceElementId);
        const sourcePortGroup = sourceElement.getPort(sourcePortId).group;

        if (sourcePortGroup === "out" || sourcePortGroup === "error") {
            const connectedLinks = graph.getConnectedLinks(sourceElement, { outbound: true });
            const duplicateLinks = connectedLinks.filter((link) => {
                const linkSource = link.get("source");
                return linkSource.port === sourcePortId && link.id !== linkView.model.id;
            });

            if (duplicateLinks.length > 0) {
                linkView.model.remove();
                warning("Только один исходящий путь разрешен с этого порта");
            }
        }
    });

    const scroller = new ui.PaperScroller({
        paper,
        autoResizePaper: true,
        contentOptions: {
            padding: 100,
            allowNewOrigin: "any",
            allowNegativeBottomRight: true,
            useModelGeometry: true,
        },
        scrollWhileDragging: true,
        cursor: "grab",
        baseWidth: 1000,
        baseHeight: 1000,
    });

    paperElement.appendChild(scroller.el);
    scroller.render().center();

    enableVirtualRendering(scroller, { threshold: 50 });

    const stencil = new ui.Stencil({
        paper: scroller,
        width: 240,
        scaleClones: true,
        dropAnimation: true,
        paperOptions: {
            sorting: dia.Paper.sorting.NONE,
            background: {
                color: SECONDARY_BACKGROUND_COLOR,
            },
        },
        dragStartClone: (element: dia.Element) => {
            const name = element.get("name");
            // @ts-ignore
            const Shape = shapes.app[name];
            if (!Shape) throw new Error(`Invalid stencil shape name: ${name}`);
            return Shape.fromStencilShape(element);
        },
        layout: {
            columnWidth: 110,
            columns: 1,
            rowGap: PADDING_S,
            rowHeight: "auto",
            marginY: PADDING_S,
            marginX: -PADDING_L,
        },
    });

    stencilElement.appendChild(stencil.el);
    stencil.render();

    const history = new dia.CommandManager({
        graph,
    });

    const toolbar = new ui.Toolbar({
        tools: toolbarConfig.tools,
        autoToggle: true,
        references: {
            paperScroller: scroller,
            commandManager: history,
        },
    });
    toolbarElement.appendChild(toolbar.el);
    toolbar.render();

    const tooltip = new ui.Tooltip({
        rootTarget: scopeElement,
        container: scopeElement,
        target: "[data-tooltip]",
        direction: ui.Tooltip.TooltipArrowPosition.Auto,
        padding: PADDING_S,
        animation: true,
    });

    const keyboard = new ui.Keyboard();

    return { graph, paper, scroller, stencil, toolbar, tooltip, keyboard, history };
}
