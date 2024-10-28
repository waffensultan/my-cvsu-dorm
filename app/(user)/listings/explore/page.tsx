import { headers } from "next/headers";

import { buildFiltersApiRequestURL } from "@/lib/apiHelpers";

import { createClient } from "@/supabase/server"

import { Fragment } from "react";
import ListingsPage from "@/app/components/pages/listings-page";

/* 
    * STEP 1:
    1. Middleware attaches URL params from the user to headers

    * STEP 2:
    2. layout.tsx checks for any URL params in the headers sent by the middleware
    2.1.
    (if any url params were found AKA user applied filters)
    ----> layout.tsx makes a call to api/explore and receives filtered data
    (if there are no url params that were found (user did not apply any filter)
    ----> layout.tsx makes a call to api/explore and receives regular/unfiltered data

    * STEP 3:
    3. layout.tsx sends the received data from api/explore down to the client 

    * STEP 4:
    4. if the user applies filters:
    ----> we refresh/revalidate the path, forcing a re-fetch and we go back to STEP 1   
*/

export default async function Page() {
    const headersList = headers();
    const filters = headersList.get('filters')
    const parsedFilters = JSON.parse(filters ?? '');

    const filtersAreNotNull = Object.values(parsedFilters).some(value => 
        value !== null && 
        value !== undefined && 
        value !== ''
    );

    let listingsData;

    try {
        let response;

        if (filtersAreNotNull) {
            const callableApiURL = buildFiltersApiRequestURL(
                'http://localhost:3000/api/explore?', 
                parsedFilters
            );

            response = await fetch(callableApiURL);
        } else {
            response = await fetch(new URL('http://localhost:3000/api/explore').toString());
        }

        if (!response.ok) {
            throw new Error(`Failed to fetch data: ${response.status} ${response.statusText}`);
        }

        listingsData = await response.json();
    } catch (error) {
        console.error(error);
    }

    const supabase = createClient();
    const { data } = await supabase.auth.getUser();
    const { data: userRoleData } = await supabase
        .from('users')
        .select('role_initialized')
        .eq('id', data.user?.id)
        .single()

    return (
        <Fragment>
            <ListingsPage
                user={data?.user} 
                listings={listingsData?.data}
                role_initialized={userRoleData?.role_initialized} 
            />
        </Fragment>
    )
}