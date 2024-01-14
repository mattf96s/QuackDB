import { useRouteError } from "react-router-dom";

const createErrorDetails = (error: unknown) => {
    if (error instanceof Error) {
        return {
            name: error.name,
            message: error.message,
            stack: error.stack,
        }
    }
    return {
        name: 'Error',
        message: String(error),
        stack: '',
    }
}

export default function ErrorPage() {
    const error = useRouteError();
    console.error(error);

    const { name, message, stack } = createErrorDetails(error);

    return (
        <div id="error-page">
            <h1>{name}</h1>
            <p>{message}</p>
            <pre>{stack}</pre>
        </div>
    );
}