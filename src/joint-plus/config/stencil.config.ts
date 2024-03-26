import { CONFIRMATION_ICON, ENTITY_ICON, MESSAGE_ICON, USER_INPUT_ICON } from "../../theme";

export const stencilConfig = {
    shapes: [
        {
            name: "FlowchartStart",
            attrs: {
                type: "start",
            },
        },
        {
            name: "FlowchartFinish",
            attrs: {
                type: "finish",
            },
        },
        {
            name: "ExternalRequest",
            attrs: {
                url: {
                    text: "",
                },
                headers: {
                    text: "{}",
                },
                method: {
                    text: "GET",
                },
                requestBody: {
                    text: "{}",
                },
                type: "external_request",
                label: { text: "Внешний запрос" },
                icon: { xlinkHref: USER_INPUT_ICON },
            },
        },
        {
            name: "Classify",
            attrs: {
                type: "classify",
                context: {
                    text: "",
                },
                classes: {
                    text: "[]",
                },
                label: { text: "Классифицировать" },
                icon: { xlinkHref: ENTITY_ICON },
            },
        },
        {
            name: "Message",
            attrs: {
                type: "listen",
                label: { text: "Слушать" },
                icon: { xlinkHref: MESSAGE_ICON },
            },
        },
        {
            name: "Message",
            attrs: {
                type: "respond",
                label: { text: "Ответить" },
                icon: { xlinkHref: CONFIRMATION_ICON },
                response: {
                    text: "",
                },
            },
        },
    ],
};
