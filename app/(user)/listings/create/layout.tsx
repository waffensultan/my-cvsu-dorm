import type { Metadata } from "next"

import { createClient } from "@/supabase/server"
import { redirect } from "next/navigation"

import { Fragment } from "react"

export const metadata: Metadata = {
    title: "MyCvSUDorm - Create Listing",
    authors: {
        name: "Waffen Sultan",
        url: "https://github.com/waffenffs"
    }
}

export default async function CreateListingsLayout({ children }: React.PropsWithChildren) {
    const supabase = createClient();

    const { data: userData } = await supabase.auth.getUser();
    if (userData.user === null) {
        return redirect('/login');
    }

    const { data: roleData } = await supabase
        .from('users')
        .select('role')
        .eq('id', userData.user.id)
        .single()
    if (roleData?.role !== "Owner") {
        return redirect('/listings/explore')
    }
    
    return (
        <Fragment>
            {children}
        </Fragment>
    )
}