<script lang="ts">
    import { onMount, onDestroy } from 'svelte';
    import { dia } from "@joint/plus";
    import { Label, Input, Select, Heading, Textarea, Button } from "flowbite-svelte";
    import { failure } from '../../theme';
    import { validateLink } from '../../utils/validateLink';

    type Properties = Record<string, dia.Path>;

    export let cell: dia.Cell;

    let label = "";
    let description = "";

    let selfClasses = [{ name: "", value: "" }]

    let context = "";
    let classes: {name: string, value: string}[] = [];

    let props: Properties = {
        context: ['attrs', 'context', "text"],
        classes: ['attrs', 'classes', 'text'],
        label: ['attrs', 'label', 'text'],
        description: ['attrs', 'description', 'text'],
    };

    const assignFormFields = (): void => {
        label = cell.prop(props.label);
        description = cell.prop(props.description);
        context = cell.prop(props.context);
        classes = JSON.parse(cell.prop(props.classes));
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


        if (classes.length > 0) {
            classes.forEach((item, index) => {
                handleHeaderInput(index, 'name', { target: { value: item.name } });
                handleHeaderInput(index, 'value', { target: { value: item.value } });
            })
        }

    });

    onDestroy(() => {
        removeCellListener(cell);
    });


    function handleHeaderInput(index: number, field: string, event: Event) {
        // @ts-ignore
        const value = event.target?.value;
        // @ts-ignore
        selfClasses[index][field] = value;

        changeCellProp(props['classes'], JSON.stringify(selfClasses.filter((item) => item.name !== '' || item.value !== '')));

        if (index === selfClasses.length - 1 && (selfClasses[index].name !== '' || selfClasses[index].value !== '')) {
            selfClasses = [...selfClasses, { name: '', value: '' }];
        }
    }

    function removeHeader(index: number) {
        selfClasses.splice(index, 1);
        selfClasses = selfClasses.slice();

        changeCellProp(props['classes'], JSON.stringify(selfClasses.filter((item) => item.name !== '' || item.value !== '')));
    }

</script>

<div class="flex flex-col gap-5 w-full">
    <Heading tag="h2" customSize="text-2xl font-extrabold ">Настройки объекта: Классифицировать</Heading>

    <div>
        <Label class="mb-2">Название</Label>
        <Input type="text" placeholder="Введите название" bind:value={label} on:input={() => changeCellProp(props['label'], label)}/>
    </div>
    <div>
        <Label class="mb-2">Описание</Label>
        <Input type="text" placeholder="Введите описание" bind:value={description} on:input={() => changeCellProp(props['description'], description)}/>
    </div>
    <div>
        <Label class="mb-2">Контекст</Label>
        <Input type="text" placeholder="Введите Контекст" bind:value={context} on:input={() => changeCellProp(props.context, context)}/>
    </div>
    <div class="flex flex-col gap-2 pb-4">
        <Label class="mb-2">Классы</Label>
        {#each selfClasses as {name, value}, index}
            <div class="flex flex-col gap-2">
                <Input
                    type="text"
                    placeholder="Имя класса"
                    value={name}
                    on:input={(e) => handleHeaderInput(index, 'name', e)}
                />
                <Input
                    type="text"
                    placeholder="Описание класса"
                    value={value}
                    on:input={(e) => handleHeaderInput(index, 'value', e)}
                />

                {#if index !== 0 || selfClasses.length > 1}
                    <Button on:click={() => removeHeader(index)} color="blue">Удалить заголовок</Button>
                {/if}
            </div>
        {/each}
    </div>
</div>