// // https://github.com/SvelteStack/svelte-query/blob/main/src/queryCore/core/subscribable.ts
// type Listener = () => void;

// export class Subscribable<
//   TListener extends (...args: unknown[]) => void = Listener,
// > {
//   protected listeners: TListener[];

//   constructor() {
//     this.listeners = [];
//   }

//   subscribe(listener?: TListener): () => void {
//     const callback = listener || (() => undefined);

//     this.listeners.push(callback as TListener);

//     this.onSubscribe();

//     return () => {
//       this.listeners = this.listeners.filter((x) => x !== callback);
//       this.onUnsubscribe();
//     };
//   }

//   hasListeners(): boolean {
//     return this.listeners.length > 0;
//   }

//   protected onSubscribe(): void {
//     // Do nothing
//   }

//   protected onUnsubscribe(): void {
//     // Do nothing
//   }
// }
