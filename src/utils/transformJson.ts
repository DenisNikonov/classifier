export const transformJson = (inputJson: any) => {
    let links = inputJson.cells.filter((cell) => cell.type === "app.Link" || cell.type === "app.ErrorLink");
    let nodes = inputJson.cells.filter((cell) => cell.type !== "app.Link" && cell.type !== "app.ErrorLink");

    let linksMap = links.reduce((acc, link) => {
        let sourceId = link.source.id;
        if (!acc[sourceId]) {
            acc[sourceId] = { nextID: null, nextErrorID: null };
        }
        if (link.type === "app.Link") {
            acc[sourceId].nextID = link.target.id;
        } else if (link.type === "app.ErrorLink") {
            acc[sourceId].nextErrorID = link.target.id;
        }
        return acc;
    }, {});

    let transformed = nodes.map((node) => {
        let linkDetails = linksMap[node.id];
        const result = {
            id: node.id,
            data: {},
            gridData: {
                ...node,
                links: links.filter((link) => link.source.id === node.id || link.target.id === node.id),
            },
            type: node.attrs.type.text,
            nextID: linkDetails ? linkDetails.nextID : null,
            nextErrorID: linkDetails ? linkDetails.nextErrorID : null,
        };

        if (result.type === "external_request") {
            result.data = {
                url: node.attrs.url.text,
                headers: JSON.parse(node.attrs.headers.text),
                method: node.attrs.method.text,
                requestBody: JSON.parse(node.attrs.requestBody.text),
            };
        }

        if (result.type === "classify") {
            result.data = {
                context: node.attrs.context.text,
                classes: JSON.parse(node.attrs.classes.text),
            };
        }

        if (result.type === "respond") {
            result.data = {
                response: node.attrs.response.text,
            };
        }

        return result;
    });

    return transformed;
};
