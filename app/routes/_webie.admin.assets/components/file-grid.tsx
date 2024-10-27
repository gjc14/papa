import { CloudUploadIcon, CupSoda } from 'lucide-react'
import { useState } from 'react'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '~/components/ui/dialog'
import { cn } from '~/lib/utils'
import { FileCard } from './file-card'
import { FileGridProps, FileMeta } from './type'

/**
 * FileGrid Component should be wrap in display: flex as it uses flex: 1 to grow
 * @param dialogTrigger Add ReactNode to use FileGrid as Dialog
 */
export const FileGrid = (props: FileGridProps) => {
    if (!props.dialogTrigger) {
        return <FileGridMain {...props} />
    } else if (props.dialogTrigger) {
        return (
            <Dialog>
                <DialogTrigger asChild>{props.dialogTrigger}</DialogTrigger>
                <DialogContent className="max-h-[80vh] overflow-scroll">
                    <DialogHeader>
                        <DialogTitle>Assets</DialogTitle>
                        <DialogDescription>
                            Lists all your asstes here, You could drag or click
                            to upload your file
                        </DialogDescription>
                    </DialogHeader>

                    <FileGridMain {...props} />

                    <DialogFooter></DialogFooter>
                </DialogContent>
            </Dialog>
        )
    }
}

const FileGridMain = ({
    files,
    onFileSelect,
    onFileUpdate,
    onFileDelete,
}: FileGridProps) => {
    const [fileState, setFileState] = useState<FileGridProps['files']>(files)
    const [filesUploaded, setFilesUploaded] = useState<
        ({ file: File } & FileMeta)[]
    >([])
    const isUploadActive = filesUploaded.length > 0

    const handleFileSelect = (file: File) => {
        onFileSelect?.(file)
    }

    const handleFileUpdate = (fileMeta: FileMeta) => {
        setFileState(prev => {
            return prev.map(file => {
                if (file.id === fileMeta.id) {
                    return { ...file, ...fileMeta }
                }
                return file
            })
        })
        onFileUpdate?.(fileMeta)
    }

    const handleFileDelete = (fileId: string) => {
        setFileState(prev => {
            return prev.filter(file => file.id !== fileId)
        })
        onFileDelete?.(fileId)
    }

    // TODO: DnD

    return (
        <div
            className={cn(
                'relative h-auto grow p-3 border-2 border-dashed rounded-xl'
                // isDragActive ? 'border-4 border-sky-600 dark:border-sky-600' : ''
            )}
        >
            <div
                className={cn(
                    'z-10 absolute h-full w-full inset-0 flex justify-center items-center bg-muted rounded-lg',
                    // isDragActive ? '' : 'hidden'
                    'hidden'
                )}
            >
                <CloudUploadIcon className="w-12 h-12 text-primary" />
            </div>
            {/* TODO: Fix when length < 5 the FileCard takes all the width and grows too wide */}
            {fileState.length > 0 ? (
                <div className="grid grid-cols-[repeat(auto-fit,minmax(120px,1fr))] gap-2">
                    {fileState.map((file, index) => {
                        return (
                            <FileCard
                                key={index}
                                file={file.file}
                                fileMeta={file}
                                onSelect={handleFileSelect}
                                onUpdate={handleFileUpdate}
                                onDelete={handleFileDelete}
                            />
                        )
                    })}
                </div>
            ) : (
                <div className="w-full h-full min-h-60 grow flex flex-col items-center justify-center gap-3 text-muted-foreground">
                    <CupSoda size={50} />
                    <p>
                        No file found, drag and drop, or click to select files
                        now
                    </p>
                    <Button size={'sm'}>
                        <CloudUploadIcon className="size-6" />
                        Upload now
                    </Button>
                </div>
            )}
        </div>
    )
}