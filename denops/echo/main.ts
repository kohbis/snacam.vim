import { Denops, helper, fn, ensureString } from './deps.ts';

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    echo: async (arg: unknown): Promise<unknown> => {
      ensureString(arg);
      return await Promise.resolve(arg);
    },
    echoRange: async (): void => {
      const [_bufnumS, lnumS, colS, _offS] = await fn.getpos(denops, "'<");
      const [_bufnumE, lnumE, colE, _offE] = await fn.getpos(denops, "'>");

      if (lnumS !== lnumE) {
        console.error('multiline not supported');
        return;
      }
      const str = (await fn.getline(denops, lnumS, lnumE))
        .join('')
        .substring(colS - 1, colE)
        .trim();
      return Promise.resolve(str);
    },
  };

  await helper.execute(
    denops,
    `
    command! -nargs=+ SnacamEcho echomsg denops#request('${denops.name}', 'echo', [<q-args>])
    command! -range SnacamEchoRange echomsg denops#request('${denops.name}', 'echoRange', '')
    `
  );
};
