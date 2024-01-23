import Image from 'next/image';
import emil from 'public/emil.jpeg';

export const Footer = () => {
  return (
    <div className="flex justify-between gap-3 w-full items-center">
      <p className="flex items-center gap-3 m-0 text-sm">
        <Image alt="Emil's profile picture" src={emil} height={24} width={24} className="rounded-full" />
        <span>
          Made by{' '}
          <a
            className="font-semibold text-[inherit] no-underline hover:underline"
            href="https://twitter.com/emilkowalski_"
            target="_blank"
          >
            Emil.
          </a>
        </span>
      </p>
      <span className="text-sm">
        MIT {new Date().getFullYear()} ©{' '}
        <a href="/" target="_blank">
          Sonner
        </a>
      </span>
    </div>
  );
};
