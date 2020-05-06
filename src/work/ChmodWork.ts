import fs from 'fs';
import path from 'path';
import { DictatableConfigAction } from '../types';
import { Work } from './WorkCreator';
import { FileOperations } from '../common/FileOperations';
import { Logger, LEVEL } from '../common/Logger';

export class ChmodWork implements Work {
  private targetFile: string;

  constructor(
    fileOperations: FileOperations,
    private action: DictatableConfigAction
  ) {
    this.targetFile = fileOperations.fileInTarget(action.target);
  }

  isApplied(): boolean {
    if (!fs.existsSync(this.targetFile)) {
      //Not failing here, as the file may be created during an action.
      return false;
    }
    const currentStat = fs.statSync(this.targetFile);
    const currentMode = +(currentStat.mode & 0o777).toString(8);
    const givenMode = +this.action.chmod!;
    Logger.log(
      LEVEL.VERBOSE,
      `current mode on ${this.targetFile} is ${currentMode} got ${givenMode}`
    );
    return currentMode == givenMode;
  }

  apply(): void {
    if (!fs.existsSync(this.targetFile)) {
      throw Error(
        `Cannot apply chmod to none existing file ${this.targetFile}`
      );
    }
    fs.chmodSync(this.targetFile, this.action.chmod!);
  }

  info(): string {
    return `${path.basename(this.targetFile)} have chmod ${this.action.chmod}`;
  }
}
