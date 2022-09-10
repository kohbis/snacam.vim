import { Denops, helper, fn, ensureString } from './deps.ts';
import { RangePosition } from './types.ts';

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    echo: async (arg: unknown): Promise<unknown> => {
      ensureString(arg);
      return await Promise.resolve(arg);
    },
    echoRange: async (): Promise<string | void> => {
      return await getStr(denops)
        .then((str) => str)
        .catch((err) => console.error(err));
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

const getPositions = async (
  denops: Denops
): Promise<[start: RangePosition, end: RangePosition]> => {
  const [bufnumS, lnumS, colS, offS] = await fn.getpos(denops, "'<");
  const [bufnumE, lnumE, colE, offE] = await fn.getpos(denops, "'>");

  const start: RangePosition = {
    bufnum: bufnumS,
    lnum: lnumS,
    col: colS,
    off: offS,
  };
  const end: RangePosition = {
    bufnum: bufnumE,
    lnum: lnumE,
    col: colE,
    off: offE,
  };

  return [start, end];
};

const getStr = async (denops: Denops): Promise<string> => {
  const [start, end] = await getPositions(denops);

  if (start.lnum !== end.lnum) {
    return Promise.reject('multiline not supported');
  }
  const str = (await fn.getline(denops, start.lnum, end.lnum))
    .join('')
    .substring(start.col - 1, end.col)
    .trim();

  return await Promise.resolve(str);
};
