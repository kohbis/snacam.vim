import { Denops, helper, fn, ensureString } from './deps.ts';
import { RangePosition } from './types.ts';

const convertModes = ['snake', 'camel', 'pascal'];

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    echoRange: async (): Promise<string | void> => {
      return await getStr(denops, await getPositions(denops))
        .then((str) => str)
        .catch((err) => console.error(err));
    },
    convert: async (mode: unknown): Promise<void> => {
      ensureString(mode);
      if (!isConvertMode(mode as string)) {
        return console.warn(`Unsupport convert mode: ${mode}`);
      }

      const [start, end] = await getPositions(denops);
      return await getStr(denops, await getPositions(denops))
        .then(async (str) => {
          const words = (str.match(/[a-zA-Z][a-z]*/g) || [])
            .filter((word) => word)
            .map((word) => word.toLowerCase());

          if (words.length === 0) {
            return;
          }

          let r = '';
          switch (mode) {
            case 'snake':
              r = words.join('_');
              break;
            case 'camel':
              r = capitalizeWords(words).join('');
              r = r.charAt(0).toLowerCase() + r.slice(1);
              break;
            case 'pascal':
              r = capitalizeWords(words).join('');
              break;
          }

          const line = (await fn.getline(denops, start.lnum, end.lnum)).join('');
          const pre = line.substring(0, start.col - 1);
          const post = line.substring(end.col);
          await fn.setline(denops, '.', pre + r + post);
        })
        .catch((err) => console.error(err));
    },
  };

  await helper.execute(
    denops,
    `
    command! -range SnacamEchoRange echomsg denops#request('${denops.name}', 'echoRange', '')
    command! -range SnacamSnake call denops#request('${denops.name}', 'convert', ['snake'])
    command! -range SnacamCamel call denops#request('${denops.name}', 'convert', ['camel'])
    command! -range SnacamPascal call denops#request('${denops.name}', 'convert', ['pascal'])
    `
  );
};

const isConvertMode = (mode: string): boolean => {
  return convertModes.includes(mode);
};

const capitalizeWords = (words: string[]): string[] => {
  return words.map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase());
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

const getStr = async (denops: Denops, [start, end]: Array<RangePosition>): Promise<string> => {
  if (start.lnum !== end.lnum) {
    return Promise.reject('Multiline not supported');
  }
  const str = (await fn.getline(denops, start.lnum, end.lnum))
    .join('')
    .substring(start.col - 1, end.col)
    .trim();

  return await Promise.resolve(str);
};
