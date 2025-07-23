"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";


export default function Page() {
    const router = useRouter();

    useEffect(() => {
        // Save the language to localStorage (or any preferred storage)
        localStorage.setItem("language", "en");
        // Redirect to parent "/"
        router.replace("/");
    }, [router]);

    // Optionally render nothing or a loading indicator
    return null;
}