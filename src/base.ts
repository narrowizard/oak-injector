import { FormDataFile } from "https://deno.land/x/oak@v6.2.0/multipart.ts";

export interface IMap<V> {
  [index: string]: V;
}

export const EmptyFunction = () => {};

export type ValueType =
  | string
  | IMap<string | FormDataFile>
  | FormDataFile
  | undefined
  | null;
