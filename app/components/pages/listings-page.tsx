'use client';

import type { User } from "@supabase/supabase-js"
import type { Tables } from "@/supabase/supabase/database.types";
import type {
    USER_ROLE,
    DORM_TYPE,
    AMENITY,
    GENDER_PREFERENCE,
    FILTERS
} from "@/app/lib/constants";

import { genderPreferenceIcon } from "@/app/lib/shared";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import {
    USER_ROLES, 
    DORM_TYPES,
    AMENITIES,
    GENDER_PREFERENCES
} from "@/app/lib/constants";
import { wait } from "@/app/lib/utils";

import { submit_role } from "@/app/(user)/listings/actions";
import { buildFiltersApiRequestURL } from "@/lib/apiHelpers";

import {
    UsersRound as UsersRoundIcon,
    Building2 as Building2Icon, 
    UserRound as UserRoundIcon,
    BookOpen as BookOpenIcon, 
    Filter as FilterIcon,
    Search as SearchIcon,
    Check as CheckIcon,
} from "lucide-react"

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Slider } from "@/components/ui/slider";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
    Drawer,
    DrawerClose,
    DrawerTrigger,
    DrawerContent,
    DrawerTitle,
    DrawerDescription,
    DrawerHeader,
    DrawerFooter,
} from "@/components/ui/drawer"

type ListingsPageProps = {
    user: User | null;
    role_initialized: Tables<'users'>['role_initialized'];
    listings: Tables<'listings'>[];
}

