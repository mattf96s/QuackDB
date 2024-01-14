// https://github.com/Kanaries/graphic-walker/blob/main/packages/graphic-walker/src/services.ts
// see https://github.com/Kanaries/Rath/blob/master/packages/rath-client/src/services/r-insight.ts
// export const applyFilter = async (data: IRow[], filters: readonly IFilterFiledSimple[]): Promise<IRow[]> => {
//     if (filters.length === 0) return data;
//     const worker = new FilterWorker();
//     try {
//         const res: IRow[] = await workerService(worker, {
//             dataSource: data,
//             filters: filters,
//         });

//         return res;
//     } catch (error) {
//         // @ts-ignore @see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error/cause
//         throw new Error('Uncaught error in FilterWorker', { cause: error });
//     } finally {
//         worker.terminate();
//     }
// };

interface SuccessResult<T> {
    success: true;
    data: T;
}

interface FailResult {
    success: false;
    message: string;
}

export type Result<T> = SuccessResult<T> | FailResult;

export function workerService<T, R>(worker: Worker, data: R): Promise<Result<T>> {
    return new Promise<Result<T>>((resolve, reject) => {
        worker.postMessage(data);
        worker.onmessage = (e: MessageEvent) => {
            resolve(e.data);
        };
        worker.onerror = (e: ErrorEvent) => {
            reject({
                success: false,
                message: e.error,
            });
        };
    });
}

export interface InferMetaServiceProps {
    dataSource: IRow[];
    fields: IMuteFieldBase[];
}
export async function inferMetaService(props: InferMetaServiceProps): Promise<IRawField[]> {
    let metas: IRawField[] = [];
    try {
        const worker = new InferMetaWorker();
        const result = await workerService<IRawField[], InferMetaServiceProps>(worker, props);
        if (result.success) {
            metas = result.data;
        } else {
            throw new Error('[meta infer worker]' + result.message);
        }
        worker.terminate();
    } catch (error) {
        console.error(error);
    }
    return metas;
}

export interface ComputeFieldMetaServiceProps {
    dataSource: IRow[];
    fields: IRawField[];
}

//https://github.com/Kanaries/Rath/blob/master/packages/rath-client/src/services/meta.ts
export async function computeFieldMetaService(props: ComputeFieldMetaServiceProps): Promise<IFieldMeta[]> {
    let metas: IFieldMeta[] = [];
    try {
        const worker = new fieldMetaWorker();
        const result = await workerService<IFieldMeta[], ComputeFieldMetaServiceProps>(worker, props);
        if (result.success) {
            metas = result.data;
        } else {
            throw new Error('[fieldMeta worker]' + result.message);
        }
        worker.terminate();
    } catch (error) {
        console.error(error);
    }
    return metas;
}