import React from 'react'
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer p-10 bg-neutral text-neutral-content">
            <div className='flex justify-center border-t-2 p-4'>

            <div className='p-1' ></div>
            <span>
            <a
                href="https://github.com/jaelcartel/claim"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                src="/CartelLogoWhite.svg"
                alt="Cartel Logo"
                width={40}
                height={40}
                />
            </a>
            </span>
            </div>
        </footer>
    )
}