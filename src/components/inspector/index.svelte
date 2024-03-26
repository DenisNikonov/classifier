<script lang="ts">
    import ClassifyInspector from './classify-inspector.svelte';
    import ExternalRequestInspector from './external-request-inspector.svelte';
    import ResponseInspector from './response-inspector.svelte';

    import { Subscription } from 'rxjs';
    import { dia } from '@joint/plus';
    import { SharedEvents } from '../../joint-plus/controller';
    import { ShapeTypesEnum } from '../../joint-plus/shapes/app.shapes';
    import { onDestroy, onMount } from 'svelte';
    import { eventBusService } from '../../services/event-bus.service';

    export let schemaId: string | null;

    let curCell: dia.Cell | null = null;
    let subscriptions = new Subscription();
    let shapeTypesEnum = ShapeTypesEnum;

    onMount((): void =>{
        subscriptions.add(
            eventBusService.subscribe(SharedEvents.SELECTION_CHANGED, (selection: dia.Cell[]) => setCell(selection))
        );
    });

    onDestroy((): void => {
        subscriptions.unsubscribe();
    })

    const setCell = (selection: dia.Cell[]): void => {
        const [cell = null] = selection;
        curCell = cell;

    }
</script>

<div class="inspector-container" class:disabled-container={!curCell || curCell?.get('type') === shapeTypesEnum.FLOWCHART_START || curCell?.get('type') === shapeTypesEnum.FLOWCHART_END || (curCell.get('type') === ShapeTypesEnum.MESSAGE && curCell.prop(['attrs', 'type', 'text']) !== 'respond')}>
    {#if curCell}
            {#if curCell.get('type') === ShapeTypesEnum.FLOWCHART_START || curCell.get('type') === ShapeTypesEnum.FLOWCHART_END || (curCell.get('type') === ShapeTypesEnum.MESSAGE && curCell.prop(['attrs', 'type', 'text']) !== 'respond') }
                <div style="display: flex; flex:1; flex-direction: column; align-items: center; justify-content: center;">
                    <span style="color: #747474">Объект не имеет конфигурации</span>
                </div>
            {:else if curCell.get('type') === shapeTypesEnum.CLASSIFY}
                <ClassifyInspector cell={curCell} />
            {:else if curCell.get('type') === shapeTypesEnum.EXTERNAL_REQUEST}
                <ExternalRequestInspector cell={curCell} />
            {:else if curCell.get('type') === shapeTypesEnum.MESSAGE && curCell.prop(['attrs', 'type', 'text']) === 'respond' }
                <ResponseInspector cell={curCell} />
            {/if}
    {:else}
        <div style="display: flex; flex:1; flex-direction: column; align-items: center; color: #747474">
            {#if schemaId}
                <span style="text-align: center;">Идентификатор вашей схемы:<br/> <strong class="text-[black]">{schemaId}</strong></span>
            {/if}
            <span style="display: flex; justify-content: center; flex: 1; align-items: center;">Выберите объект для редактирования</span>
        </div>
    {/if}
</div>

<style lang="scss">
    @import "src/assets";

    .wrap {
        font-size: 12px;
    }

    .inspector-container {
        display: flex;
        top: 0;
        box-sizing: border-box;
        right: 0;
        width: 348px;
        padding: 16px;
        overflow: auto;
        border-left: 1px solid #D4D4D4;
        background: #FCFCFC;
    }

    h1 {
        text-align: left;
        font-family: realist, sans-serif;
        font-size: 16px;
        line-height: 19px;
        margin: 0 0 16px 0;
        letter-spacing: 0;
        color: #191919;
        opacity: 1;
    }

    label {
        text-align: left;
        font-family: realist, sans-serif;
        font-size: 13px;
        line-height: 16px;
        letter-spacing: 0;
        color: #3A3A3A;
    }

    input {
        box-sizing: border-box;
        width: 100%;
        padding: 8px;
        text-overflow: ellipsis;
        outline: none;
        height: 35px;
        background: #FFFFFF;
        border: 1px solid #D4D4D4;
        opacity: 1;
        text-align: left;
        font-family: realist, sans-serif;
        letter-spacing: 0;
        color: #191919;
        margin-bottom: 16px;
        margin-top: 3px;

        &::placeholder {
            color: #6C6C6C;
        }
    }

    .icon-input-logo {
        position: absolute;
        margin-top: 12px;
        margin-left: 8px;
        display: block;

        &:after {
            content: '\E85D';
            @include icon;
            color: #191919;
            font-weight: 700;
            font-size: 18px;
        }
    }

    .icon-input {
        padding-left: 31px;
    }

    .disabled-container {
        label, input {
            opacity: 0.6;
        }
    }

    .ports {
        margin-top: 10px;

        .out-ports-bar {
            width: 100%;
            height: 47px;
            margin: 0 -16px;
            padding: 0 16px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: #F5F5F5;
            border-bottom: 1px solid #D4D4D4;
            border-top: 1px solid #D4D4D4;
            box-sizing: content-box;

            span {
                text-align: left;
                font-family: realist, sans-serif;
                font-size: 14px;
                line-height: 17px;
                letter-spacing: 0;
                color: #3A3A3A;
            }
        }

        .add-port {
            height: 23px;
            width: 23px;
            border-radius: 50%;
            background: #0057FF;
            display: flex;
            justify-content: center;
            align-items: center;
            border: none;
            cursor: pointer;
            margin-right: 8px;
            outline: none;

            &:before {
                content: '\E145';
                @include icon;
                font-size: 18px;
                color: #FFFFFF;
                font-weight: 700;
            }

            &:hover {
                background: #0057FFBF;
            }

            &[disabled] {
                background: #BEBEBE;
                cursor: not-allowed;
            }
        }

        .add-ports {
            display: flex;
            width: 100%;
            justify-content: space-between;
            margin-top: 5px;
        }

        .port {
            margin-top: 8px;
            position: relative;
            margin-bottom: 16px;

            input {
                margin: auto;
                border-radius: 30px;
            }

            .remove-port {
                cursor: pointer;
                width: 23px;
                height: 23px;
                background: #727272;
                border-radius: 50%;
                position: absolute;
                top: 0;
                bottom: 0;
                right: 8px;
                margin: auto;
                display: flex;
                align-items: center;
                justify-content: center;
                border: none;
                outline: none;

                &:before {
                    content: "\E5CD";
                    @include icon;
                    font-size: 14px;
                    color: #FFFFFF;
                    font-weight: 800;
                }
            }

            &:last-of-type {
                margin-bottom: 0;
            }
        }
    }
</style>
