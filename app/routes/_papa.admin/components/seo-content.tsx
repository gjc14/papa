import { Form, useFetcher } from '@remix-run/react'
import { Loader2, Save } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '~/components/ui/button'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '~/components/ui/dialog'
import { Input } from '~/components/ui/input'
import { Label } from '~/components/ui/label'
import { Textarea } from '~/components/ui/textarea'
import { isConventionalSuccess } from '~/lib/utils'
import { SeoLoaderType } from '~/routes/_papa.admin.seo/route'

export const SeoContent = ({
    seo,
    open,
    setOpen,
    action,
    method,
}: {
    seo?: SeoLoaderType
    open: boolean
    setOpen: React.Dispatch<React.SetStateAction<boolean>>
    action: string
    method: 'PUT' | 'POST'
}) => {
    const fetcher = useFetcher()
    const isSubmitting =
        fetcher.formAction === action && fetcher.state === 'submitting'

    useEffect(() => {
        if (
            fetcher.state === 'loading' &&
            isConventionalSuccess(fetcher.data)
        ) {
            setOpen(false)
        }
    }, [fetcher])

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] max-h-[90vh] overflow-scroll">
                <DialogHeader>
                    <DialogTitle>{seo ? 'Edit' : 'Create'} seo</DialogTitle>
                    <DialogDescription>
                        {seo ? 'Make changes of' : 'Create'} your route or post
                        seo here. You could edit in route or post as well.{' '}
                        {seo &&
                            `Last updated on ${new Date(
                                seo.updatedAt
                            ).toLocaleString('zh-TW')}`}
                    </DialogDescription>
                </DialogHeader>
                <Form
                    id="seo-content"
                    className="grid gap-4 py-4"
                    onSubmit={e => {
                        e.preventDefault()
                        fetcher.submit(new FormData(e.currentTarget), {
                            method,
                            action,
                        })
                    }}
                >
                    <input type="hidden" name="id" defaultValue={seo?.id} />

                    {(!seo || !seo.autoGenerated) && (
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="route" className="text-right">
                                Route
                            </Label>
                            <Input
                                id="route"
                                name="route"
                                className="col-span-3"
                                placeholder="What's your route?"
                            />
                        </div>
                    )}
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="metaTitle" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="metaTitle"
                            name="metaTitle"
                            defaultValue={seo?.metaTitle ?? undefined}
                            className="col-span-3"
                            placeholder="What's your title?"
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="metaDescription" className="text-right">
                            Description
                        </Label>
                        <Textarea
                            id="metaDescription"
                            name="metaDescription"
                            defaultValue={seo?.metaDescription ?? undefined}
                            rows={5}
                            className="col-span-3"
                            placeholder="Sentense that catch pedestrians' eye ball..."
                        />
                    </div>
                    <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="keywords" className="text-right">
                            Keywords
                        </Label>
                        <Textarea
                            id="keywords"
                            name="keywords"
                            defaultValue={seo?.keywords ?? undefined}
                            rows={2}
                            className="col-span-3"
                            placeholder="Keywords, separated by comma. E.g. papa, ERP, Colaborative Tool"
                        />
                    </div>
                </Form>
                <DialogFooter>
                    <Button form="seo-content" type="submit">
                        {isSubmitting ? (
                            <Loader2 size={16} className="animate-spin" />
                        ) : (
                            <Save size={16} />
                        )}
                        {seo ? 'Save changes' : 'Create'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
