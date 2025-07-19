import { useEffect } from "react";
import { useRouter } from "next/navigation";

"use client";


export default function Page() {
    const router = useRouter();

    useEffect(() => {
        // Save the language to localStorage (or any preferred storage)
        localStorage.setItem("language", "fr");
        // Redirect to parent "/"
        router.replace("/");
    }, [router]);

    // Optionally render nothing or a loading indicator
    return null;
}