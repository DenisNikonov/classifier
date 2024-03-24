<script lang="ts">
    import JointPlusService from "../services/joint-plus.service";
    import { Label, Input, Button, Modal, Listgroup, Tabs, TabItem } from "flowbite-svelte";
    // @ts-ignore
    import { DownloadSolid } from 'flowbite-svelte-icons';

    import { Subscription } from "rxjs";
    import { onDestroy, onMount } from "svelte";
    import { SharedEvents } from "../joint-plus/controller";
    import { STENCIL_WIDTH, failure, success } from "../theme";
    import { importGraphFromJSON, loadStencilShapes, zoomToFit } from "../joint-plus/actions";
    import { eventBusService } from "../services/event-bus.service";
    import Inspector from './inspector/index.svelte';

    import exampleGraphJSON from '../joint-plus/config/graph.json';
    import { transformJson } from "../utils/transformJson";
    import { generateOriginalJson } from "../utils/transformFromJson";


    let inputSchemaId: string | null;
    let schemaId: string | null = '';
    let joint: JointPlusService;
    let stencilOpened = true;
    let fileJSON = {};

    let paper: Element;
    let stencil: Element;
    let toolbar: Element;
    let el: Element;

    let createNewSchemaModal = false;

    let schemaName: string = '';

    let schemas: any[] = [];

    let subscriptions = new Subscription();


    onMount(() => {
        subscriptions.add(
            eventBusService.subscribe(SharedEvents.GRAPH_CHANGED, (json: Object) => onJointGraphChange(json))
        );

        init();

        const storedSchemas = JSON.parse(localStorage.getItem('schemas') || '[]');
        schemas = storedSchemas;

        if (schemas.length > 0) {
            schemaId = schemas[schemas.length - 1].id;
            openFile(JSON.parse(schemas[schemas.length - 1].json, function (key, value) {
                if (key === 'headers' || key === 'requestBody' || key === 'classes') {
                    return {
                        text: value.text
                    };
                }

                return value;
            }));
        } else {
            createNewSchemaModal = true;
        }

    });

    const saveSchemaLocally = (): void => {
        schemas = schemas.map((schema) =>
        schema.id === schemaId
            ? { ...schema, json: JSON.stringify(fileJSON) }
            : schema
        );
        localStorage.setItem('schemas', JSON.stringify(schemas));
    }


    const init = () => {
        if (joint) {
            joint.destroy();
        }


        joint = new JointPlusService(
            el,
            paper,
            stencil,
            toolbar,
            eventBusService
        );


        setStencilContainerSize();
        onStart();
    }

    onDestroy((): void => {
        subscriptions.unsubscribe();
        joint.destroy();
    });


    const openFile = (json: Object): void => {
        fileJSON = json;
        importGraphFromJSON(joint, json);
        zoomToFit(joint);
    };


    const toggleStencil = (): void  => {
        stencilOpened = !stencilOpened;
        onStencilToggle();
    }

    const onStart = (): void => {
        loadStencilShapes(joint);
        openFile(exampleGraphJSON);
    };

    const onJointGraphChange = (json: Object): void => {
        fileJSON = json;
        saveSchemaLocally();
    }

    const setStencilContainerSize = (): void => {
        (stencil as any).style.width = `${STENCIL_WIDTH}px`;

        onStencilToggle();
    }

    const onStencilToggle = (): void => {
        const { scroller, stencil } = joint;

        if (stencilOpened) {
            stencil.unfreeze();
            scroller.el.scrollLeft += STENCIL_WIDTH;
        } else {
            stencil.freeze();
            scroller.el.scrollLeft -= STENCIL_WIDTH;
        }
    }

    const createNewSchema = async (): Promise<boolean> => {
        try {
            const result = await fetch('https://llm-study.ru/api/schema', {
                method: 'POST',
                body: "{}",
                headers: { 'Content-Type': 'application/json' },
            });

            if (result.ok) {
                const { success, message, data } = await result.json();
                if (!success) {
                    failure(message);
                    return false;
                }

                schemaId = data.id;

                const newSchema = {
                    id: schemaId,
                    name: schemaName,
                    json: JSON.stringify({})
                };

                schemas.push(newSchema);

                localStorage.setItem('schemas', JSON.stringify(schemas));

                init();
                return true;

            } else {
                const response = await result.json();

                if (!response.success) {
                    failure(response.message);
                }
            }

        } catch {
            failure("Ошибка сервера");
            return false;
        }
    }



    const handleSubmitNewSchema = async (event: Event): Promise<void> => {
        event.preventDefault();

        if (schemaName === '') {
            failure('Название схемы не может быть пустым');

            return;
        }

        const result = await createNewSchema();

        if(result) {
            createNewSchemaModal = false;
            schemaName = ''
        }

    }

    const saveGraph = async () => {
        try {
            const json = transformJson(fileJSON);

            const response = await fetch(`https://llm-study.ru/api/schema`, {
                method: 'PUT',
                body: JSON.stringify({
                    id: schemaId,
                    description: json
                }),
                headers: { 'Content-Type': 'application/json' },
            })

            if (response.ok) {
                const result = await response.json();

                if (!result.success) {
                    failure(result.message);
                    return;
                }

                success('Схема успешно сохранена')
            } else {
                const result = await response.json();

                if (!result.success) {
                    failure(result.message);
                    return;
                }
            }

        } catch (e) {
            failure('Не удалось сохранить граф');
        }
    }

    const loadSchema = async (schema: any) => {
        schemaId = schema.detail.id;
        openFile(JSON.parse(schema.detail.json));

        createNewSchemaModal = false;
    }


    const loadSchemaById = async () => {
        try {
            const response = await fetch(`https://llm-study.ru/api/schema/${inputSchemaId}`, {
                headers: { 'Content-Type': 'application/json' },
            })


            if (response.ok) {
                const result = await response.json();

                if (!result.success) {
                    failure(result.message);
                    return;
                }

                const graphJson = generateOriginalJson(result.data.actualVariant.description);
                openFile(graphJson);
                schemaId = inputSchemaId;
                createNewSchemaModal = false;

                const newSchema = {
                    id: schemaId,
                    name: schemaId,
                    json: JSON.stringify(graphJson)
                };

                schemas.push(newSchema);

                localStorage.setItem('schemas', JSON.stringify(schemas));
                success('Схема успешно загружена');
            } else {
                const result = await response.json();

                if (!result.success) {
                    failure(result.message);
                    return;
                }
            }
        } catch (e) {
            console.warn(e);
            failure('Не удалось загрузить схему');
        }
    }




