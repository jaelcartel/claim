import React from 'react'
import Image from 'next/image';

export default function Footer() {
    return (
        <footer className="footer p-10 bg-neutral text-neutral-content">
            <div className='flex justify-center border-t-2 p-6'>
            <span>
            <a
                href="https://cardano.org"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                src="/cardano-logo.svg"
                alt="Cardano Logo"
                width={36}
                height={36}
                />
            </a>
            </span>
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
                width={36}
                height={36}
                />
            </a>
            </span>
            <div className='p-1' ></div>
            <span>
            <a
                href="https://theadadao.com"
                target="_blank"
                rel="noopener noreferrer"
            >
                <Image
                src="/adao-full-logo.svg"
                alt="Cardano Logo"
                width={36}
                height={36}
                />
            </a>
            </span>
            </div>
        </footer>
    )
}