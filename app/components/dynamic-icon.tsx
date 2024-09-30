import { lazy, Suspense, useMemo } from 'react'
import { LucideProps } from 'lucide-react'
import dynamicIconImports from 'lucide-react/dynamicIconImports'

const fallback = <div style={{ background: '#ddd', width: 24, height: 24 }} />

interface IconProps extends Omit<LucideProps, 'ref'> {
    name: keyof typeof dynamicIconImports
}

export type IconOptions = IconProps['name']

const Icon = ({ name, ...props }: IconProps) => {
    const LucideIcon = useMemo(() => lazy(dynamicIconImports[name]), [name])

    return (
        <Suspense fallback={fallback}>
            <LucideIcon {...props} />
        </Suspense>
    )
}

export default Icon
