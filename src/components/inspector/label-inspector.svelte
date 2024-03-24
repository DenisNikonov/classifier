<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { dia } from "@joint/plus";

    type Properties = Record<string, dia.Path>;

    export let cell: dia.Cell;

    let label = "";

    let props: Properties = {
        label: ['attrs', 'label', 'text'],
    };

    const assignFormFields = (): void => {
        label = cell.prop(props.label);
    };

    const changeCellProp = (path: dia.Path, value: any): void => {
        cell.prop(path, value);
    };

    const addCellListener = (cell: dia.Cell): void => {
        cell.on("change", assignFormFields);
    };

    const removeCellListener = (cell: dia.Cell): void => {
        cell.off("change", assignFormFields);
    };

    onMount(() => {
        assignFormFields();
        addCellListener(cell);
    });

    onDestroy(() => {
        removeCellListener(cell);
    });

</script>

<div>
    <h2>Настройки объекта {cell.prop(props.label)}</h2>

    <label>Название:
        <input type="text"
                placeholder="Название объекта"
                bind:value={label}
                on:input={() => changeCellProp(props['label'], label)}>
    </label>
</div>