export default function ListingsPage({ user, role_initialized, listings }: ListingsPageProps) {
    console.log("From the client: ", listings)

    // dialog states 
    const [showRoleDialog, setShowRoleDialog] = useState<boolean | undefined>();
    const [submittedRole, setSubmittedRole] = useState<boolean | undefined>(undefined);
    const [selectedRole, setSelectedRole] = useState<USER_ROLE | undefined>(undefined);

    // query/filter states 
    const [search, setSearch] = useState("");
    const [selectedRoleDormType, setSelectedDormType] = useState<DORM_TYPE | undefined>(undefined);
    const [selectedGenderPreference, setSelectedGenderPreference] = useState<GENDER_PREFERENCE | undefined>(undefined);
    const [selectedAmenities, setSelectedAmenities] = useState<AMENITY[]>([]);
    const [selectedRooms, setSelectedRooms] = useState(1);
    const [priceRange, setPriceRange] = useState([1000, 3500]);

    useEffect(() => {
        if (!showRoleDialog) {
            wait(1000).then(() => setShowRoleDialog(true));
        }

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const router = useRouter();

    const handleApplyFilter = () => {
        const filters: FILTERS = {
            dorm_type: selectedRoleDormType?.trim().toLowerCase(),
            gender_pref: selectedGenderPreference?.trim().toLowerCase(),
            amenities: selectedAmenities?.map((amenity) => amenity.toLowerCase()).join(','),
            pricing: priceRange.map((price) => price.toString()).join(','),
            rooms: selectedRooms?.toString()
        }

        const callableApiURL = buildFiltersApiRequestURL(
            'http://localhost:3000/listings/explore?',
            filters
        )

        router.push(callableApiURL.toString());
        router.refresh();
    }

    const handleRoleSubmit = async () => {
        if (selectedRole === undefined) {
            return toast.error('Please choose a role!')
        }
        if (user === null) {
            return toast.error('User does not exist!')
        }

        try {
            await submit_role(selectedRole, user.id);
            setSubmittedRole(true);
        } catch (error) {
            if (error instanceof Error) {
                toast.error(error.message);
            }
        }
    }

    return (
        <main className="bg-muted overflow-auto w-full h-screen">
            <div className="md:hidden w-full flex justify-center items-center py-5">
                <div className="bg-background rounded-[var(--radius)] p-4 w-4/5 flex flex-row items-center shadow">
                    <Input
                        searchIcon={SearchIcon}
                        className="w-11/12"
                        placeholder="Enter dorm name here..."
                        value={search}
                        onChange={(event) => setSearch(event.target.value)}
                    />
                    <Drawer>
                        <DrawerTrigger className="flex-grow flex justify-center items-center">
                            <FilterIcon />
                        </DrawerTrigger>
                        <DrawerContent>
                            <ScrollArea className="overflow-auto px-5 h-[55rem] md:hidden">
                                <DrawerHeader>
                                    <DrawerTitle>Filter Dorms</DrawerTitle>
                                    <DrawerDescription>You can filter and search for your dream dorms here.</DrawerDescription>
                                </DrawerHeader>
                                <div className="flex flex-col gap-3 pt-5">
                                    <DrawerTitle>Dorm Type</DrawerTitle>
                                    <div className="w-full flex justify-between items-center gap-4">
                                        {DORM_TYPES.map((type) => (
                                            <div
                                                key={type}
                                                className={`
                                                    w-1/2 h-24 transition duration-150 cursor-pointer flex flex-col gap-2 justify-center items-center rounded-[var(--radius)]
                                                    ${selectedRoleDormType === type ? 'bg-primary text-white shadow-xl' : 'border border-border'}
                                                `}
                                                onClick={() => setSelectedDormType(type)}
                                            >
                                                {type === "Shared" ? <UsersRoundIcon /> : <UserRoundIcon />}
                                                <h1>{type}</h1>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pt-5">
                                    <DrawerTitle>Tenant Gender Preference</DrawerTitle>
                                    <div className="w-full flex justify-evenly items-center gap-5">
                                        {GENDER_PREFERENCES.map((pref) => (
                                            <div 
                                                key={pref} 
                                                className={`
                                                    flex flex-row justify-center items-center gap-1 flex-grow py-1 transition duration-150 rounded-[var(--radius)]
                                                    ${selectedGenderPreference === pref ? 'bg-primary text-white shadow-xl' : 'border border-border'}
                                                `}
                                                onClick={() => setSelectedGenderPreference(pref)}
                                            >
                                                {genderPreferenceIcon[pref]}
                                                <span>{pref}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 pt-7">
                                    <DrawerTitle>Amenities</DrawerTitle>
                                    <div className="grid grid-cols-2 gap-3">
                                        {AMENITIES.map((amenity) => (
                                            <div 
                                                key={amenity} 
                                                className="flex flex-row items-center gap-2"
                                            >
                                                <Checkbox 
                                                    id={amenity}
                                                    checked={selectedAmenities.includes(amenity)}
                                                    onCheckedChange={(checked) => {
                                                        return checked
                                                        ?
                                                        setSelectedAmenities(prevState => [...prevState, amenity])
                                                        :
                                                        setSelectedAmenities(prevState => {
                                                            const updatedAmenities = prevState.filter((thisAmenity) => thisAmenity !== amenity);

                                                            return updatedAmenities;
                                                        })
                                                    }}
                                                />
                                                <label htmlFor={amenity}>{amenity}</label>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                                <div className="flex flex-col gap-5 pt-10">
                                    <DrawerTitle>Price Range</DrawerTitle>
                                    <Slider 
                                        defaultValue={priceRange} 
                                        onValueChange={(value) => setPriceRange([...value])}
                                        max={9999}
                                        min={0}
                                        step={250}
                                    />
                                    <section className="w-full flex flex-row justify-center items-center gap-10">
                                        <div className="flex flex-col gap-1 text-center">
                                            <Input 
                                                value={priceRange[0]} 
                                                disabled
                                                className="w-32"
                                            />
                                            <label className="text-muted-foreground font-semibold">Min</label>
                                        </div>
                                        <div className="flex flex-col gap-1 text-center">
                                            <Input 
                                                value={priceRange[1]}
                                                disabled
                                                className="w-32"
                                            />
                                            <label className="text-muted-foreground font-semibold">Max</label>
                                        </div>
                                    </section>
                                </div>
                                <div className="flex flex-col gap-5 pt-10">
                                    <DrawerTitle>Rooms</DrawerTitle>
                                    <div className="w-full flex flex-row justify-around items-center gap-3">
                                        {[1, 2, 3, 4, 5].map((number) => (
                                            <div 
                                                key={number}
                                                className={`
                                                    w-1/2 h-14 transition duration-150 cursor-pointer flex flex-col gap-2 justify-center items-center rounded-[var(--radius)] border font-semibold 
                                                    ${selectedRooms === number ? 'bg-primary text-white shadow-xl' : 'border-border'}
                                                `}
                                                onClick={() => setSelectedRooms(number)}
                                            >{number}</div>
                                        ))}
                                    </div>
                                </div>
                                <DrawerFooter className="pt-14 flex flex-col gap-3">
                                    <Button onClick={(event) => {
                                        event.preventDefault();
                                        handleApplyFilter();
                                    }}>Apply Filters</Button>
                                    <DrawerClose asChild>
                                        <Button variant={"outline"}>Close</Button>
                                    </DrawerClose>
                                </DrawerFooter>
                            </ScrollArea>
                        </DrawerContent>
                    </Drawer>
                </div>
            </div>
            <Dialog 
                open={!role_initialized && user !== null && !submittedRole && showRoleDialog}
                onOpenChange={(showRoleDialog) => {
                    if (!showRoleDialog) {
                        setShowRoleDialog(false);
                    }
                }}
            >
                <DialogContent 
                    onInteractOutside={(e) => e.preventDefault()}
                    className="[&>button]:hidden w-5/6 rounded-[var(--radius)] flex flex-col gap-10"
                >
                    <DialogHeader>
                        <DialogTitle>Welcome to Dormie!</DialogTitle>
                        <DialogDescription>What&apos;s your role as a user?</DialogDescription>
                    </DialogHeader>
                    <section className="flex flex-row items-center gap-2">
                        {USER_ROLES.map((role) => (
                            <div
                                key={role}
                                className={`
                                    w-1/2 h-32 transition duration-150 cursor-pointer flex flex-col gap-2 justify-center items-center rounded-[var(--radius)] border 
                                    ${selectedRole === role ? 'bg-primary text-white shadow-xl' : 'border-border'}
                                `}
                                onClick={() => setSelectedRole(role)}
                            >
                                {role === "Owner" ? <Building2Icon /> : <BookOpenIcon />}
                                <h1>{role}</h1>
                            </div>
                        ))}
                    </section>
                    <DialogFooter className="flex flex-row items-center">
                        <DialogDescription>Please choose one.</DialogDescription>
                        <Button 
                            className="flex flex-row items-center gap-1" 
                            onClick={() => handleRoleSubmit()}
                        >
                            <CheckIcon />
                            Complete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </main>
    )
}
