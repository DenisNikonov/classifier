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

    let url = "";
    let method = "GET";
    let headers = "";
    let requestBody = "";

    let selfHeaders: {name: string, value: string}[] = [{ name: '', value: '' }];

    let isHasErrorOnUrl = false;

    // GET/POST/PUT/PATCH/DELETE
    const methods = [
        { value: "GET", name: "GET" },
        { value: "POST", name: "POST" },
        { value: "PUT", name: "PUT" },
        { value: "PATCH", name: "PATCH" },
        { value: "DELETE", name: "DELETE" },
    ];

    let props: Properties = {
        url: ['attrs', 'url', "text"],
        method: ['attrs', 'method', 'text'],
        headers: ['attrs', 'headers', 'text'],
        requestBody: ['attrs', 'requestBody', 'text'],
        label: ['attrs', 'label', 'text'],
        description: ['attrs', 'description', 'text'],
    };

    const assignFormFields = (): void => {
        label = cell.prop(props.label);
        description = cell.prop(props.description);
        url = cell.prop(props.url);
        method = cell.prop(props.method);
        requestBody = JSON.parse(cell.prop(props.requestBody));
        headers = JSON.parse(cell.prop(props.headers));
    };

    const changeCellProp = (path: dia.Path, value: any): void => {
        if (path.includes('requestBody')) {
            try {
                JSON.parse(value);
                cell.prop(path, value);
            } catch (e) {
                failure('Некорректное тело запроса');
            }

            return;
        }

        if (path.includes('url')) {
            const result = validateLink(value);

            if (result) {
                isHasErrorOnUrl = false;
                cell.prop(path, value);
            } else {
                isHasErrorOnUrl = true;
            }

            return;
        }
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

        const headerEntries = Object.entries(headers)

        if (headerEntries.length > 0) {
            Object.entries(headers).forEach(([key, value], index) => {
                handleHeaderInput(index, 'name', { target: { value: key } });
                handleHeaderInput(index, 'value', { target: { value: value } });
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
        selfHeaders[index][field] = value;

        let localHeaders: Record<string, string> = {};

        selfHeaders.forEach((header) => {
            if(header.name !== '' || header.value !== '') {
                localHeaders[header.name] = header.value;
            }
        });

        changeCellProp(props['headers'], JSON.stringify(localHeaders));

        if (index === selfHeaders.length - 1 && (selfHeaders[index].name !== '' || selfHeaders[index].value !== '')) {
            selfHeaders = [...selfHeaders, { name: '', value: '' }];
        }
    }

    function removeHeader(index: number) {
        selfHeaders.splice(index, 1);
        selfHeaders = selfHeaders.slice();

        let localHeaders: Record<string, string> = {};

        selfHeaders.forEach((header) => {
            if(header.name !== '' || header.value !== '') {
                localHeaders[header.name] = header.value;
            }
        });

        changeCellProp(props['headers'], JSON.stringify(localHeaders));
    }

</script>

<div class="flex flex-col gap-5 w-full">
    <Heading tag="h2" customSize="text-2xl font-extrabold ">Настройки объекта: Внешний запрос</Heading>

    <div>
        <Label class="mb-2">Название</Label>
        <Input type="text" placeholder="Введите название" bind:value={label} on:input={() => changeCellProp(props['label'], label)}/>
    </div>
    <div>
        <Label class="mb-2">Описание</Label>
        <Input type="text" placeholder="Введите описание" bind:value={description} on:input={() => changeCellProp(props['description'], description)}/>
    </div>
    <div>
        <Label>
            Метод запроса
            <Select class="mt-2" items={methods} bind:value={method} on:change={() => changeCellProp(props['method'], method) } required />
        </Label>
    </div>
    <div>
        <Label class="mb-2">URL отправки</Label>
        <Input color={isHasErrorOnUrl ? 'red' : 'base'} type="url" placeholder="Введите URL" bind:value={url} on:input={() => changeCellProp(props['url'], url)}/>
    </div>
    <div>
        <Label class="mb-2">Тело запроса</Label>
        <Textarea rows="4" placeholder="JSON" value={JSON.stringify(requestBody)} on:change={(event) => changeCellProp(props['requestBody'], event.target.value)}/>
    </div>
    <div class="flex flex-col gap-2 pb-4">
        <Label class="mb-2">Заголовки</Label>
        {#each selfHeaders as {name, value}, index}
            <div class="flex flex-col gap-2">
                <Input
                    type="text"
                    placeholder="Название заголовка"
                    value={name}
                    on:input={(e) => handleHeaderInput(index, 'name', e)}
                />
                <Input
                    type="text"
                    placeholder="Значение заголовка"
                    value={value}
                    on:input={(e) => handleHeaderInput(index, 'value', e)}
                />

                {#if index !== 0 || selfHeaders.length > 1}
                    <Button on:click={() => removeHeader(index)} color="blue">Удалить заголовок</Button>
                {/if}
            </div>
        {/each}
    </div>
</div>