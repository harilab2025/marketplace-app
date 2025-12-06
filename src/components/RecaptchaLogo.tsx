'use client';

import Image from "next/image";
import { useEffect, useState } from "react";

export function RecaptchaLogo() {
    const [hasRecaptcha, setHasRecaptcha] = useState(false);

    useEffect(() => {
        // Check if grecaptcha is available after component mounts
        if (typeof window !== 'undefined' && window.grecaptcha) {
            setHasRecaptcha(true);
        }
    }, []);

    // Only render on client side when grecaptcha is available
    if (!hasRecaptcha) {
        return null;
    }

    return (
        <div className="recaptcha-custom-logo select-none pointer-events-none flex justify-center flex-col items-center">
            <Image
                src="/logo/logo-recpatcha.png"
                className="w-[45px] h-[45px]"
                alt="Custom reCAPTCHA Logo"
                width={70}
                height={60}
            />
            <h3 className="text-[10px] text-center">
                reCAPTCHA
            </h3>
        </div>
    );
}