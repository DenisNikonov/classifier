export const generateOriginalJson = (transformedNodes) => {
    let originalCells = [];

    transformedNodes.forEach((node) => {
        let nodeData = { ...node.gridData };
        delete nodeData.links;
        originalCells.push(nodeData);

        node.gridData.links.forEach((link) => {
            if (!originalCells.some((cell) => cell.id === link.id)) {
                originalCells.push(link);
            }
        });
    });

    return { cells: originalCells };
};
