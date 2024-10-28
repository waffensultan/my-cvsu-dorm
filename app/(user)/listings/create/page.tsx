'use client';

import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { genderPreferenceIcon } from "@/app/lib/shared";

import { useState, useEffect, Fragment } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { useDropzone } from "react-dropzone";

import imageCompression from "browser-image-compression";

import { AMENITIES, GENDER_PREFERENCES } from "@/app/lib/constants";
import { uploadListing } from "./actions";

import {
    BadgeMinus as BadgeMinusIcon,
    LoaderCircle as LoadingIcon,
    CircleHelp as QuestionMark,
    BadgeX as BadgeXIcon,
    Upload as UploadIcon,
    Pencil as PencilIcon,
    Check as CheckIcon,
    Plus as PlusIcon,
    X as XIcon
} from "lucide-react";

import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandInput,
    CommandList,
    CommandItem,
} from "@/components/ui/command"
import {
    Form,
    FormControl,
    FormField,
    FormDescription,
    FormItem,
    FormLabel,
    FormMessage
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger
} from "@/components/ui/tooltip"
import {
    Popover,
    PopoverContent,
    PopoverTrigger
} from "@/components/ui/popover"
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";

const dormSchema = z.object({
    type: z
        .string()
        .refine((val) => val === "Private" || val === "Shared", 
        { message: "Invalid type." }
    ),
    gender_preference: z
        .string()
        .refine((val) => val === "Female Only" || val === "Male Only" || val === "Both",
        {message: "Invalid gender preference."}
    ),
    monthly_price: z.coerce.number().max(9999),
    location: z.string().trim().optional(),
    rooms: z
        .array(
            z.object({
                name: z.string().trim(),
                total_beds: z.coerce.number().int(),
                occupied_beds: z.coerce.number().int(),
            }).refine((props) => 
                props.occupied_beds <= props.total_beds, 
                { message: "Occupied beds can't exceed total beds." }
            )
        ).nonempty({ message: "A dorm must at least have one room." }),
    amenities: z
        .string()
        .array()
        .nonempty({ message: "At least one amenity must be included." }),
    other_conveniences: z
        .array(
            z.object({
                title: z.string().trim().min(4, { message: "Convenience is too short." })
            })
        ).optional(),
    title: z
        .string()
        .trim()
        .min(6, { message: "Title is too short." }),
    description: z.string().trim(),
})
export type DormSchema = z.infer<typeof dormSchema>;

