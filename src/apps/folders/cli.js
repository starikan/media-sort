import arg from 'arg';
import prompts from 'prompts';
import { runTask } from './main';

function parseArguments(rawArgs) {
  const args = arg(
    {
      '--root': String,
      '--export': String,
      '--img_ext': [String],
      '--video_ext': [String],
      '--delete_source': Boolean,
      '-r': '--root',
      '-e': '--export',
      '-i': '--img_ext',
      '-v': '--video_ext',
      '-d': '--delete_source',
      '--ROOT': '--root',
      '--EXPORT_FOLDER': '--export',
      '--ALLOW_IMAGES': '--img_ext',
      '--ALLOW_VIDEOS': '--video_ext',
      '--DELETE_SOURCE': '--delete_source',
    },
    { argv: rawArgs.slice(2), permissive: true },
  );
  return {
    ROOT: args['--root'] || process.cwd(),
    EXPORT_FOLDER: args['--export'] || 'export',
    ALLOW_IMAGES: args['--img_ext'] || 'jpg, jpeg',
    ALLOW_VIDEOS: args['--video_ext'] || 'mp4, mts, 3gp',
    DELETE_SOURCE: args['--delete_source'] || false,
  };
}

async function promptForOptions(options) {
  const questions = [
    {
      type: 'text',
      name: 'ROOT',
      message: 'Root folder with files to sort',
      initial: options.ROOT,
    },
    {
      type: 'text',
      name: 'EXPORT_FOLDER',
      message: 'Name of export folder',
      initial: options.EXPORT_FOLDER,
    },
    {
      type: 'list',
      name: 'ALLOW_IMAGES',
      message: 'Images extensions (Type comma/space separated)',
      initial: options.ALLOW_IMAGES,
    },
    {
      type: 'list',
      name: 'ALLOW_VIDEOS',
      message: 'Videos extensions (Type comma/space separated)',
      initial: options.ALLOW_VIDEOS,
    },
    {
      type: 'confirm',
      name: 'DELETE_SOURCE',
      message: 'Move files to export folders?',
      initial: options.DELETE_SOURCE,
    },
  ];
  const answers = await prompts(questions);
  // console.log(answers);
  return { ...options, ...answers };
}

export async function cli(args) {
  const optionsArgs = parseArguments(args);
  const options = await promptForOptions(optionsArgs);
  await runTask(options);
}
