import * as React from 'react';
import { observer } from 'mobx-react';

import store from '~/renderer/store';
import { File as IFile } from '~/renderer/models';
import { resizeTextarea } from '~/renderer/utils';
import { StyledFile, Icon, Label, Input } from './styles';

interface Props {
  data?: IFile;
}

@observer
export default class File extends React.PureComponent<Props> {
  public ref = React.createRef<HTMLDivElement>();

  public inputRef = React.createRef<HTMLTextAreaElement>();

  componentDidMount() {
    store.pages.current.filesComponents.push(this);
  }

  componentWillUnmount() {
    const page = store.pages.current;
    if (page) {
      const index = page.filesComponents.indexOf(this);
      if (index !== -1) {
        page.filesComponents = page.filesComponents.slice(index, 1);
      }
    }
  }

  private onClick = (e: React.MouseEvent) => {
    const { data } = this.props;

    if (e.ctrlKey) {
      data.selected = true;
    } else if (e.shiftKey) {
      this.selectGroup();
    } else {
      store.pages.current.focusFile(data);
    }
  };

  private onDoubleClick = () => {
    const { type } = this.props.data;

    if (type === 'directory') {
      store.pages.current.location.push(name);
    }
  };

  private onContextMenu = (e: React.MouseEvent) => {
    e.stopPropagation();
    const { data } = this.props;

    if (data.renaming) return;
    if (!data.selected) {
      store.pages.current.focusFile(data);
    }

    store.contextMenu.show('file', e);
  };

  private onInputKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.stopPropagation();
      e.preventDefault();
      this.rename();
    }

    resizeTextarea(e.target as HTMLTextAreaElement);
  };

  private onInputClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  private selectGroup = () => {
    const { data } = this.props;
    const page = store.pages.current;
    const fileIndex = page.files.indexOf(data);
    const focusedFileIndex = page.files.indexOf(page.focusedFile);

    const bigger = fileIndex >= focusedFileIndex;

    const start = bigger ? focusedFileIndex : fileIndex;
    const end = !bigger ? focusedFileIndex : fileIndex;

    for (let i = 0; i < page.files.length; i++) {
      page.files[i].selected = i >= start && i <= end;
    }
  };

  private rename = () => {
    const page = store.pages.current;
    const file = page.focusedFile;
    page.rename(file, this.inputRef.current.value);
  };

  render() {
    const { data } = this.props;
    const { name, selected, renaming } = data;
    const { icon, opacity } = store.favicons.get(data);

    return (
      <StyledFile
        ref={this.ref}
        onClick={this.onClick}
        onDoubleClick={this.onDoubleClick}
        selected={selected}
        onContextMenu={this.onContextMenu}
      >
        <Icon icon={icon} style={{ opacity }} />
        {!renaming && <Label>{name}</Label>}
        <Input
          ref={this.inputRef}
          onKeyDown={this.onInputKey}
          onMouseDown={this.onInputClick}
          onDoubleClick={this.onInputClick}
          onBlur={this.rename}
          visible={renaming}
        />
      </StyledFile>
    );
  }
}
