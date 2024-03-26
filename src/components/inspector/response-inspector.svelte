<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { dia } from "@joint/plus";
    import { Label, Input, Select, Heading, Textarea, Button } from "flowbite-svelte";

    type Properties = Record<string, dia.Path>;

    export let cell: dia.Cell;

    let response = "";

    let props: Properties = {
        response: ['attrs', 'response', "text"],

    };

    const assignFormFields = (): void => {
        response = cell.prop(props.response);
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

<div class="flex flex-col gap-5 w-full">
    <Heading tag="h2" customSize="text-2xl font-extrabold ">Настройки объекта: Ответить</Heading>

    <div>
        <Label class="mb-2">Ответ</Label>
        <Input type="text" placeholder="Введите ответ" bind:value={response} on:input={() => changeCellProp(props['response'], response)}/>
    </div>
</div>