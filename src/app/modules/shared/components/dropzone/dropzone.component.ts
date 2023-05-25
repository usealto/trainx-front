import {
  Component,
  ContentChildren,
  ElementRef,
  EventEmitter,
  HostBinding,
  HostListener,
  Input,
  Output,
  QueryList,
  Self,
  ViewChild,
} from '@angular/core';
import { coerceBooleanProperty, coerceNumberProperty } from '../../helpers/coerce-property';
import { DropzoneService, RejectedFile } from './dropzone.service';

export interface DropzoneChangeEvent {
  source: DropzoneComponent;
  addedFiles: File[];
  rejectedFiles: RejectedFile[];
}

@Component({
  selector: 'alto-dropzone',
  templateUrl: './dropzone.component.html',
  styleUrls: ['./dropzone.component.scss'],
  providers: [DropzoneService],
})
export class DropzoneComponent {
  constructor(@Self() private service: DropzoneService) {}

  /** A template reference to the native file input element. */
  @ViewChild('fileInput', { static: true }) _fileInput: ElementRef | undefined;

  /** Emitted when any files were added or rejected. */
  // eslint-disable-next-line @angular-eslint/no-output-native
  @Output() readonly change = new EventEmitter<DropzoneChangeEvent>();

  /** Set the accepted file types. Defaults to '*'. */
  @Input() accept = '*';

  /** Disable any user interaction with the component. */
  @Input()
  @HostBinding('class.dz-disabled')
  get disabled(): boolean {
    return this._disabled;
  }
  set disabled(value: boolean) {
    this._disabled = coerceBooleanProperty(value);

    if (this._isHovered) {
      this._isHovered = false;
    }
  }
  private _disabled = false;

  /** Allow the selection of multiple files. */
  @Input()
  get multiple(): boolean {
    return this._multiple;
  }
  set multiple(value: boolean) {
    this._multiple = coerceBooleanProperty(value);
  }
  private _multiple = true;

  /** Set the maximum size a single file may have. */
  @Input()
  get maxFileSize(): number | undefined {
    return this._maxFileSize;
  }
  set maxFileSize(value: number | undefined) {
    this._maxFileSize = coerceNumberProperty(value);
  }
  private _maxFileSize: number | undefined = undefined;

  /** Allow the dropzone container to expand vertically. */
  @Input()
  @HostBinding('class.expandable')
  get expandable(): boolean {
    return this._expandable;
  }
  set expandable(value: boolean) {
    this._expandable = coerceBooleanProperty(value);
  }
  private _expandable = false;

  /** Open the file selector on click. */
  @Input()
  @HostBinding('class.unclickable')
  get disableClick(): boolean {
    return this._disableClick;
  }
  set disableClick(value: boolean) {
    this._disableClick = coerceBooleanProperty(value);
  }
  private _disableClick = false;

  /** Allow dropping directories. */
  @Input()
  get processDirectoryDrop(): boolean {
    return this._processDirectoryDrop;
  }
  set processDirectoryDrop(value: boolean) {
    this._processDirectoryDrop = coerceBooleanProperty(value);
  }
  private _processDirectoryDrop = false;

  /** Expose the id, aria-label, aria-labelledby and aria-describedby of the native file input for proper accessibility. */
  @Input() id: string | undefined;

  @HostBinding('class.dz-hovered')
  _isHovered = false;

  /** Show the native OS file explorer to select files. */
  @HostListener('click')
  _onClick() {
    if (!this.disableClick) {
      this.showFileSelector();
    }
  }

  @HostListener('dragover', ['$event'])
  _onDragOver(event: DragEvent) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this._isHovered = true;
  }

  @HostListener('dragleave')
  _onDragLeave() {
    this._isHovered = false;
  }

  @HostListener('drop', ['$event'])
  _onDrop(event: any) {
    if (this.disabled) {
      return;
    }

    this.preventDefault(event);
    this._isHovered = false;

    // if processDirectoryDrop is not enabled or webkitGetAsEntry is not supported we handle the drop as usual
    if (event?.dataTransfer) {
      if (!this.processDirectoryDrop || !DataTransferItem.prototype.webkitGetAsEntry) {
        this.handleFileDrop(event.dataTransfer.files);

        // if processDirectoryDrop is enabled and webkitGetAsEntry is supported we can extract files from a dropped directory
      } else {
        const droppedItems: DataTransferItem[] = event.dataTransfer.items;

        if (droppedItems.length > 0) {
          const droppedFiles: File[] = [];
          const droppedDirectories = [];

          // seperate dropped files from dropped directories for easier handling
          for (let i = 0; i < droppedItems.length; i++) {
            const entry = droppedItems[i].webkitGetAsEntry();
            if (entry?.isFile) {
              droppedFiles.push(event.dataTransfer.files[i]);
            } else if (entry?.isDirectory) {
              droppedDirectories.push(entry);
            }
          }

          // create a DataTransfer
          const droppedFilesList = new DataTransfer();
          droppedFiles.forEach((droppedFile) => {
            droppedFilesList.items.add(droppedFile);
          });

          // if no directory is dropped we are done and can call handleFileDrop
          if (!droppedDirectories.length && droppedFilesList.items.length) {
            this.handleFileDrop(droppedFilesList.files);
          }
        }
      }
    }
  }

  private extractFilesFromDirectory(directory: FileSystemDirectoryEntry | null) {
    async function getFileFromFileEntry(fileEntry: {
      file: (arg0: (value: unknown) => void, arg1: (reason?: any) => void) => void;
    }) {
      try {
        return await new Promise((resolve, reject) => fileEntry.file(resolve, reject));
      } catch (err) {
        console.log('Error converting a fileEntry to a File: ', err);
      }
    }

    return new Promise((resolve, reject) => {
      const files: File[] = [];

      if (directory) {
        const dirReader = directory.createReader();

        // we need this to be a recursion because of this issue: https://bugs.chromium.org/p/chromium/issues/detail?id=514087
        const readEntries = () => {
          dirReader.readEntries(async (dirItems: any[]) => {
            if (!dirItems.length) {
              resolve(files);
            } else {
              const fileEntries = dirItems.filter((dirItem: { isFile: any }) => dirItem.isFile);

              for (const fileEntry of fileEntries) {
                const file: any = await getFileFromFileEntry(fileEntry);
                files.push(file);
              }

              readEntries();
            }
          });
        };
        readEntries();
      }
    });
  }

  showFileSelector() {
    if (!this.disabled && this._fileInput) {
      (this._fileInput.nativeElement as HTMLInputElement).click();
    }
  }

  _onFilesSelected(event: Event) {
    const files: FileList = (event?.target as HTMLInputElement)?.files as FileList;
    this.handleFileDrop(files);

    // Reset the native file input element to allow selecting the same file again
    if (this._fileInput) {
      this._fileInput.nativeElement.value = '';
    }
    this.preventDefault(event);
  }

  private handleFileDrop(files: FileList) {
    const result = this.service.parseFileList(files, this.accept, this.maxFileSize, this.multiple);

    this.change.next({
      addedFiles: result.addedFiles,
      rejectedFiles: result.rejectedFiles,
      source: this,
    });
  }

  private preventDefault(event: Event) {
    event.preventDefault();
    event.stopPropagation();
  }
}
