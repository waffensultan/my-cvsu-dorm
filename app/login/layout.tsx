import { Fragment } from "react"

import type { Metadata } from "next"

export const metadata: Metadata = {
    title: "MyCvSUDorm - Login",
    authors: {
        name: "Waffen Sultan",
        url: "https://github.com/waffenffs"
    }
}

export default async function LoginLayout({ children }: React.PropsWithChildren) {
    return (
        <Fragment>
            {children}
        </Fragment>
    )
}