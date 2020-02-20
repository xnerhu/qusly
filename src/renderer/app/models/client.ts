import { ipcRenderer } from 'electron';

import { ISite } from '~/interfaces';

export class Client {
  public config: ISite;

  protected created = false;

  protected get id() {
    return this.config.id;
  }

  protected async create() {
    if (!this.created) {
      await ipcRenderer.invoke('core-create', this.id);
      this.created = true;
    }
  }

  public async connect(config: ISite) {
    this.config = config;

    await this.create();
    await ipcRenderer.invoke('core-connect', this.config);
  }

  public readDir(path: string) {
    return ipcRenderer.invoke('core-read-dir', this.id, path);
  }

  public pwd() {
    return ipcRenderer.invoke('core-pwd', this.id);
  }
}
