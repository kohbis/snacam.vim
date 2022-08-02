import { Denops } from "https://deno.land/x/denops_std@v2.0.0/mod.ts";
import { execute } from "https://deno.land/x/denops_std@v2.0.0/helper/mod.ts";
import { ensureString } from "https://deno.land/x/unknownutil@v2.0.0/mod.ts";

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    echo: async (arg: unknown): Promise<unknown> => {
      ensureString(arg);
      return await Promise.resolve(arg);
    },
  };

  await execute(
    denops,
    `command! -nargs=+ SnacamEcho echomsg denops#request('${denops.name}', 'echo', [<q-args>])`
  );
};
