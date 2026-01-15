# Assets Functionalities

We use AWS S3 SDK, so any compatible object storage providers will work, such as
AWS S3, Cloudflare R2. These functionalities handle file
**upload/update/delete**.

## Utils

### `generateStorageKey()` for file

Generate a uniformed key (file/path) for a file in the object storage.

### `fetchPresignedPutUrls()` from self

This calls resource route to generate a presigned URL for a new file. A
presigned URL allow anyone who owns it to access determined files, generated on
our side. You may want to refer to
[S3 Presigned Url](https://docs.aws.amazon.com/AmazonS3/latest/userguide/using-presigned-url.html).

### `useFileUpload()` hook for file upload

> Hook to get upload functions for files.

The easiest way to use is by utilizing `oneStepUpload` function:

```tsx
const { oneStepUpload } = useFileUpload()
const { data: userSession } = authClient.useSession()

const filesInput: File[] = []
const filesWithPresignedUrl = await oneStepUpload(
	filesInput,
	userSession.user.id,
)
```

If you need more control over the upload process:

1.  Generate key for file
2.  Initialize upload progress state
3.  Get presigned URLs
4.  uploadToPresignedUrl via XML and track uploadProgress
5.  Handle finished

```tsx
import { useFileUpload, fetchPresignedPutUrls } from './utils.ts'

const { prepareFiles, initUploadProcess, uploadToPresignedUrl } =
	useFileUpload()

// 1.
const preparedFiles = prepareFiles(filesInput, ownerId)

// 2.
initUploadProcess(preparedFiles)

// Request to self
let filesWithPresignedUrl
try {
	// 3. Now fetch presigned URLs (files will show as "pending" during this time), then upload
	filesWithPresignedUrl = await fetchPresignedPutUrls(preparedFiles)
} catch (error) {
	console.error('Error fetching presigned URLs:', error)
	return []
}

// 4. Request to presigned URLs
await uploadToPresignedUrl(filesWithPresignedUrl)

// 5. Handle finished
```

## File Components

### File Card

Display every single asset, with dialog on click, and delete/open button on
hover. Edit and save directly in the dialog via `useFetcher`.

### File Grid Main

The wrapper of `File Card`, handles drag n drop.

### File Grid

Another optional dialog wrapper over `File Grid Main`.