</script>


<div class="joint-scope chatbot">
    <div bind:this={toolbar}></div>
    <div class="side-bar">
        <div class="toggle-bar">
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-interactive-supports-focus -->
            <div
                role="button"
                on:click={() => (createNewSchemaModal = true)}
                class="icon create-new-shema"
            ></div>
            <!-- svelte-ignore a11y-click-events-have-key-events -->
            <!-- svelte-ignore a11y-interactive-supports-focus -->
            <!-- <div
                role="button"
                on:click={toggleStencil}
                class="icon toggle-stencil"
            ></div> -->
        </div>
        <div bind:this={stencil} class="stencil-container" hidden={!stencilOpened}></div>
    </div>
    <div class="main-container">
        <div bind:this={paper} class="paper-container"></div>
    </div>
    <Inspector schemaId={schemaId} />


    <Modal title="Создание схемы" outsideclose={!!schemaId} dismissable={!!schemaId}  bind:open={createNewSchemaModal}  autoclose={false} class="min-w-full">
        <Tabs>
            <TabItem open title="Создание схемы">
                <form on:submit={handleSubmitNewSchema}>
                    <div class="grid gap-4 mb-4 sm:grid-cols-1">
                        <div>
                            <Label for="name" class="mb-2">Название</Label>
                            <Input type="text" bind:value={schemaName} id="name" placeholder="Название схемы"  />
                        </div>
                        <Button type="submit" class="w-52" color="blue">
                            <svg class="mr-1 -ml-1 w-6 h-6" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z" clip-rule="evenodd" /></svg>
                            Создать схему
                        </Button>
                    </div>
                </form>
            </TabItem>
            {#if schemas.length > 0}
            <TabItem title="Выбор схемы">
                <div class="flex flex-col justify-center items-center w-full">
                    <Label class="mb-2">Выберете схему из списка</Label>
                    <Listgroup active items={schemas} let:item class="w-full" on:click={loadSchema}>
                        { item.name }
                    </Listgroup>
                </div>
            </TabItem>
            {/if}
            <TabItem title="Загрузка схемы по id">
                <div class="grid gap-4 mb-4 sm:grid-cols-1">
                    <div>
                        <Label class="mb-2">Название</Label>
                        <Input type="text" bind:value={inputSchemaId} placeholder="Идентификатор схемы"  />
                    </div>
                    <Button on:click={loadSchemaById} class="w-52" color="blue">
                        Загрузить схему
                    </Button>
                </div>
            </TabItem>
        </Tabs>
    </Modal>

    <Button pill={true} class="!p-2 fixed bottom-5 right-[23rem] bg-[#0057FF] w-[48px] h-[48px] z-10 " size="xl" on:click={saveGraph}>
        <DownloadSolid class="w-6 h-6" />
    </Button>
</div>

<style lang="scss">
    @import "../assets";

    .chatbot {
        position: relative;
        width: 100%;
        height: 100%;
        box-sizing: border-box;
        margin: 0;
        padding: 0;
        font-family: realist, sans-serif;
        display: flex;
        min-width: 900px;

        .main-container {
            display: flex;
            flex-flow: column;
            height: 100%;
            overflow: hidden;
            flex: 1;

            /*  Diagram  */
            .paper-container {
                position: relative;
                overflow: hidden;
                box-sizing: border-box;
                z-index: 1;
                flex: 1;
                background: #F8F9FA;
            }
        }

        /*  Sidebar  */
        .side-bar {
            height: 100%;
            max-width: 300px;
            z-index: 2;
            background: none;
            display: flex;

            .toggle-bar {
                height: 100%;
                width: 50px;
                background: #222222;
                z-index: 2;
                display: flex;
                flex-flow: column;
                align-items: center;
                padding: 13px;

                .icon {
                    margin-bottom: 26px;
                    font-size: 24px;
                    color: #FFFFFF;
                    cursor: pointer;

                    &:before {
                        @include icon;
                    }
                }

                .toggle-stencil {
                    &:before {
                        content: '\E39D'
                    }
                }

                .create-new-shema {
                    &:before {
                        content: '\E146'
                    }
                }

                .load-shema {
                    &:before {
                        content: '\E85D'
                    }
                }

                .disabled-icon {
                    opacity: 0.35;
                }
            }

            .stencil-container {
                height: 100%;
                position: relative;
            }
        }
    }
</style>