export default function CreateListings() {
    const { getRootProps, getInputProps, acceptedFiles } = useDropzone({
        noDrag: true,
        accept: {
            'image/png': ['.png', '.jpg']
        },
        maxFiles: 3
    })

    const [pending, setPending] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [changeDormName, setChangeDormName] = useState("");
    const [convenienceInput, setConvenienceInput] = useState("");
    // RHF's (react-hook-form) acceptedFiles property is immutable
    // Our imageFiles state is a workaround for us to be able mutate it
    const [imageFiles, setImageFiles] = useState<typeof acceptedFiles>([]);

    useEffect(() => {
        setImageFiles([...acceptedFiles]);
    }, [acceptedFiles])

    const form = useForm<DormSchema>({
        resolver: zodResolver(dormSchema),
        defaultValues: {
            type: "Shared",
            monthly_price: 0,
            rooms: [{ 
                name: "Room 1",
                total_beds: 0, 
                occupied_beds: 0
            }],
        }
    })

    const { control, formState: { errors } } = form;

    const { fields: roomFields, append: appendRoom, remove: removeRoom, update: updateRoom } = useFieldArray({
        control,
        name: "rooms"
    })
    const { append: appendConvenience, remove: removeConvenience } = useFieldArray({
        control,
        name: "other_conveniences"
    })

    async function onSubmit(values: DormSchema) {
        if (imageFiles.length >= 1) {
            setPending(true);

            try {
                const formData = new FormData();

                const imageCompressionOptions = {
                    maxSizeMB: 1,
                    maxWidthOrHeight: 1920,
                }

                for (const file of imageFiles) {
                    const compressedImage = await imageCompression(file, imageCompressionOptions);
                    formData.append('images', compressedImage, compressedImage.name);
                }

                const result = await uploadListing({...values}, formData);
                if (result.success) {
                    toast.success("Successfully created a dorm listing! We are shortly redirecting you...")
                    // We have to do this manually because RHF is the worst library of all time
                    form.reset({
                        type: "Shared",
                        monthly_price: 0,
                        location: "",
                        gender_preference: undefined,
                        amenities: [],
                        rooms: [{
                            name: "Room 1",
                            total_beds: 0,
                            occupied_beds: 0
                        }],
                        other_conveniences: undefined,
                        title: "",
                        description: ""
                    })
                    setImageFiles([]);
                    setSubmitted(true);
                }
            } catch (error) {
                if (error instanceof Error) {
                    toast.error(error.message)
                }
            } finally {
                setPending(false);
            }
        } else {
            toast.error('Expected at least more than 1 attached image file')
        }
    }

    return (
        <main className="bg-gradient-to-br from-green-400 to-green-700 text-foreground flex justify-center items-center w-full h-full py-10">
            <Form {...form}>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="md:w-1/2 bg-background p-10 rounded-[var(--radius)] border border-border shadow-md flex flex-col gap-5"
                >
                    <div className="w-full grid grid-cols-2 gap-5">
                        <FormField 
                            control={form.control}
                            name="type"
                            render={({ field }) => (
                                <FormItem className="mt-1">
                                    <section className="flex flex-row items-center gap-2">
                                        <FormLabel>Dorm Type</FormLabel>
                                        <TooltipProvider>
                                            <Tooltip>
                                                <TooltipTrigger>
                                                    <QuestionMark className="w-5 text-muted-foreground" />
                                                </TooltipTrigger>
                                                <TooltipContent className="bg-secondary text-foreground max-w-xs">
                                                    A private dorm means that each room will only house a single tenant. These are rare thus shared dorms are the default option.
                                                </TooltipContent>
                                            </Tooltip>
                                        </TooltipProvider>
                                    </section>
                                    <Select
                                        onValueChange={field.onChange}
                                        {...field}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="Shared">Shared Dorm</SelectItem>
                                            <SelectItem value="Private">Private Dorm</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField 
                            control={form.control}
                            name="monthly_price"
                            render={({ field }) => (
                                <FormItem className="mt-1">
                                    <FormLabel>Monthly Price</FormLabel>
                                    <FormControl>
                                        <Input
                                            type="number"
                                            min={0}
                                            {...field}
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                    </div>
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-2">
                                <div className="flex flex-row items-center gap-1">
                                    <FormLabel>Location</FormLabel>
                                    <FormDescription>(Optional)</FormDescription>
                                </div>
                                <Input
                                    type="text"
                                    {...field}
                                />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="gender_preference"
                        render={({ field }) => (
                            <FormItem className="flex flex-col gap-2">
                                <FormLabel>Tenant Gender Preference</FormLabel>
                                <div aria-label="Gender Preference" className="flex flex-row justify-evenly items-center gap-3">
                                    {GENDER_PREFERENCES.map((pref) => (
                                        <div
                                            key={pref}
                                            role="button"
                                            aria-pressed={field.value === pref}
                                            className={`
                                                py-1 flex-grow flex flex-row items-center justify-center gap-1 transition duration-150 border border-border rounded-[var(--radius)]
                                                ${field.value === pref && 'bg-primary text-white shadow-xl'}
                                            `}
                                            onClick={() => field.onChange(pref)}
                                        >
                                            {genderPreferenceIcon[pref]}
                                            <span>{pref}</span>
                                        </div>
                                    ))}
                                </div>
                            </FormItem>
                        )}
                    />
                    <Label>Rooms</Label>
                    <div className="flex flex-col gap-4 items-center rounded-[var(--radius)] border border-border p-6 bg-muted">
                        {roomFields.map((field, index) => (
                            <article 
                                key={field.id}
                                className="w-full p-3 border border-border rounded-[var(--radius)] shadow-md bg-background"
                            >
                                <h3 className="text-md font-medium leading-none flex justify-between items-center w-full">
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <div className="cursor-pointer mb-2 flex flex-row items-center gap-2">
                                                <span>{field.name}</span>
                                                <PencilIcon size={20} />
                                            </div>
                                        </PopoverTrigger>
                                        <PopoverContent className="flex flex-col gap-3">
                                            <section className="flex flex-col gap-2">
                                                <Label>Previous Name</Label>
                                                <Input 
                                                    disabled 
                                                    value={field.name || `Room ${index + 1}`} 
                                                />
                                            </section>
                                            <section className="flex flex-col gap-2">
                                                <Label>Change Name</Label>
                                                <Input 
                                                    value={changeDormName}
                                                    onChange={(e) => setChangeDormName(e.target.value)}
                                                />
                                            </section>
                                            <Button 
                                                onClick={(event) => {
                                                    event.preventDefault();
                                                    updateRoom(index, {
                                                        ...field,
                                                        name: changeDormName,
                                                    })
                                                    setChangeDormName("");
                                                }}
                                                className="flex-grow self-end mt-5"
                                            >Submit Changes</Button>
                                        </PopoverContent>
                                    </Popover>
                                    {roomFields.length > 1 && (
                                        <BadgeMinusIcon 
                                           onClick={(e) => {
                                            e.preventDefault();
                                            removeRoom(index);
                                           }}
                                           className="hover:cursor-pointer hover:text-red-500 transition duration-300"
                                        />
                                    )}
                                </h3>
                                <Separator className="my-2" />
                                <div className="w-full flex justify-row gap-5 items-center">
                                    <FormField
                                        control={form.control}
                                        name={`rooms.${index}.total_beds`}
                                        render={({ field }) => (
                                            <FormItem className="w-1/2">
                                                <FormLabel>Total Beds</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        min={0}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name={`rooms.${index}.occupied_beds`}
                                        render={({ field }) => (
                                            <FormItem className="w-1/2">
                                                <FormLabel>Occupied beds</FormLabel>
                                                <FormControl>
                                                    <Input 
                                                        type="number" 
                                                        min={0}
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <FormMessage>
                                    {errors.rooms?.[index]?.occupied_beds?.message || errors.rooms?.[index]?.total_beds?.message}
                                </FormMessage>
                            </article>
                        ))}
                        <Button 
                            onClick={(e) => {
                                e.preventDefault();
                                appendRoom({
                                    name: `Room ${roomFields.length + 1}`,
                                    total_beds: 0,
                                    occupied_beds: 0
                                })
                            }}
                            className="flex flex-row items-center gap-1 self-end"
                        >
                            <span>Add Room</span>
                            <PlusIcon />
                        </Button>
                    </div>
                    <FormField 
                        control={form.control}
                        name="amenities"
                        render={({ field }) => (
                            <FormItem>
                                <FormLabel>Amenities</FormLabel>
                                <div className="flex flex-col md:flex-row md:flex-wrap gap-2">
                                    {Array.isArray(field.value) && (
                                        field.value?.map((amenity) => (
                                            <div 
                                                key={amenity}
                                                className="hover:cursor-default self-start flex flex-row gap-2 items-center rounded-[var(--radius)] border border-border py-1 px-3 text-sm font-semibold tracking-wide hover:bg-muted transition duration-300"
                                            >
                                                <span>Includes {amenity}</span>
                                                <XIcon 
                                                    className="hover:cursor-pointer hover:text-red-500"
                                                    onClick={() => {
                                                        const filteredAmenities = field.value?.filter((thisAmenity) => thisAmenity !== amenity);
                                                        field.onChange(filteredAmenities);
                                                    }}
                                                    size={15} 
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                                <div className="flex flex-row w-full rounded-[var(--radius)] border border-border p-4 overflow-x-auto">
                                    <Command>
                                        <CommandInput placeholder="Enter an amenity here..." />
                                        <CommandList>
                                            <CommandEmpty>No such amenities found.</CommandEmpty>
                                            {AMENITIES.map((amenity) => !field.value?.includes(amenity) && 
                                                 <CommandItem 
                                                    key={amenity}
                                                    value={amenity}
                                                    onSelect={(currentValue) => {
                                                        if (Array.isArray(field.value)) {
                                                            const selectedAmenities = [...field.value, currentValue];
                                                            field.onChange(selectedAmenities);
                                                        } else {
                                                            // Initialize so we can map over field.value
                                                            field.onChange([currentValue]);
                                                        }
                                                    }}
                                                >{amenity}</CommandItem>                                       
                                            )}
                                        </CommandList>
                                    </Command>
                                </div>
                                <FormDescription>What amenities does your dorm include? Please select from our available options.</FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="other_conveniences"
                        render={({ field }) => (
                            <FormItem>
                                <div className="flex flex-row items-center gap-1">
                                    <FormLabel>Other Conveniences</FormLabel>
                                    <FormDescription>(Optional)</FormDescription>
                                </div>
                                <section className="min-h-32 border border-border rounded-[var(--radius)] flex flex-col p-3 justify-start gap-2">
                                    {(field.value?.length === 0 || field.value === undefined) ? (
                                        <div className="w-full h-full flex justify-center">
                                            <h3 className="text-muted-foreground font-semibold">Empty. You can add some!</h3>
                                        </div>
                                    ) : (
                                        field.value?.map((convenience, index) => (
                                            <Fragment key={convenience.title}>
                                                <div className="w-full flex flex-row items-center gap-3 text-sm">
                                                    <span className="font-semibold">{index + 1}.</span>
                                                    <p>{convenience.title}</p>
                                                    <Button
                                                        className="ml-auto"
                                                        variant={"destructive"}
                                                        size={"icon"}
                                                        onClick={(event) => {
                                                            event.preventDefault()
                                                            removeConvenience(index)
                                                        }}
                                                    >
                                                        <XIcon />
                                                    </Button>
                                                </div>
                                                {index !== field.value?.length && <Separator />}
                                            </Fragment>
                                        ))
                                    )}
                                </section>
                                <div className="flex flex-row items-center gap-3">
                                    <Input 
                                        type="text"
                                        placeholder="E.g. Allows cooking"
                                        value={convenienceInput}
                                        onChange={(event) => setConvenienceInput(event.target.value)}
                                    />
                                    <Button
                                        onClick={(event) => {
                                            event.preventDefault()
                                            if (convenienceInput.trim().length <= 4) {
                                                return toast.error("Convenience item is too short.")
                                            }
                                            appendConvenience({ title: convenienceInput })
                                            setConvenienceInput("");
                                        }}
                                    >
                                        <PlusIcon />
                                    </Button>
                                </div>
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                            <FormItem className="mt-1 flex-grow">
                                <FormLabel>Dorm Name</FormLabel>
                                <FormControl>
                                    <Input
                                        type="text"
                                        min={0}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    The name for your dorm should be concise.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField 
                        control={form.control}
                        name="description"
                        render={({ field }) => (
                            <FormItem className="mt-1 flex-grow">
                                <FormLabel>Dorm Description</FormLabel>
                                <FormControl>
                                    <Textarea
                                        className="resize-none"
                                        rows={15}
                                        {...field}
                                    />
                                </FormControl>
                                <FormDescription>
                                    Let them know more about your dorm like the rules, curfews, etc.
                                </FormDescription>
                                <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormItem>
                        <FormLabel>Images</FormLabel>
                        <section {...getRootProps({ className: 'border border-border flex flex-col gap-2 justify-center items-center py-5 text-muted-foreground cursor-pointer' })}>
                            <Input {...getInputProps()} />
                            <UploadIcon />
                            <span>Click here to select your image files</span>
                        </section>
                        <FormDescription>Please attach at least 1 image file.</FormDescription>
                    </FormItem>
                    <Label>Preview</Label>
                    <section className="border border-border flex flex-col gap-7 justify-center items-center p-5 text-muted-foreground">
                        {imageFiles.map((file, index) => {
                            const handleDeletion = (e: React.MouseEvent) => {
                                e.preventDefault();
                                setImageFiles(prevState => prevState.filter((i) => i.path !== file.path))
                            }

                            return (
                                <div 
                                    key={index} 
                                    className="relative z-0"
                                >
                                    <img 
                                        className="rounded-[var(--radius)] w-full h-full"
                                        src={URL.createObjectURL(file)} 
                                    />
                                    <Button 
                                        className="rounded-full absolute -top-2 -right-3"
                                        onClick={(e) => handleDeletion(e)} 
                                        variant={"destructive"}
                                    >
                                        <BadgeXIcon />
                                    </Button>
                                </div>
                            )
                        })}
                    </section>
                    <div className="flex flex-col mt-8">
                        <div className={`flex-grow self-end ${submitted && "hover:cursor-not-allowed"}`}>
                            <Button 
                                className="flex flex-row gap-1 items-center transition duration-300"
                                type="submit"
                                disabled={pending || submitted}
                            >
                                {pending && <LoadingIcon className="animate-spin w-5" />}
                                {submitted && <CheckIcon />}
                                Submit Dorm
                            </Button>
                        </div>
                    </div>
                </form>
            </Form>
        </main>
    )
}